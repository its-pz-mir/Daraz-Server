const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

const authMiddlewears = async (req, res, next) => {
    try {

        if (req?.headers?.authorization?.startsWith('Bearer')) {

            const token = req.headers.authorization.split(" ")[1];

            if (!token) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. No token provided.",
                });
            }

            const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
            if (!verifyToken) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid token.",
                });
            }

            const user = await User.findById(verifyToken.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }
            req.user = user;
            next();
        } else {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing or improperly formatted.",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error while processing request.",
            error: error.message,
        });
    }
};


const isAdmin = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        } else {
            if (user?.role !== 'admin') {
                return res.status(503).json({
                    success: false,
                    message: "Only Admin can access"
                })
            } else {
                next();
            }

        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error while processing request.",
            error: error.message,
        });
    }
}

module.exports = { authMiddlewears, isAdmin };
