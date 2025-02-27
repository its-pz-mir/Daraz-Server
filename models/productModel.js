const { default: mongoose } = require("mongoose");

const productShcema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true
    },
    sold: {
        type: Number,
        default: 0
    },
    images: {
        type: Array,
    },
    color: {
        type: String,
        enum: ["Apple", "Samsung", "Google"]
    },
    ratings: [
        {
            star: Number,
            comment: String,
            postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        }
    ],

    totalRatings: {
        type: String,
        default: 0
    }

}, { timestamps: true });


const Product = mongoose.model("Product", productShcema);
module.exports = Product;