const mongoose = require("mongoose");

const BrandSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Brand", BrandSchema)