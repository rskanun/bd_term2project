const express = require("express");
const router = express.Router();
const fs = require('fs');
const faker = require('faker');
const {RentalHistory} = require("../models/rentalHistroy");
const {Accommodation} = require("../models/accommodation");
const {Guest} = require("../models/guest");

router.post("/initRental", async (req, res) => {
    const fileName = "./accomInitFile.txt";
    fs.readFile(fileName, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ message: "server error!" });
        }

        const names = data.trim().split('\r\n');
        
        for (const name of names) {
            try {
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
            } catch (e) {
                console.error(e);
                return res.status(500).json({ message: "server error!" });
            }
        }
        
        return res.status(200).json({ message: "추가 완료" });
    });
})

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
        totalPrice: getTotalPrice({checkInDate, checkOutDate, weekdayPrice, weekendPrice})
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