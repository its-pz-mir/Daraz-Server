const express = require("express");
const { authMiddlewears, isAdmin } = require("../middlewears/authMiddlewar");
const { newBrand, updateBrand, getABrand, getAllBrands, delBrand } = require("../controller/brandCtrl");
const brandRouter = express.Router();

brandRouter.post("/", authMiddlewears, isAdmin, newBrand);
brandRouter.put("/update", authMiddlewears, isAdmin, updateBrand);
brandRouter.get("/get/:id", authMiddlewears, isAdmin, getABrand);
brandRouter.get("/get-all", authMiddlewears, isAdmin, getAllBrands);
brandRouter.delete("/del/:id", authMiddlewears, isAdmin, delBrand)

module.exports = brandRouter;