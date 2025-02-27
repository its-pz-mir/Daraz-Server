const express = require("express");
const { createProduct, getAllProducts, getAProduct, updateProduct, deleteProduct, addToWishlist, rating, uploadImage } = require("../controller/productController");
const productRouter = express.Router();
const { isAdmin, authMiddlewears } = require("../middlewears/authMiddlewar");
const upload = require("../middlewears/multerMiddlewear");

productRouter.post("/", authMiddlewears, isAdmin, createProduct);
productRouter.get("/product/:id", getAProduct)
productRouter.get("/products", authMiddlewears, isAdmin, getAllProducts);
productRouter.put("/update-product/:id", authMiddlewears, isAdmin, updateProduct);
productRouter.put("/addtowishlist", authMiddlewears, addToWishlist);
productRouter.delete("/del-product/:id", deleteProduct);
productRouter.put("/rate", authMiddlewears, rating);
productRouter.put("/upload/:id", upload.array("images", 5), authMiddlewears, isAdmin, uploadImage)

module.exports = productRouter;