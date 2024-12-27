const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: "user"
    },
    refreshToken: {
        type: String,
    },
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cart"
    }],
    address: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "address"
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "wishlist"
    }]
}, { timestamps: true });


const User = mongoose.model("User", userSchema);
module.exports = User;