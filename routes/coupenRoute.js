const express = require("express");
const { authMiddlewears, isAdmin } = require("../middlewears/authMiddlewar");
const { newCoupen, updateCoupen, getACoupen, getAllCoupen, delCoupen } = require("../controller/coupenCtrl");
const coupenRouter = express.Router();

coupenRouter.post("/new", authMiddlewears, isAdmin, newCoupen);
coupenRouter.put("/update/:id", authMiddlewears, isAdmin, updateCoupen);
coupenRouter.get("/get/:id", authMiddlewears, isAdmin, getACoupen);
coupenRouter.get("/getall", authMiddlewears, isAdmin, getAllCoupen);
coupenRouter.delete("/del/:id", authMiddlewears, isAdmin, delCoupen);


module.exports = coupenRouter;