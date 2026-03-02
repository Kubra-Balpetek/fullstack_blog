const Tag = require("../models/Tag");

// @desc    Tüm etiketleri getir
// @route   GET /api/tags
// @access  Public
const getTags = async (req, res) => {
    try {
        const tags = await Tag.find().sort({ name: 1 });
        res.json(tags);
    } catch (error) {
        res.status(500).json({ message: "Etiketler getirilemedi", error: error.message });
    }
};

// @desc    Yeni etiket oluştur
// @route   POST /api/tags
// @access  Private (Admin)
const createTag = async (req, res) => {
    try {
        const { name } = req.body;

        const tagExists = await Tag.findOne({ name });
        if (tagExists) {
            return res.status(400).json({ message: "Bu etiket zaten mevcut" });
        }

        const tag = await Tag.create({ name });
        res.status(201).json(tag);
    } catch (error) {
        res.status(500).json({ message: "Etiket oluşturulamadı", error: error.message });
    }
};

// @desc    Etiket güncelle
// @route   PUT /api/tags/:id
// @access  Private (Admin)
const updateTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({ message: "Etiket bulunamadı" });
        }

        tag.name = req.body.name || tag.name;

        const updatedTag = await tag.save();
        res.json(updatedTag);
    } catch (error) {
        res.status(500).json({ message: "Etiket güncellenemedi", error: error.message });
    }
};

// @desc    Etiket sil
// @route   DELETE /api/tags/:id
// @access  Private (Admin)
const deleteTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({ message: "Etiket bulunamadı" });
        }

        await Tag.findByIdAndDelete(req.params.id);
        res.json({ message: "Etiket başarıyla silindi" });
    } catch (error) {
        res.status(500).json({ message: "Etiket silinemedi", error: error.message });
    }
};

module.exports = { getTags, createTag, updateTag, deleteTag };
