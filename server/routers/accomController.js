const express = require("express");
const router = express.Router();
const faker = require('faker');
const fs = require('fs');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);
const { Accommodation } = require("../models/accommodation");
const { RentalHistory } = require("../models/rentalHistroy");

router.get("/findAccoms/:personnel/:type", async (req, res) => {
    const { personnel, type } = req.params;
    try {
        const accoms = await Accommodation.find({
            $and: [
                { type },
                { maxCapacity: { $gte: personnel } },
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

    try {
        const data = await readFileAsync(fileName, 'utf8');
        const names = data.trim().split('\r\n');

        await Promise.all(names.map(async (name, index) => {
            const existingAccommodation = await Accommodation.findOne({ name });

            if (!existingAccommodation) {
                const dummyData = generateDummyData(name, index);
                
                await Accommodation.create(dummyData);
            }
        }))

        return res.status(200).json({ message: "추가 완료" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "server error!" });
    }
})

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