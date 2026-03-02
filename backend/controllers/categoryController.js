const Category = require("../models/Category");

// @desc    Tüm kategorileri getir
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Kategoriler getirilemedi", error: error.message });
    }
};

// @desc    Yeni kategori oluştur
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ message: "Bu kategori zaten mevcut" });
        }

        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: "Kategori oluşturulamadı", error: error.message });
    }
};

// @desc    Kategori güncelle
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Kategori bulunamadı" });
        }

        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: "Kategori güncellenemedi", error: error.message });
    }
};

// @desc    Kategori sil
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Kategori bulunamadı" });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Kategori başarıyla silindi" });
    } catch (error) {
        res.status(500).json({ message: "Kategori silinemedi", error: error.message });
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
