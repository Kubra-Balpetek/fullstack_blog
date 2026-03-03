const express = require("express");
const router = express.Router();
const {
    getCommentsByBlog,
    createComment,
    updateComment,
    deleteComment,
    getReplies,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.get("/blog/:blogId", getCommentsByBlog);
router.get("/:id/replies", getReplies);

// Private
router.post("/", protect, createComment);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
