const express = require("express");
const router = express.Router();
const {
    getCommentsByBlog,
    createComment,
    updateComment,
    deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.get("/blog/:blogId", getCommentsByBlog);

// Private
router.post("/", protect, createComment);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
