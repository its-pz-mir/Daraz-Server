const mongoose = require("mongoose");

const BlogCatSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Blogcat", BlogCatSchema)