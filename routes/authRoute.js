const express = require("express");
const { createUser, loginUser, getAllUsers, getAUser, deleteUser, updateUser, blockUser, unBlockUser, handleRefreshToken, logout } = require("../controller/userController");
const { authMiddlewears, isAdmin } = require("../middlewears/authMiddlewar");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", logout)
router.get("/users", authMiddlewears, isAdmin, getAllUsers);
router.get("/userdata", authMiddlewears, getAUser);
router.delete("/delete", authMiddlewears, deleteUser);
router.put("/update", authMiddlewears, updateUser);
router.put("/block-user/:id", authMiddlewears, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddlewears, isAdmin, unBlockUser);
router.get("/refresh-token", handleRefreshToken)

module.exports = router;