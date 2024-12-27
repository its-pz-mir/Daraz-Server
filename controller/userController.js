const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../config/jsonwebtoken");
const { generateRefreshToken } = require("../config/refreshToken")
const jwt = require("jsonwebtoken")
// Create User
const createUser = async (req, res) => {
    const { firstName, lastName, email, mobile, password } = req.body;
    try {
        if (!email || !password || !firstName || !lastName || !email || !mobile) {
            return res.status(401).json({
                success: false,
                message: "All fields are required."
            })
        }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already used."
            })
        } else {
            const hashedPass = await bcrypt.hash(password, 10);
            const user = new User({ firstName, lastName, email, mobile, password: hashedPass })
            user.save();
            return res.status(200).json({
                success: true,
                message: "User created Successfully",
                user
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Erro occured while registering",
            error
        })
    }
}

// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                success: false,
                message: "All fields are required."
            })
        }

        const findUser = await User.findOne({ email });
        if (!findUser) {
            return res.status(401).json({
                success: false,
                message: "Email not found. Register your account"
            })
        }

        const matchPass = await bcrypt.compare(password, findUser.password)
        if (!matchPass) {
            return res.status(500).json({
                success: false,
                message: "Password does not match"
            })
        } else {
            const refreshToken = generateRefreshToken(findUser?._id);
            const updateUser = await User.findByIdAndUpdate(findUser?._id, {
                refreshToken: refreshToken
            }, { new: true });

            if (!updateUser) {
                return res.status(500).json({
                    success: false,
                    message: "Error of Refresh Token"
                })
            }
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000
            });

            res.status(200).json({
                id: findUser?._id,
                firstName: findUser?.firstName,
                lastName: findUser?.lastName,
                mobile: findUser?.mobile,
                email: findUser?.email,
                role: findUser?.role,
                address: findUser?.address,
                cart: findUser?.cart,
                wishlist: findUser?.wishlist,
                token: generateToken(findUser?._id),
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occued while logging In",
            error: error.message
        })
    }
}


const handleRefreshToken = async (req, res) => {
    const { refreshToken } = req.cookies;
    try {

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Unable to find the cookie Token"
            })
        }
        const user = await User.findOne({ refreshToken })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unable to find the User"
            });
        }
        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err || user?.id !== decoded.id) {
                return res.status(401).json({
                    success: false,
                    message: "There is an Error with Token"
                });
            }
        })
        const accessToken = generateToken(user?.id)

        res.status(200).json({
            success: true,
            message: "Success",
            accessToken
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: "Server Error for Refresh Token",
            error: error.message
        })
    }
}

const logout = async (req, res) => {
    const { refreshToken } = req.cookies;

    try {
        if (!refreshToken) {
            return res.status(404).json({
                success: false,
                message: "No refresh token found in cookies."
            });
        }

        // Find user by refresh token
        const user = await User.findOne({ refreshToken });
        if (!user) {
            res.clearCookie("refreshToken", { httpOnly: true, secure: true });
            return res.status(403).json({
                success: false,
                message: "Token not recognized. Access forbidden."
            });
        }

        // Update the user to remove the refresh token
        const updatedUser = await User.findOneAndUpdate(
            { refreshToken },
            { refreshToken: "" },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).json({
                success: false,
                message: "Failed to update user token information."
            });
        }

        // Clear the refresh token cookie
        res.clearCookie("refreshToken", { httpOnly: true, secure: true });

        res.status(200).json({
            success: true,
            message: "User logged out successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred during logout.",
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        if (!users) {
            return res.status(401).json({
                success: false,
                message: "Unable to find all Users"
            })
        }
        const filteredUsers = users.map((user) => {
            const { _id, firstName, lastName, email, mobile, role, isBlocked, wishlist, address, cart } = user;
            const newUser = { _id, firstName, lastName, email, mobile, role, isBlocked, wishlist, address, cart }
            return newUser
        })

        res.status(200).json({
            success: true,
            filteredUsers
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while getting all Users.",
            error
        })
    }
}


const getAUser = async (req, res) => {

    const { id } = req.user;
    try {
        const oneUser = await User.findById(id)
        if (!oneUser) {
            return res.status(401).json({
                success: false,
                message: "Unable to find a User"
            })
        }
        const { password, ...userWithoutPass } = oneUser.toObject();
        res.status(200).json({
            success: true,
            user: userWithoutPass
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while getting a User.",
            error
        })
    }
}


const deleteUser = async (req, res) => {
    const { id } = req.user;
    console.log(id);

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unable to find a User"
            })
        }
        res.status(200).json({
            success: true,
            message: "User Delete Successfully.."
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while Deleting a User.",
            error
        })
    }
}


const updateUser = async (req, res) => {
    const { id } = req.user;
    const { firstName, lastName, email, mobile } = req.body;
    try {
        const user = await User.findByIdAndUpdate(id, {
            firstName, lastName, email, mobile
        })
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unable to find a User"
            })
        }
        res.status(200).json({
            success: true,
            message: "User Updated Successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while Updating a User.",
            error
        })
    }


}


const blockUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndUpdate(id, {
            isBlocked: true,
        }, { new: true });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unable to find a User"
            })
        }

        res.status(200).json({
            success: true,
            message: "User Blocked successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while Updating a User.",
            error: error.message
        })
    }
}


const unBlockUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndUpdate(id, {
            isBlocked: false,
        }, { new: true });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unable to find a User"
            })
        }

        res.status(200).json({
            success: true,
            message: "User Unblocked successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while Updating a User.",
            error: error.message
        })
    }
}


module.exports = { createUser, loginUser, logout, getAllUsers, getAUser, deleteUser, updateUser, blockUser, unBlockUser, handleRefreshToken }