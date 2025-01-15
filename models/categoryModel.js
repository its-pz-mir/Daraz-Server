const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        unique: true
    }
});

module.exports = mongoose.model("Category", CategorySchema)