// All Imports
const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/db");
const authRouter = require("./routes/authRoute");
var cookieParser = require('cookie-parser');
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const categoryRouter = require("./routes/categoryRoute");
const blogCatRouter = require("./routes/BlogCatRoute");
const brandRouter = require("./routes/brandRouter");
const coupenRouter = require("./routes/coupenRoute");

// Middlewares
const port = process.env.PORT;
const app = express();
// app.use(bodyParser.json());
app.use(express.json())
app.use(cookieParser())
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running..."
    })
})

// Routes
app.use("/api/v1/user", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/blogcat", blogCatRouter);
app.use("/api/v1/brand", brandRouter);
app.use("/api/v1/coupen", coupenRouter);


dbConnect().then(() => {
    app.listen(port, () => {
        console.log(`Server is running...`);
    })
})