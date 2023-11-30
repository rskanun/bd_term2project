const mongoose = require('mongoose');
const {Schema} = mongoose;

const AccomSchema = new Schema(
    {
        name: String,
        type: String,
        address: String,
        introduction: String,
        amentities: String,
        bedroomNum: Number,
        bedNum: Number,
        bathroomNum: Number,
        maxCapacity: Number,
        weekdayPrice: Number,
        weekendPrice: Number
    },{timestamps: true}
)
const Accommodation = mongoose.model("Accommodation", AccomSchema);
module.exports = {Accommodation};