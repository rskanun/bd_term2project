const express = require("express");
const router = express.Router();
const faker = require('faker');
const {Review} = require("../models/review");
const {RentalHistory} = require("../models/rentalHistroy");
const {Accommodation} = require("../models/accommodation");

router.post("/initReview", async (req, res) => {
    const accoms = await Accommodation.find();

    for(const accom of accoms) {
        try {
            const id = accom._id;
            const rentals = await RentalHistory.aggregate([
                { $match: { accommodationId: id } },
                { $sample: { size: 3 } }
            ]);

            for(const rental of rentals) {
                const dummyData = generateDummyData({
                    id, 
                    rentalId: rental._id, 
                    guestId: rental.guestId
                });

                await Review.create(dummyData);
            }
        } catch(e) {
            console.error(e);
            return res.status(500).json({ message: "server error!" });
        }
    }
});

const generateDummyData = ({accomId, rentalId, guestId}) => {
    return {
        accommodationId: accomId,
        rentalId,
        guestId,
        rating: faker.datatype.number({ min: 1, max: 5 }),
        content: faker.lorem.paragraph()
    };
}

module.exports = router;