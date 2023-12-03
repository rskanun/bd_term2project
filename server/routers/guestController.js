const express = require("express");
const router = express.Router();
const faker = require('faker');
const {Guest} = require("../models/guest");

router.post("/initGuest", async (req, res) => {
    let dummyDatas = [];
    for(i = 0; i < 10; i++) {
        const dummyData = {
            name: faker.name.firstName()
        }

        dummyDatas.push(dummyData);
    }

    try {
        await Guest.create(dummyDatas);

        return res.status(200).json({ message: "추가 완료" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "server error!" });
    }
})

module.exports = router;