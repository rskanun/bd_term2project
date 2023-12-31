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

router.get("/findReview", async (req, res) => {
  const { accommodationId, guestId } = req.query;

  try {
    const rental = await RentalHistory.findOne({ accommodationId, guestId });
    const review = await Review.findOne({ rentalId: rental._id });

    if (review) {
      return res.status(200).json({ hasReview: true });
    } else {
      return res.status(200).json({ hasReview: false });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "서버 오류!" });
  }
});

router.get("/findReviews/:accomId", async (req, res) => {
  const accomId = new mongoose.Types.ObjectId(req.params.accomId);

  try {
    const rentals = await RentalHistory.find({ accommodationId: accomId });
    const reviews = await Promise.all(
      rentals.map(async (rental) => {
        const reviewsForRental = await Review.find({ rentalId: rental._id });
        return reviewsForRental ? reviewsForRental : null;
      })
    );

    return res.status(200).json(reviews.flat());
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "서버 오류!" });
  }
});

router.post("/addReview", async (req, res) => {
  const { rentalId, guestId, rating, content } = req.body;
  try {
    const review = await Review.create({ rentalId, guestId, rating, content });
    console.log(review);
    return res.json(review);
  }
  catch (err) {
    console.log(err);
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
