const express = require("express");
const { createUser, loginUser, getAllUsers, getAUser, deleteUser, updateUser, blockUser, unBlockUser, handleRefreshToken, logout, updatePassword, resetPassToken, resetPassword, saveAddress, userCart, getUserCart, applyCoupen, createOrder, getOrders, updateOrderStatus } = require("../controller/userController");
const { authMiddlewears, isAdmin } = require("../middlewears/authMiddlewar");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/users", authMiddlewears, isAdmin, getAllUsers);
router.get("/userdata", authMiddlewears, getAUser);
router.delete("/delete", authMiddlewears, deleteUser);
router.put("/update", authMiddlewears, updateUser);
router.put("/block-user/:id", authMiddlewears, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddlewears, isAdmin, unBlockUser);
router.get("/refresh-token", handleRefreshToken);
router.put("/updatepass", authMiddlewears, updatePassword);
router.put("/address", authMiddlewears, saveAddress)
router.put("/reset-pass-token", resetPassToken);
router.put("/reset-pass/:token", resetPassword);
router.put("/cart", authMiddlewears, userCart);
router.get("/get-cart", authMiddlewears, getUserCart);
router.put("/apply-coupen", authMiddlewears, applyCoupen);
router.put("/cod-order", authMiddlewears, createOrder)
router.get("/get-orders", authMiddlewears, isAdmin, getOrders);
router.put("/updaet-order/:id", authMiddlewears, isAdmin, updateOrderStatus)

module.exports = router;