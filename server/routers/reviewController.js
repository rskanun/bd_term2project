const express = require("express");
const router = express.Router();
const faker = require("faker");
const mongoose = require("mongoose");
const { Review } = require("../models/review");
const { RentalHistory } = require("../models/rentalHistroy");
const { Accommodation } = require("../models/accommodation");

router.post("/initReview", async (req, res) => {
  const accoms = await Accommodation.find();

  try {
    await Promise.all(
      accoms.map(async (accom) => {
        const id = accom._id;
        const rentals = await RentalHistory.aggregate([
          { $match: { accommodationId: id } },
          { $sample: { size: 3 } },
        ]);

        for (const rental of rentals) {
          const dummyData = generateDummyData({
            rentalId: rental._id,
            guestId: rental.guestId,
          });

          await Review.create(dummyData);
        }
      })
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error!" });
  }
});

router.get("/getAvgRating/:accomId", async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.accomId);
    const avgRatingResult = await Review.aggregate([
      {
        $lookup: {
          from: "rentalHistories",
          localField: "rentalId",
          foreignField: "_id",
          as: "rental",
        },
      },
      {
        $unwind: "$rental",
      },
      {
        $match: { "rental.accommodationId": id },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    if (avgRatingResult.length > 0) {
      const avgRating = avgRatingResult[0].avgRating.toFixed(1);

      return res.status(200).json(avgRating);
    } else {
      return res.status(200).json(0);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error!" });
  }
});

const generateDummyData = ({ rentalId, guestId }) => {
  return {
    rentalId,
    guestId,
    rating: faker.datatype.number({ min: 1, max: 5 }),
    content: faker.lorem.paragraph(),
  };
};

module.exports = router;
