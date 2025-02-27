const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    numViews: {
        type: Number,
        default: 0
    },
    isLiked: {
        type: Boolean,
        default: false
    },
    isDisLiked: {
        type: Boolean,
        default: false
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    disLikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    images: {
        type: Array,
        default: ["https://usmanimage/image/lslss"]
    },
    author: {
        type: String,
        default: "Admin"
    }
}, {
    toJson: {
        virtual: true
    }, toObject: {
        virtual: true
    }, timestamps: true
},);

module.exports = mongoose.model("Blog", blogSchema);