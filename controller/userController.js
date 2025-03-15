const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../config/jsonwebtoken");
const { generateRefreshToken } = require("../config/refreshToken")
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel")
const coupenModel = require("../models/coupenModel");
const uniqid = require('uniqid');

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

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                success: false,
                message: "All fields are required."
            })
        }

        const findAdmin = await User.findOne({ email });
        if (!findAdmin) {
            return res.status(401).json({
                success: false,
                message: "User not Found"
            })
        }

        if (!findAdmin.role === "admin") {
            return res.status(401).json({
                success: false,
                message: "User is not Authorized"
            })
        }

        const matchPass = await bcrypt.compare(password, findAdmin.password)
        if (!matchPass) {
            return res.status(500).json({
                success: false,
                message: "Password does not match"
            })
        } else {
            const refreshToken = generateRefreshToken(findAdmin?._id);
            const updateUser = await User.findByIdAndUpdate(findAdmin?._id, {
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
                id: findAdmin?._id,
                firstName: findAdmin?.firstName,
                lastName: findAdmin?.lastName,
                mobile: findAdmin?.mobile,
                email: findAdmin?.email,
                role: findAdmin?.role,
                address: findAdmin?.address,
                cart: findAdmin?.cart,
                wishlist: findAdmin?.wishlist,
                token: generateToken(findAdmin?._id),
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

const updatePassword = async (req, res) => {
    const { id } = req.user;
    const newPassword = req.body.password;
    try {

        if (!id) {
            return res.status(404).json({
                success: false,
                message: "User is not authenticated"
            })
        }

        if (!newPassword) {
            return res.status(404).json({
                success: false,
                message: "Password is required"
            })
        }

        const findUser = await User.findById(id);
        if (!findUser) {
            return res.status(404).json({
                success: false,
                message: "Unable to find the User"
            })
        }

        const hashedPass = await bcrypt.hash(newPassword, 10);
        findUser.password = hashedPass;
        await findUser.save();
        res.status(200).json({
            success: true,
            message: "Password Updated Successfully",
            user: findUser
        })
    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Error occured while updating a password",
            error: error.message
        })
    }
}

const resetPassToken = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const token = await user.createPasswordResetToken();
        await user.save();

        const resetUrl = `Hi Please follow this link to reset the Password. This link is only valid for 10 minutes from now. <a href='http://localhost:8080/api/v1/user/reset-pass/${token}'>Click Here</a>`;

        const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            html: resetUrl,
        };

        await sendEmail(data);

        res.status(200).json({
            success: true,
            token,
        });
    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Error occurred while sending mail",
            error: error.message,
        });
    }
};

const resetPassword = async (req, res) => {

    const { token } = req.params;
    const { password } = req.body;
    try {

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Unable to find the token"
            })
        }

        const hashedPass = await bcrypt.hash(password, 10)
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const findUser = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        if (!findUser) {
            return res.status(404).json({
                success: false,
                message: "Unable to find the User from the token"
            });
        }

        findUser.password = hashedPass;
        findUser.passwordResetExpires = undefined;
        findUser.passwordResetToken = undefined;
        await findUser.save();

        res.status(200).json({
            success: true,
            user: findUser
        })

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while Forgoting password",
            error: error.message
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

const saveAddress = async (req, res) => {
    const { _id } = req.user;
    try {

        const user = await User.findByIdAndUpdate(_id, {
            address: req.body.address
        }, { new: true });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unable to find a User"
            })
        }

        res.status(200).json({
            success: true,
            message: "Address saved successfully",
            user
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while saving address",
            error: error.message
        })
    }
}

const userCart = async (req, res) => {

    const { cart } = req.body;
    const { _id } = req.user;
    try {
        let products = [];

        const user = await User.findById(_id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unable to find a User"
            })
        }

        const alreadyExistscart = await Cart.findOne({ orderedBy: user._id });
        if (alreadyExistscart) {
            await Cart.findOneAndDelete({ orderedBy: user?._id });
        }

        for (let i = 0; i < cart?.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products?.push(object);
        }

        let cartTotal = 0;
        for (let i = 0; i < products?.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
        }

        let newCart = new Cart({
            products,
            cartTotal,
            orderedBy: user?._id
        })

        await newCart.save();

        res.status(200).json({
            success: true,
            message: "Cart saved successfully",
            cart: newCart
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while saving cart",
            error: error.message
        })
    }
}

const getUserCart = async (req, res) => {
    const { _id } = req.user;
    try {
        const cart = await Cart.findOne({ orderedBy: _id }).populate("products.product", "_id, title, price");
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart is Empty"
            })
        }

        res.status(200).json({
            success: true,
            cart
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while getting cart",
            error: error.message
        })
    }
}

const applyCoupen = async (req, res) => {
    const { coupen } = req.body;
    const { _id } = req.user;
    try {

        const validateCoupen = await coupenModel.findOne({ name: coupen });
        if (!validateCoupen) {
            return res.status(404).json({
                success: false,
                message: "Cannot find this Coupen"
            })
        }

        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Cannot find the User"
            })
        }

        const { products, cartTotal } = await Cart.findOne({ orderedBy: user?._id }).populate("products.product");
        let totalAfterDiscount = cartTotal - (cartTotal * validateCoupen.discount / 100);
        console.log(totalAfterDiscount);
        await Cart.findOneAndUpdate({ orderedBy: user?._id }, { totalAfterDiscount }, { new: true });
        res.status(200).json({
            success: true,
            message: "Coupen Applied Successfully",
            totalAfterDiscount
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while getting cart",
            error: error.message
        })
    }
}

const createOrder = async (req, res) => {
    const { COD, coupenApplied } = req.body;
    const { _id } = req.user;

    try {

        if (!COD) {
            return res.status(404).json({
                success: false,
                message: "Create cash order failed"
            })
        }

        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Unable to find the User"
            })
        }

        let userCart = await Cart.findOne({ orderedBy: user?._id });
        let finalAmount = 0;
        if (coupenApplied && userCart?.totalAfterDiscount) {
            console.log(userCart?.totalAfterDiscount);
            finalAmount = userCart?.totalAfterDiscount * 100;
            console.log(finalAmount);

        } else {
            finalAmount = userCart?.cartTotal * 100;
        }

        let newOrder = new Order({
            products: userCart?.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash on Deleivery",
                created: Date.now(),
                currency: "usd",
            },
            orderBy: user?._id,
            orderStatus: "Cash on Deleivery",
        }).save();

        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } }
                }
            }
        });

        const updated = await Product.bulkWrite(update, {});

        res.json({
            success: true,
            message: "Order created successfully",
            newOrder
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while creating Order",
            error: error.message
        })
    }

}

const getOrders = async (req, res) => {
    const { _id } = req.user;
    try {

        const orders = await Order.find({ orderBy: _id }).populate("products.product");
        if (!orders) {
            return res.status(404).json({
                success: false,
                message: "No Orders found"
            })
        }

        res.status(200).json({
            success: true,
            orders
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while getting Order",
            error: error.message
        })
    }
}

const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    try {

        const updatedOrder = await Order.findByIdAndUpdate(id, {
            orderStatus: status,
            paymentIntent: {
                status: status
            }
        }, { new: true })



        res.status(200).json({
            success: true,
            Order: updatedOrder
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while updating Order",
            error: error.message
        })
    }
}

module.exports = { createUser, resetPassword, resetPassToken, updatePassword, loginUser, loginAdmin, logout, getAllUsers, getAUser, deleteUser, updateUser, blockUser, unBlockUser, handleRefreshToken, saveAddress, userCart, getUserCart, applyCoupen, createOrder, getOrders, updateOrderStatus }