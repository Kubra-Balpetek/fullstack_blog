const Blog = require("../models/Blog");

// @desc    Tüm blog yazılarını getir
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "username email")
            .populate("categories", "name slug")
            .populate("tags", "name slug")
            .sort({ createdAt: -1 });

        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Blog yazıları getirilemedi", error: error.message });
    }
};

// @desc    Tek bir blog yazısını getir
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate("author", "username email")
            .populate("categories", "name slug")
            .populate("tags", "name slug")
            .populate({
                path: "comments",
                populate: { path: "user", select: "username" },
                options: { sort: { createdAt: -1 } },
            });

        if (!blog) {
            return res.status(404).json({ message: "Blog yazısı bulunamadı" });
        }

        // Görüntülenme sayısını artır
        blog.views += 1;
        await blog.save();

        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: "Blog yazısı getirilemedi", error: error.message });
    }
};

// @desc    Yeni blog yazısı oluştur
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
    try {
        const { title, content, categories, tags } = req.body;

        const blog = await Blog.create({
            title,
            content,
            author: req.user._id,
            categories: categories || [],
            tags: tags || [],
        });

        const populatedBlog = await Blog.findById(blog._id)
            .populate("author", "username email")
            .populate("categories", "name slug")
            .populate("tags", "name slug");

        res.status(201).json(populatedBlog);
    } catch (error) {
        res.status(500).json({ message: "Blog yazısı oluşturulamadı", error: error.message });
    }
};

// @desc    Blog yazısını güncelle
// @route   PUT /api/blogs/:id
// @access  Private (Admin veya Yazar)
const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: "Blog yazısı bulunamadı" });
        }

        // Sadece admin veya yazarın güncellemesine izin ver
        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
        }

        const { title, content, categories, tags } = req.body;

        blog.title = title || blog.title;
        blog.content = content || blog.content;
        blog.categories = categories || blog.categories;
        blog.tags = tags || blog.tags;

        const updatedBlog = await blog.save();

        const populatedBlog = await Blog.findById(updatedBlog._id)
            .populate("author", "username email")
            .populate("categories", "name slug")
            .populate("tags", "name slug");

        res.json(populatedBlog);
    } catch (error) {
        res.status(500).json({ message: "Blog yazısı güncellenemedi", error: error.message });
    }
};

// @desc    Blog yazısını sil
// @route   DELETE /api/blogs/:id
// @access  Private (Admin veya Yazar)
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: "Blog yazısı bulunamadı" });
        }

        // Sadece admin veya yazarın silmesine izin ver
        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.json({ message: "Blog yazısı başarıyla silindi" });
    } catch (error) {
        res.status(500).json({ message: "Blog yazısı silinemedi", error: error.message });
    }
};

// @desc    Blog yazısını beğen
// @route   PUT /api/blogs/:id/like
// @access  Private
const likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: "Blog yazısı bulunamadı" });
        }

        blog.likes += 1;
        await blog.save();

        res.json({ likes: blog.likes });
    } catch (error) {
        res.status(500).json({ message: "Beğeni işlemi başarısız", error: error.message });
    }
};

module.exports = { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog, likeBlog };
