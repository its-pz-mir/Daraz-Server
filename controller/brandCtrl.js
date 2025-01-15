const Brand = require("../models/brandModel");


const newBrand = async (req, res) => {
    const { title } = req.body;
    try {
        const createBrand = await Brand.create({ title });
        if (!createBrand) {
            return res.status(401).json({
                success: false,
                message: "Unable to Add the Brand"
            });
        }

        await createBrand.save();
        res.status(200).json({
            success: true,
            Category: createBrand
        })
    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while creating an Brand",
            error: error.message
        })
    }
}

const updateBrand = async (req, res) => {
    const { id, title } = req.body;

    try {
        const findBrand = await Brand.findByIdAndUpdate(id, {
            title
        }, { new: true });

        if (!findBrand) {
            return res.status(404).json({
                success: false,
                message: "Unable to Update the Brand"
            })
        }

        res.status(200).json({
            success: true,
            category: findBrand
        })

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while Updating an Brand",
            error: error.message
        })
    }
}


const getABrand = async (req, res) => {
    const { id } = req.params;
    try {

        const findBrand = await Brand.findById(id);
        if (!findBrand) {
            return res.status(401).json({
                success: false,
                message: "Unable to find the Brand"
            })
        }

        res.status(200).json({
            success: true,
            category: findBrand
        })

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while getting a Brand",
            error: error.message
        })
    }
}

const getAllBrands = async (req, res) => {
    try {
        const findBrand = await Brand.find();
        if (!findBrand) {
            return res.status(401).json({
                success: false,
                message: "Unable to find the Brands"
            })
        }

        res.status(200).json({
            success: true,
            categories: findBrand
        })

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while getting all Brands",
            error: error.message
        })
    }
}


const delBrand = async (req, res) => {
    const { id } = req.params;
    try {
        const deleetBrand = await Brand.findByIdAndDelete(id);
        if (!deleetBrand) {
            return res.status(401).json({
                success: false,
                message: "Unable to Delete the Brand"
            })
        }

        res.status(200).json({
            success: true,
            message: "Successfully Delete the Brand"
        })


    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while Deleting Brand",
            error: error.message
        })
    }
}


module.exports = { newBrand, updateBrand, getABrand, getAllBrands, delBrand }