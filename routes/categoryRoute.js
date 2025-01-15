const express = require("express");
const { newCategory, updateCategory, getACategory, getAllCategories, delCategory } = require("../controller/categoryController");
const { authMiddlewears, isAdmin } = require("../middlewears/authMiddlewar");
const categoryRouter = express.Router();

categoryRouter.post("/", authMiddlewears, isAdmin, newCategory);
categoryRouter.put("/update", authMiddlewears, isAdmin, updateCategory);
categoryRouter.get("/get/:id", authMiddlewears, isAdmin, getACategory);
categoryRouter.get("/get-all", authMiddlewears, isAdmin, getAllCategories);
categoryRouter.delete("/del/:id", authMiddlewears, isAdmin, delCategory)

module.exports = categoryRouter;