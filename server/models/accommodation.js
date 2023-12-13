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

AccomSchema.virtual("reviews", {
    ref: "Review",
    localField: "_id",
    foreignField: "accommondation",
});
AccomSchema.set("toObject", { virtuals: true });
AccomSchema.set("toJSON", { virtuals: true });

const Accommodation = mongoose.model("Accommodation", AccomSchema);
module.exports = {Accommodation};