const mongoose = require('mongoose');
const {Schema, ObjectId} = mongoose;

const RentalSchema = new Schema(
    {
        accommodationId: ObjectId,
        checkInDate: Date,
        checkOutDate: Date,
        personnel: Number,
        totalPrice: Number

    },{timestamps: true}
)
const RentalHistory = mongoose.model("RentalHistory", RentalSchema);
module.exports = {RentalHistory};