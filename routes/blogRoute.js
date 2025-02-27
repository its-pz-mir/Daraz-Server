const express = require("express");
const { isAdmin, authMiddlewears } = require("../middlewears/authMiddlewar");
const { newBlog, getABlog, getAllBlogs, updateBlog, likeBlog, disLikeBlog, uploadBlogImg } = require("../controller/blogCtr");
const blogRouter = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });


blogRouter.post("/", authMiddlewears, isAdmin, newBlog);
blogRouter.get("/get-blog/:id", getABlog);
blogRouter.get("/blogs", getAllBlogs);
blogRouter.put("/update/:id", authMiddlewears, isAdmin, updateBlog);
blogRouter.put("/like-blog/:id", authMiddlewears, likeBlog);
blogRouter.put("/dislike-blog/:id", authMiddlewears, disLikeBlog)
blogRouter.put("/upload-img/:id", upload.array("images", 5), authMiddlewears, isAdmin, uploadBlogImg)

module.exports = blogRouter;