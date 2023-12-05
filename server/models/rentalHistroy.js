const mongoose = require('mongoose');
const {Schema, ObjectId} = mongoose;

const RentalSchema = new Schema(
    {
        accommodationId: ObjectId,
        guestId: ObjectId,
        checkInDate: Date,
        checkOutDate: Date,
        personnel: Number,
        totalPrice: Number,
        isCanceled: Boolean
    },{timestamps: true, collection: 'rentalHistories'}
)
const RentalHistory = mongoose.model("RentalHistory", RentalSchema);
module.exports = {RentalHistory};