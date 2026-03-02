const express = require("express");
const router = express.Router();
const {
    getTags,
    createTag,
    updateTag,
    deleteTag,
} = require("../controllers/tagController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public
router.get("/", getTags);

// Private (Admin only)
router.post("/", protect, admin, createTag);
router.put("/:id", protect, admin, updateTag);
router.delete("/:id", protect, admin, deleteTag);

module.exports = router;
