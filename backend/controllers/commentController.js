const Comment = require("../models/Comment");
const Blog = require("../models/Blog");

// @desc    Blog yazısına ait yorumları getir (üst yorumlar + alt yorumlar/cevaplar)
// @route   GET /api/comments/blog/:blogId
// @access  Public
const getCommentsByBlog = async (req, res) => {
    try {
        const comments = await Comment.find({ blog: req.params.blogId })
            .populate("user", "username")
            .populate({
                path: "parentComment",
                populate: { path: "user", select: "username" },
            })
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: "Yorumlar getirilemedi", error: error.message });
    }
};

// @desc    Yorum ekle
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
    try {
        const { content, blogId, parentCommentId } = req.body;

        // Blog var mı kontrol et
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog yazısı bulunamadı" });
        }

        // Eğer parentCommentId varsa, üst yorum var mı kontrol et
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ message: "Cevap verilecek yorum bulunamadı" });
            }
        }

        const comment = await Comment.create({
            content,
            blog: blogId,
            user: req.user._id,
            parentComment: parentCommentId || null,
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate("user", "username")
            .populate({
                path: "parentComment",
                populate: { path: "user", select: "username" },
            });

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: "Yorum eklenemedi", error: error.message });
    }
};

// @desc    Yorum güncelle
// @route   PUT /api/comments/:id
// @access  Private (Yorum sahibi veya Admin)
const updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Yorum bulunamadı" });
        }

        // Sadece yorum sahibi veya admin güncelleyebilir
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
        }

        comment.content = req.body.content || comment.content;
        const updatedComment = await comment.save();

        const populatedComment = await Comment.findById(updatedComment._id)
            .populate("user", "username")
            .populate({
                path: "parentComment",
                populate: { path: "user", select: "username" },
            });

        res.json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: "Yorum güncellenemedi", error: error.message });
    }
};

// @desc    Yorum sil (alt yorumları da siler)
// @route   DELETE /api/comments/:id
// @access  Private (Yorum sahibi veya Admin)
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Yorum bulunamadı" });
        }

        // Sadece yorum sahibi veya admin silebilir
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
        }

        // Alt yorumları da sil
        await Comment.deleteMany({ parentComment: req.params.id });
        await Comment.findByIdAndDelete(req.params.id);

        res.json({ message: "Yorum başarıyla silindi" });
    } catch (error) {
        res.status(500).json({ message: "Yorum silinemedi", error: error.message });
    }
};

// @desc    Bir yorumun cevaplarını getir
// @route   GET /api/comments/:id/replies
// @access  Public
const getReplies = async (req, res) => {
    try {
        const replies = await Comment.find({ parentComment: req.params.id })
            .populate("user", "username")
            .sort({ createdAt: 1 });

        res.json(replies);
    } catch (error) {
        res.status(500).json({ message: "Cevaplar getirilemedi", error: error.message });
    }
};

// @desc    Yorumu beğen (sadece bir kez)
// @route   PUT /api/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Yorum bulunamadı" });
        }

        const userId = req.user._id.toString();
        const alreadyLiked = comment.likedBy.some(
            (id) => id.toString() === userId
        );

        if (alreadyLiked) {
            return res.status(400).json({ message: "Bu yorumu zaten beğendiniz" });
        }

        comment.likedBy.push(req.user._id);
        comment.likes += 1;
        await comment.save();

        res.json({ _id: comment._id, likes: comment.likes, likedBy: comment.likedBy });
    } catch (error) {
        res.status(500).json({ message: "Beğeni işlemi başarısız", error: error.message });
    }
};

module.exports = { getCommentsByBlog, createComment, updateComment, deleteComment, getReplies, likeComment };
