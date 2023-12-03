const mongoose = require('mongoose');
const {Schema, ObjectId} = mongoose;

const ReviewSchema = new Schema(
    {
        accommodationId: ObjectId,
        rentalId: ObjectId,
        guestId: ObjectId,
        rating: Number,
        content: String

    },{timestamps: true}
)
const Review = mongoose.model("Review", ReviewSchema);
module.exports = {Review};