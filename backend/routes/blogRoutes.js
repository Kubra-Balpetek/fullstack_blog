const express = require("express");
const router = express.Router();
const {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
} = require("../controllers/blogController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.get("/", getBlogs);
router.get("/:id", getBlogById);

// Private
router.post("/", protect, createBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);
router.put("/:id/like", protect, likeBlog);

module.exports = router;
