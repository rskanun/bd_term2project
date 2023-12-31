const express = require("express");
const router = express.Router();
const fs = require('fs');
const faker = require('faker');
const util = require('util');
const mongoose = require("mongoose");
const readFileAsync = util.promisify(fs.readFile);
const {RentalHistory} = require("../models/rentalHistroy");
const {Accommodation} = require("../models/accommodation");
const {Guest} = require("../models/guest");

router.post("/initRental", async (req, res) => {
    const fileName = "./accomInitFile.txt";
    try {
        const data = await readFileAsync(fileName, 'utf8');
        const names = data.trim().split('\r\n');
        
        await Promise.all(names.map(async (name) => {
            const accom = await Accommodation.findOne({ name });
                let dummyDatas = [];
    
                if (accom) {
                    for (let i = 0; i < 5; i++) {
                        const guest = await Guest.aggregate([{ $sample: { size: 1 } }]);

                        const dummyData = generateDummyData({
                            id: accom._id,
                            guestId: guest[0]._id,
                            maxCapacity: accom.maxCapacity,
                            weekdayPrice: accom.weekdayPrice,
                            weekendPrice: accom.weekendPrice
                        });
    
                        dummyDatas.push(dummyData);
                    }

                    await RentalHistory.create(dummyDatas);
                }
        }));
        
        return res.status(200).json({ message: "추가 완료" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "server error!" });
    }
})

router.get("/getMyHistory/:guestId", async (req, res) => {
    try {
        const id = new mongoose.Types.ObjectId(req.params.guestId);

        const rentals = await RentalHistory.aggregate([
            {
                $match: {
                    guestId: id,
                    isCanceled: false
                },
            },
            {
                $lookup: {
                    from: "reviews",
                    let: { rentalId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$rentalId", "$$rentalId"],
                                },
                            },
                        },
                    ],
                    as: "review",
                },
            },
            {
                $match: {
                    "review": { $eq: [] },
                },
            },
            {
                $lookup: {
                    from: "accommodations",
                    localField: "accommodationId",
                    foreignField: "_id",
                    as: "accommodation",
                },
            },
            {
                $match: {
                    "accommodation.type": "개인",
                },
            },
        ]);

        if(rentals.length > 0) {
            return res.status(200).json(rentals);
        } else {
            return res.status(404).json({ message: "해당 회원의 예약 내역을 찾을 수 없습니다!" })
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "server error!" });
    }
});

router.patch("/cancelRental/:rentalId", async (req, res) => {
    try {
        const rentalId = new mongoose.Types.ObjectId(req.params.rentalId);

        const findRental = await RentalHistory.findById(rentalId);

        if(findRental) {
            findRental.isCanceled = true;
            await findRental.save();

            return res.status(200).json({ message: "취소 성공" });
        }
        else {
            return res.status(404).json({ message: "찾을 수 없는 예약입니다!" });
        }

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "server error!" });
    }
});

router.post("/createRental", async (req, res) => {
    const { accommodationId, guestId, checkInDate, checkOutDate, personnel } = req.body;

    try {
        const accommodation = await Accommodation.findById(accommodationId);
        if (!accommodation) {
            return res.status(404).json({ message: "숙소를 찾을 수 없습니다." });
        }

        const totalPrice = getTotalPrice({
            checkInDate,
            checkOutDate: new Date(checkOutDate).setDate(new Date(checkOutDate).getDate() + 1),
            weekdayPrice: accommodation.weekdayPrice,
            weekendPrice: accommodation.weekendPrice,
        });

        const rentalData = {
            accommodationId,
            guestId,
            checkInDate,
            checkOutDate,
            personnel,
            totalPrice,
        };

        const rentalHistory = await RentalHistory.create(rentalData);

        return res.status(200).json({ message: "RentalHistory 생성 완료", rentalHistory });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "서버 오류!" });
    }
});

router.get("/findRentalHistory", async (req, res) => {
    const { guestId, findType } = req.query;

    try {
        let rentalHistory;

        if (findType === "type_whole") {
            rentalHistory = await RentalHistory.find({ guestId });
        } else if (findType === "type_booking") {
            rentalHistory = await RentalHistory.find({ guestId, checkInDate: { $gt: new Date() } });
        } else if (findType === "type_finished") {
            rentalHistory = await RentalHistory.find({ guestId, checkOutDate: { $lt: new Date() } });
        } else {
            return res.status(400).json({ message: "잘못된 findType 값입니다." });
        }

        return res.status(200).json({ rentalHistory });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "서버 오류!" });
    }
});

router.get("/getRentalDetail/:accomId", async (req, res) => {
    const { accomId } = req.params;
    try {
        const rental = await RentalHistory.find({accommodationId: accomId});
        return res.status(200).json({ rental });

    }catch (e) {
        console.log("에러 발생 " + e);
    }
});

const generateDummyData = ({id, guestId, maxCapacity, weekdayPrice, weekendPrice}) => {
    const startDate = new Date('2023-12-01');
    const endDate = new Date('2023-12-31');
    const stayDuration = faker.datatype.number({ min: 2, max: 7 });

    const checkInDate = faker.date.between(startDate, endDate);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + stayDuration);

    return {
        accommodationId: id,
        guestId,
        checkInDate,
        checkOutDate,
        personnel: faker.datatype.number({ min: 1, max: maxCapacity }),
        totalPrice: getTotalPrice({checkInDate, checkOutDate, weekdayPrice, weekendPrice}),
        isCanceled: false
    };
};

const getTotalPrice = ({checkInDate, checkOutDate, weekdayPrice, weekendPrice}) => {
    let totalPrice = 0;
    for (let date = new Date(checkInDate); date < checkOutDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      totalPrice += (dayOfWeek >= 1 && dayOfWeek <= 4) ? weekdayPrice : weekendPrice;
    }

    return totalPrice;
}

module.exports = router;