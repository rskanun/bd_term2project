const express = require("express");
const router = express.Router();
const {Accommodation} = require("../models/accommodation");
const {RentalHistory} = require("../models/rentalHistroy");

router.get("/findAccoms/:checkOut/:checkIn", async (req, res) => {
    const {checkOut, checkIn} = req.params;
    try {
        const getAccoms = await RentalHistory.aggregate([
            {
                $match: {
                    $or: [
                        { checkInDate: { $gte: new Date(checkOut) } },
                        { checkOutDate: { $lte: new Date(checkIn) } }
                    ]
                }
            },
            {
                $group: {
                    _id: "$accommodationId"
                }
            }
        ]);

        const accomIds = getAccoms.map(entry => entry._id);

        const allAccoms = await Accommodation.find();
        const accoms = allAccoms.filter(accom => !accomIds.includes(accom._id));
        console.log(allAccoms);

        return res.status(200).json(accoms);
    } catch (e) {
        return ress.status(500).json({ message: "server error!" });
    }
});

router.get("/", async (req, res) => {
    return res.status(200).json("hello");
})

module.exports = router;