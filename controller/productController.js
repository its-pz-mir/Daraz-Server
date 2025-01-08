const slugify = require("slugify")
const Product = require("../models/productModel");

const createProduct = async (req, res) => {

    const { title, description, price, quantity, brand, category, sold, images, colors } = req.body;

    try {
        if (!title || !description || !price || !quantity || !category || !brand || !sold || !images || !colors) {
            return res.status(404).json({
                success: false,
                message: "Please Provide all Data"
            })
        }
        const slug = slugify(title);
        console.log(slug);

        const newProduct = await new Product({ title, slug, description, price, quantity, category, brand, sold, images, colors })
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

        // Execute the query
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


const delProduct = async (req, res) => {
    const { id } = req.params;
    try {



    } catch (error) {
        return res.status(501).json({
            success: false,
            message: "Some type of Server Error in deleting a Product",
            message: error.message
        })
    }
}


module.exports = { createProduct, getAllProducts, getAProduct, updateProduct, delProduct }