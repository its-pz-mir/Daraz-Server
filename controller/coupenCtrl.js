const Coupen = require("../models/coupenModel");

const newCoupen = async (req, res) => {
    try {

        const coupen = await Coupen.create(req.body);
        if (!coupen) {
            return res.status(401).json({
                success: false,
                message: "Unable to create coupen"
            })
        }

        res.status(200).json({
            success: true,
            data: coupen
        })
    } catch (error) {
        res.status(200).json({
            success: false,
            message: "Error while Creating the coupen",
            message: error.message,
        })
    }
}


const updateCoupen = async (req, res) => {
    const { id } = req.params;
    try {

        const updateCoupen = await Coupen.findByIdAndUpdate(id, req.body)
        if (!updateCoupen) {
            return res.status(404).json({
                success: false,
                message: "Unable to Update the coupen",
            })
        }

        res.status(200).json({
            success: true,
            Coupen: updateCoupen
        }, { new: true })
    } catch (error) {
        res.status(200).json({
            success: false,
            message: "Error while updating the coupen",
            message: error.message,
        })
    }
}

const getACoupen = async (req, res) => {
    const { id } = req.params;
    try {
        const coupen = await Coupen.findById(id);
        if (!coupen) {
            return res.status(401).json({
                success: false,
                message: "Unable to get a coupen"
            })
        }

        res.status(200).json({
            success: true,
            coupen
        })

    } catch (error) {
        res.status(200).json({
            success: false,
            message: "Error while fetching the coupen",
            message: error.message,
        })
    }
}


const getAllCoupen = async (req, res) => {
    try {
        const allCoupens = await Coupen.find();
        if (!allCoupens) {
            return res.status(404).json({
                success: false,
                message: "Unable to fetch all coupens"
            })
        }
        return res.status(200).json({
            success: true,
            coupens: allCoupens
        })
    } catch (error) {
        res.status(200).json({
            success: false,
            message: "Error while fetching all coupens",
            message: error.message,
        })
    }
}


const delCoupen = async (req, res) => {

    try {
        const { id } = req.params;

        await Coupen.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Coupen deleted successfully"
        })
    } catch (error) {
        res.status(200).json({
            success: false,
            message: "Error while deleting the coupen",
            message: error.message,
        })
    }
}

module.exports = { newCoupen, updateCoupen, getACoupen, getAllCoupen, delCoupen }