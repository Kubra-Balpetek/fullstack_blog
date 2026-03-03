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

// Private (Giriş yapmış herkes tag oluşturabilir)
router.post("/", protect, createTag);

// Private (Admin only - güncelleme ve silme)
router.put("/:id", protect, admin, updateTag);
router.delete("/:id", protect, admin, deleteTag);

module.exports = router;
