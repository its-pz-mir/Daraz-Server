const Category = require("../models/categoryModel");


const newCategory = async (req, res) => {
    const { title } = req.body;
    try {
        const createCategory = await Category.create({ title });
        if (!createCategory) {
            return res.status(401).json({
                success: false,
                message: "Unable to Add the Category"
            });
        }

        await createCategory.save();
        res.status(200).json({
            success: true,
            Category: createCategory
        })
    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while creating an Category",
            error: error.message
        })
    }
}

const updateCategory = async (req, res) => {
    const { id, title } = req.body;

    try {
        const findCategory = await Category.findByIdAndUpdate(id, {
            title
        }, { new: true });

        if (!findCategory) {
            return res.status(404).json({
                success: false,
                message: "Unable to Update the Category"
            })
        }

        res.status(200).json({
            success: true,
            category: findCategory
        })

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while Updating an Category",
            error: error.message
        })
    }
}


const getACategory = async (req, res) => {
    const { id } = req.params;
    try {

        const findCategory = await Category.findById(id);
        if (!findCategory) {
            return res.status(401).json({
                success: false,
                message: "Unable to find the Category"
            })
        }

        res.status(200).json({
            success: true,
            category: findCategory
        })

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while getting a Category",
            error: error.message
        })
    }
}

const getAllCategories = async (req, res) => {
    try {
        const findCategories = await Category.find();
        if (!findCategories) {
            return res.status(401).json({
                success: false,
                message: "Unable to find the Categories"
            })
        }

        res.status(200).json({
            success: true,
            categories: findCategories
        })

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while getting all Categories",
            error: error.message
        })
    }
}


const delCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteCategory = await Category.findByIdAndDelete(id);
        if (!deleteCategory) {
            return res.status(401).json({
                success: false,
                message: "Unable to Delete the Category"
            })
        }

        res.status(200).json({
            success: true,
            message: "Successfully Delete the Category"
        })


    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while Deleting Category",
            error: error.message
        })
    }
}


module.exports = { newCategory, updateCategory, getACategory, getAllCategories, delCategory }