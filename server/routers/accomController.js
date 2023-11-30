const express = require("express");
const router = express.Router();
const {Accommodation} = require("../models/accommodation");

router.get("/findAll", async (req, res) => {
    try {
        const allAccommodations = await Accommodation.find();
        res.status(200).json(allAccommodations);
    } catch (e) {
        res.status(500).json({ message: "server erorr" });
    }
});

module.exports = router;