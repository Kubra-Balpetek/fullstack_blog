"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogById, likeBlog, fetchBlogs } from "@/lib/features/blogSlice";
import {
    fetchCommentsByBlog,
    addComment,
    deleteComment,
} from "@/lib/features/commentSlice";
import { motion } from "framer-motion";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import BlogCard from "@/components/BlogCard";

export default function BlogDetailPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentBlog, blogs, loading, error } = useSelector(
        (state) => state.blog
    );
    const { comments } = useSelector((state) => state.comment);
    const { user } = useSelector((state) => state.auth);
    const [commentText, setCommentText] = useState("");
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchBlogById(id));
            dispatch(fetchCommentsByBlog(id));
            dispatch(fetchBlogs());
        }
    }, [dispatch, id]);

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        dispatch(addComment({ blogId: id, content: commentText }));
        setCommentText("");
    };

    const handleLike = () => {
        dispatch(likeBlog(id));
        setLiked(true);
        setTimeout(() => setLiked(false), 1000);
    };

    const handleDeleteComment = (commentId) => {
        if (window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
            dispatch(deleteComment(commentId));
        }
    };

    // Benzer yazılar (aynı kategorideki diğer bloglar)
    const similarBlogs = blogs
        .filter(
            (b) =>
                b._id !== id &&
                b.categories?.some((c) =>
                    currentBlog?.categories?.some((cc) => cc._id === c._id)
                )
        )
        .slice(0, 3);

    if (loading) return <LoadingSpinner />;
    if (error)
        return (
            <div className="pt-24 text-center text-red-400">Hata: {error}</div>
        );
    if (!currentBlog) return <div className="pt-24 text-center" style={{ color: "var(--text-secondary)" }}>Blog bulunamadı.</div>;

    return (
        <div className="pt-20 pb-20">
            {/* ===== HERO BANNER ===== */}
            <section className="relative overflow-hidden py-16 lg:py-24 mb-12">
                <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent-500/15 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Categories */}
                        {currentBlog.categories?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {currentBlog.categories.map((cat) => (
                                    <span
                                        key={cat._id}
                                        className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-600/15 text-primary-400"
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1
                            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6"
                            style={{ color: "var(--text-primary)" }}
                        >
                            {currentBlog.title}
                        </h1>

                        {/* Author Meta */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                                    {currentBlog.author?.username?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                        {currentBlog.author?.username}
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                        {new Date(currentBlog.createdAt).toLocaleDateString("tr-TR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 ml-auto">
                                {/* Views */}
                                <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    {currentBlog.views}
                                </span>

                                {/* Like Button */}
                                <motion.button
                                    onClick={handleLike}
                                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                                    style={
                                        liked
                                            ? { color: "#ef4444", background: "rgba(239,68,68,0.1)" }
                                            : { color: "var(--text-secondary)", background: "transparent" }
                                    }
                                    whileTap={{ scale: 1.2 }}
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        fill={liked ? "currentColor" : "none"}
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                    </svg>
                                    {currentBlog.likes}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ===== TAGS ===== */}
                {currentBlog.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {currentBlog.tags.map((tag) => (
                            <span
                                key={tag._id}
                                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-accent-500/10 text-accent-400"
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* ===== CONTENT ===== */}
                <motion.article
                    className="prose prose-invert max-w-none mb-16 leading-relaxed text-base"
                    style={{ color: "var(--text-primary)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div dangerouslySetInnerHTML={{ __html: currentBlog.content }} />
                </motion.article>

                {/* ===== COMMENTS ===== */}
                <section className="mb-16">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        Yorumlar ({comments.length})
                    </h2>

                    {/* Add Comment */}
                    {user ? (
                        <form onSubmit={handleAddComment} className="mb-8">
                            <div
                                className="rounded-2xl p-4 mb-3"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
                            >
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Düşüncelerinizi paylaşın..."
                                    rows={3}
                                    className="w-full bg-transparent text-sm outline-none resize-none"
                                    style={{ color: "var(--text-primary)" }}
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                Yorum Ekle
                            </button>
                        </form>
                    ) : (
                        <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
                            Yorum yapmak için giriş yapmanız gerekmektedir.
                        </p>
                    )}

                    {/* Comment List */}
                    {comments.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            Henüz yorum yok. İlk yorumu siz yazın!
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {comments.map((comment, i) => (
                                <motion.div
                                    key={comment._id}
                                    className="rounded-2xl p-5"
                                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                                                {comment.user?.username?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                                    {comment.user?.username}
                                                </span>
                                                <span className="text-xs ml-2" style={{ color: "var(--text-secondary)" }}>
                                                    {new Date(comment.createdAt).toLocaleDateString("tr-TR")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        {(user?._id === comment.user?._id || user?.role === "admin") && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                            >
                                                Sil
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                        {comment.content}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ===== SIMILAR BLOGS ===== */}
                {similarBlogs.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                            Benzer Yazılar
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {similarBlogs.map((blog, i) => (
                                <BlogCard key={blog._id} blog={blog} index={i} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
