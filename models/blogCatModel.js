const mongoose = require("mongoose");

const BlogCatSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        unique: true
    }
});

module.exports = mongoose.model("Blogcat", BlogCatSchema)