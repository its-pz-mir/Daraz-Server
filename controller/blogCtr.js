const Blog = require("../models/blogModel");
const User = require("../models/userModel");

// POST new Blog
const newBlog = async (req, res) => {

    try {

        const newBlog = await Blog.create(req.body);
        newBlog.save();

        if (!newBlog) {
            return res.status(401).json({
                success: false,
                message: "Unable to create the Blog",
            })
        }

        res.status(200).json({
            success: true,
            Blog: newBlog
        })


    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while creating the blog",
            error: error.message
        })
    }

}

// PUT | Update the Blog
const updateBlog = async (req, res) => {
    const { id } = req.params;
    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
        if (!updateBlog) {
            return res.status(401).json({
                success: false,
                message: "Unable to update the Blog",
            })
        }

        res.status(200).json({
            success: true,
            Blog: updateBlog
        })

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while Updating the blog",
            error: error.message
        })
    }
}

// GET a new Blog
const getABlog = async (req, res) => {
    const { id } = req.params;
    try {
        const findBlog = await Blog.findById(id);
        if (!findBlog) {
            return res.status(401).json({
                success: false,
                message: "Unable to get a Blog",
            })
        }

        const updateBlog = await Blog.findByIdAndUpdate(id, {
            $inc: {
                numViews: 1
            },
        }, { new: true });

        await updateBlog.save();

        res.status(200).json({
            success: true,
            blog: updateBlog
        })

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while getting a blog",
            error: error.message
        })
    }
}

// GET All Blogs
const getAllBlogs = async (req, res) => {
    try {
        const findAllBlogs = await Blog.find();

        if (!findAllBlogs) {
            return res.status(401).json({
                success: false,
                message: "Unable to get All Blog",
            })
        }

        res.status(200).json({
            success: true,
            blogs: findAllBlogs
        })

    } catch (error) {
        res.status(504).json({
            success: false,
            message: "Server error while Getting all blogs",
            error: error.message
        })
    }
}

// POST Like the Blog
const likeBlog = async (req, res) => {
    const { id } = req.params;
    const loginUserId = req?.user?.id;

    try {
        const findBlog = await Blog.findById(id);
        if (!findBlog) {
            return res.status(404).json({
                success: false,
                message: "Unable to find the Blog",
            });
        }
        const alreadyLiked = findBlog.likes.find((like) => like.toString() === loginUserId.toString());
        const alreadyDisliked = findBlog.disLikes.find((dislike) => dislike.toString() === loginUserId.toString());

        if (alreadyLiked) {
            const updatedUser = await Blog.findByIdAndUpdate(
                id,
                {
                    $pull: { likes: loginUserId },
                    isLiked: false,
                },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Like removed successfully.",
                User: updatedUser,
            });
        }

        if (alreadyDisliked) {
            const updatedUser = await Blog.findByIdAndUpdate(
                id,
                {
                    $pull: { disLikes: loginUserId },
                    $addToSet: { likes: loginUserId },
                    isLiked: true,
                    isDisLiked: false,
                },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Dislike removed and liked successfully.",
                User: updatedUser,
            });
        }
        const updatedUser = await Blog.findByIdAndUpdate(
            id,
            {
                $addToSet: { likes: loginUserId },
                isLiked: true,
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Successfully liked.",
            User: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error while liking the blog.",
            error: error.message,
        });
    }
};


// POST DisLike the Blog
const disLikeBlog = async (req, res) => {
    const { id } = req.params;
    const loginUserId = req?.user?.id;

    try {
        const findBlog = await Blog.findById(id);
        if (!findBlog) {
            return res.status(404).json({
                success: false,
                message: "Unable to find the Blog",
            });
        }

        const alreadyLiked = findBlog.likes.find((like) => like.toString() === loginUserId.toString());

        const alreadyDisliked = findBlog.disLikes.find((dislike) => dislike.toString() === loginUserId.toString());

        if (alreadyLiked) {
            const updatedUser = await Blog.findByIdAndUpdate(
                id,
                {
                    $pull: { likes: loginUserId },
                    $addToSet: { disLikes: loginUserId },
                    isLiked: false,
                    isDisLiked: true
                },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Like removed successfully.",
                User: updatedUser,
            });
        }

        if (alreadyDisliked) {
            const updatedUser = await Blog.findByIdAndUpdate(
                id,
                {
                    $pull: { disLikes: loginUserId },
                    isDisLiked: false,
                },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Dislike removed and liked successfully.",
                User: updatedUser,
            });
        }
        const updatedUser = await Blog.findByIdAndUpdate(
            id,
            {
                $addToSet: { disLikes: loginUserId },
                isDisLiked: true,
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Successfully liked.",
            User: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error while liking the blog.",
            error: error.message,
        });
    }
};



module.exports = { newBlog, getABlog, getAllBlogs, updateBlog, likeBlog, disLikeBlog };