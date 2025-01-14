const express = require("express");
const { isAdmin, authMiddlewears } = require("../middlewears/authMiddlewar");
const { newBlog, getABlog, getAllBlogs, updateBlog, likeBlog, disLikeBlog } = require("../controller/blogCtr");
const blogRouter = express.Router();


blogRouter.post("/", authMiddlewears, isAdmin, newBlog);
blogRouter.get("/get-blog/:id", getABlog);
blogRouter.get("/blogs", getAllBlogs);
blogRouter.put("/update/:id", authMiddlewears, isAdmin, updateBlog);
blogRouter.put("/like-blog/:id", authMiddlewears, likeBlog);
blogRouter.put("/dislike-blog/:id", authMiddlewears, disLikeBlog)
module.exports = blogRouter;