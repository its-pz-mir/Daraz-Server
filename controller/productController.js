const slugify = require("slugify")
const Product = require("../models/productModel");
const User = require("../models/userModel");
const cloudinary = require('cloudinary').v2;
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_KEY
})

const createProduct = async (req, res) => {

    const { title, description, price, quantity, brand, category, sold, colors } = req.body;
    try {
        const slug = slugify(title);
        const newProduct = await new Product({ title, slug, description, price, quantity, category, brand, sold, colors })
        await newProduct.save();

        res.status(200).json({
            success: true,
            message: "Successfully created a Product",
            product: newProduct
        })
    } catch (error) {
        return res.status(501).json({
            success: false,
            message: "Some type of Server Error in Creating Product",
            message: error.message
        })
    }
}

const getAllProducts = async (req, res) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = Product.find(JSON.parse(queryStr));

        if (req.query.sortItems) {
            const sortBy = req.query.sortItems.split(",").join(" ");
            query = query.sort(sortBy);
        }

        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) {
                return res.status(404).json({
                    success: false,
                    message: "Page is not available",
                });
            }
        }

        const products = await query;

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found",
            });
        }

        res.status(200).json({
            success: true,
            message: "All products fetched successfully",
            results: products.length,
            products,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Some server error occurred while fetching products",
            error: error.message,
        });
    }
};

const getAProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Cannot get a Product"
            })
        }

        res.status(200).json({
            success: true,
            message: "Successfully fetched a Product",
            product
        })

    } catch (error) {
        return res.status(501).json({
            success: false,
            message: "Some type of Server Error in getting a Product",
            message: error.message
        })
    }
}

const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const { title, description, price, quantity, category, sold, images, colors } = req.body;
        let newSlug
        if (title) {
            newSlug = slugify(title)
        }
        const findProduct = await Product.findById(id);

        if (!findProduct) {
            return res.status(404).json({
                success: false,
                message: "Cannot get a Product"
            })
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, {
            title: title ? title : findProduct?.product?.title,

            description: description ? description : findProduct?.product?.description,
            slug: newSlug,
            price: price ? price : findProduct?.product?.price,
            quantity: quantity ? quantity : findProduct?.product?.quantity,
            category: category ? category : findProduct?.product?.category,
            sold: sold ? sold : findProduct?.product?.sold,
            images: images ? images : findProduct?.product?.images,
            colors: colors ? colors : findProduct?.product?.colors,
        }, { new: true })

        res.status(200).json({
            success: true,
            message: "Successfully Updated",
            updatedProduct
        })

    } catch (error) {
        return res.status(501).json({
            success: false,
            message: "Some type of Server Error in updating a Product",
            error: error.message
        })
    }
}


const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const delProduct = await Product.findByIdAndDelete(id);

        if (!delProduct) {
            return res.status(404).json({
                success: false,
                message: "Unable to delete the Product."
            })
        }

        res.status(200).json({
            success: true,
            message: "Product deleted Successfully.."
        })

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Error occured while deleting Product.",
            error: error.message
        })
    }
}

const addToWishlist = async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {

        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Unable to find the User"
            })
        }

        const alreadyAdded = user.wishlist.find((prod) => prod.toString() === prodId.toString());

        if (alreadyAdded) {
            const updateUser = await User.findByIdAndUpdate(_id, {
                $pull: { wishlist: prodId }
            }, { new: true });

            return res.status(200).json({
                success: true,
                message: "Successfully Removed from wishlist",
                user: updateUser
            })
        } else {
            const updatedUser = await User.findByIdAndUpdate(_id, {
                $push: { wishlist: prodId }
            }, { new: true });
            res.status(200).json({
                success: true,
                message: "Successfully Added to WishList",
                user: updatedUser
            })
        }

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Error occured while Adding to Wishlist",
            error: error.message
        })
    }
}

const rating = async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;

    try {
        const product = await Product.findById(prodId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Unable to find the Product",
            });
        }

        const alreadyRated = product.ratings.find((rating) => rating.postedBy.toString() === _id.toString());

        if (alreadyRated) {
            await Product.updateOne(
                { _id: prodId, "ratings.postedBy": _id },
                { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
                { new: true }
            );
        } else {
            await Product.findByIdAndUpdate(
                prodId,
                { $push: { ratings: { star: star, comment: comment, postedBy: _id } } },
                { new: true }
            );
        }

        // Recalculate the average rating
        const updatedProduct = await Product.findById(prodId);
        const totalRatings = updatedProduct.ratings.length;
        const ratingSum = updatedProduct.ratings.reduce((sum, item) => sum + item.star, 0);
        const actualRating = Math.round(ratingSum / totalRatings);

        // Update the product with the new average rating
        const finalProduct = await Product.findByIdAndUpdate(
            prodId,
            { totalRatings: actualRating },
            { new: true }
        );

        // Send the final product as the response
        return res.status(200).json({
            success: true,
            Product: finalProduct,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error while Rating",
            error: error.message,
        });
    }
};

const uploadImage = async (req, res) => {
    const { id } = req.params;
    const files = req.files;

    try {
        if (!files || files.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No files found"
            });
        }

        const imageUrls = [];

        for (const file of files) {
            const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

            const result = await cloudinary.uploader.upload(base64Image, {
                folder: "ecommerce",
                resource_type: "image",
                width: 500,
                height: 500,
                crop: "fill",
                gravity: "auto",
                quality: "auto:good",
            });

            imageUrls.push(result.secure_url);
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, { images: imageUrls }, { new: true });

        res.status(200).json({
            success: true,
            message: "Successfully uploaded images",
            product: updatedProduct
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error while uploading images",
            error: error.message,
        });
    }
};


module.exports = { createProduct, getAllProducts, getAProduct, updateProduct, deleteProduct, addToWishlist, rating, uploadImage }