const mongoose = require("mongoose");

const coupenSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        uniqued: true,
        uppercase: true,
    },

    expiry: {
        type: Date,
        required: true,
    },

    discount: {
        type: Number,
        required: true,
    }

})

module.exports = mongoose.model("Coupen", coupenSchema)