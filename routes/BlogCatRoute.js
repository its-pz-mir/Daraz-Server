const express = require("express");
const { newCategory, updateCategory, getACategory, getAllCategories, delCategory } = require("../controller/blogCatCtrl");
const { authMiddlewears, isAdmin } = require("../middlewears/authMiddlewar");
const blogCatRouter = express.Router();

blogCatRouter.post("/", authMiddlewears, isAdmin, newCategory);
blogCatRouter.put("/update", authMiddlewears, isAdmin, updateCategory);
blogCatRouter.get("/get/:id", authMiddlewears, isAdmin, getACategory);
blogCatRouter.get("/get-all", authMiddlewears, isAdmin, getAllCategories);
blogCatRouter.delete("/del/:id", authMiddlewears, isAdmin, delCategory)

module.exports = blogCatRouter;