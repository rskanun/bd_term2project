const express = require("express");
const router = express.Router();
const fs = require('fs');
const faker = require('faker');
const { Accommodation } = require("../models/accommodation");
const { RentalHistory } = require("../models/rentalHistroy");

router.get("/findAccoms/:checkOut/:checkIn/:personnel/:type", async (req, res) => {
    const { checkOut, checkIn, personnel, type } = req.params;
    try {
        const overlappingRentalHistories = await RentalHistory.find({
            $or: [
                { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
                { checkInDate: { $gte: checkIn, $lt: checkOut } },
                { checkOutDate: { $gt: checkIn, $lte: checkOut } },
            ]
        });

        const occupiedAccommodationIds = overlappingRentalHistories.map(
            (history) => history.accommodationId
        );

        const accoms = await Accommodation.find({
            $and: [
                { type },
                { maxCapacity: { $gte: personnel } },
                { _id: { $nin: occupiedAccommodationIds } },
            ],
        });

        return res.status(200).json(accoms);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "server error!" });
    }
});

router.post("/initAccom", async (req, res) => {
    const fileName = "./accomInitFile.txt";
    fs.readFile(fileName, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        const names = data.trim().split('\r\n');

        names.forEach(async (name, index) => {
            const existingAccommodation = await Accommodation.findOne({ name });

            if (!existingAccommodation) {
                const dummyData = generateDummyData(name, index);
                try {
                    await Accommodation.create(dummyData);
                } catch (e) {
                    console.error(e);
                    return res.status(500).json({ message: "server error!" });
                }
            }
        });

        return res.status(200).json({ message: "추가 완료" });
    });
})

router.get("/getTotalPrice/:checkInDate/:checkOutDate", async (req, res) => {
    try {
        const {checkInDate, checkOutDate} = req.params;
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "server error!" });
    }

});

const getTotalPrice = ({checkInDate, checkOutDate, weekdayPrice, weekendPrice}) => {
    let totalPrice = 0;
    for (let date = new Date(checkInDate); date < checkOutDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      totalPrice += (dayOfWeek >= 1 && dayOfWeek <= 4) ? weekdayPrice : weekendPrice;
    }

    return totalPrice;
}

const generateDummyData = (name, index) => {
    return {
        name: name,
        type: index % 2 === 0 ? '개인' : '전체',
        address: faker.address.streetAddress(),
        introduction: faker.lorem.paragraph(),
        amenities: faker.lorem.sentence(),
        bedroomNum: faker.datatype.number({ min: 1, max: 5 }),
        bedNum: faker.datatype.number({ min: 1, max: 10 }),
        bathroomNum: faker.datatype.number({ min: 1, max: 3 }),
        maxCapacity: faker.datatype.number({ min: 1, max: 20 }),
        weekdayPrice: faker.datatype.number({ min: 5, max: 20 }) * 10000,
        weekendPrice: faker.datatype.number({ min: 10, max: 30 }) * 10000,
    };
};

module.exports = router;