const mongoose = require('mongoose');
const {Schema} = mongoose;

const GuestSchema = new Schema(
    {
        name: String
    },{timestamps: true}
)
const Guest = mongoose.model("Guest", GuestSchema);
module.exports = {Guest};