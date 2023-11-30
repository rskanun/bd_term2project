const express = require("express");
const router = express.Router();
const {RentalHistory} = require("../models/rentalHistroy");

router.get("/findAll", async (req, res) => {
    try {
        const allRentalHistory = await RentalHistory.find();
        res.status(200).json(allRentalHistory);
    } catch (e) {
        res.status(500).json({ message: "server erorr" });
    }
});

module.exports = router;