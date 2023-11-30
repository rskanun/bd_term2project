const express = require("express");
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const fs = require('fs');
const faker = require('faker');

const accomController = require("./routers/accomController");
const rentalController = require("./routers/rentalController");

const hostname = "127.0.0.1";
const port = 3000;
const DB_URI = "mongodb://127.0.0.1:27017/bd_termproject";

const { Accommodation } = require("../server/models/accommodation");

const accomFilePath = "./accomInitFile.txt";

const server = async () => {
    try {
        await mongoose.connect(DB_URI);
        app.use(express.json());
        app.use(cors());
        app.use("/accom", accomController);
        app.use("/rental", rentalController);
        app.listen(port, hostname, function () {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    } catch (e) {
        console.error(e);
    }
};

const readAndSaveAccommodation = (fileName) => {
    fs.readFile(fileName, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        const names = data.trim().split('\r\n');

        names.forEach(async (name) => {
            const dummyData = generateDummyData(name);
            try {
                await Accommodation.create(dummyData);
                console.log(dummyData);
            } catch (e) {
                console.error(e);
            }
        });
    });
};

const generateDummyData = (name) => {
    return {
        name: name,
        type: faker.random.arrayElement(['개인', '전체']),
        address: faker.address.streetAddress(),
        introduction: faker.lorem.paragraph(),
        amenities: faker.lorem.sentence(),
        bedroomNum: faker.random.number({ min: 1, max: 5 }),
        bedNum: faker.random.number({ min: 1, max: 10 }),
        bathroomNum: faker.random.number({ min: 1, max: 3 }),
        maxCapacity: faker.random.number({ min: 1, max: 20 }),
        weekdayPrice: faker.random.number({ min: 5, max: 20 })* 10000,
        weekendPrice: faker.random.number({ min: 10, max: 30 })* 10000,
    };
};

server();