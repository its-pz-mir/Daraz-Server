const express = require("express");
const { createProduct, getAllProducts, getAProduct, updateProduct } = require("../controller/productController");
const productRouter = express.Router();
const { isAdmin, authMiddlewears } = require("../middlewears/authMiddlewar")

productRouter.post("/", authMiddlewears, isAdmin, createProduct);
productRouter.get("/product/:id", getAProduct)
productRouter.get("/products", authMiddlewears, isAdmin, getAllProducts);
productRouter.put("/update-product/:id", authMiddlewears, isAdmin, updateProduct);


module.exports = productRouter;