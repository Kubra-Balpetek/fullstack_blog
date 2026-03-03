"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogById, likeBlog, fetchBlogs, deleteBlog as deleteBlogAction } from "@/lib/features/blogSlice";
import {
    fetchCommentsByBlog,
    addComment,
    deleteComment,
    likeComment,
} from "@/lib/features/commentSlice";
import { motion } from "framer-motion";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import BlogCard from "@/components/BlogCard";

/* ===== Tek Yorum Bileşeni (Cevaplarıyla birlikte) ===== */
function CommentItem({ comment, replies, user, onDelete, onReply, onLike, depth = 0 }) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleSubmitReply = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onReply(replyText, comment._id);
        setReplyText("");
        setShowReplyForm(false);
    };

    return (
        <div style={{ marginLeft: depth > 0 ? "32px" : "0", marginTop: depth > 0 ? "16px" : "0" }}>
            <motion.div
                style={{
                    borderRadius: "16px",
                    padding: "20px 24px",
                    background: depth > 0 ? "var(--bg-secondary)" : "var(--bg-card)",
                    border: `1px solid ${depth > 0 ? "rgba(124,58,237,0.25)" : "var(--border-color)"}`,
                    borderLeft: depth > 0 ? "3px solid #7c3aed" : "1px solid var(--border-color)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Cevap ise kime cevap verdiğini göster */}
                {comment.parentComment && (
                    <div style={{
                        fontSize: "11px", color: "#a78bfa", marginBottom: "10px",
                        display: "flex", alignItems: "center", gap: "4px",
                    }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M3 10h10a5 5 0 015 5v6M3 10l6 6M3 10l6-6" />
                        </svg>
                        <span style={{ fontWeight: 600 }}>
                            {comment.parentComment?.user?.username || "Kullanıcı"}
                        </span>
                        <span>adlı kullanıcıya cevap</span>
                    </div>
                )}

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                            width: depth > 0 ? "30px" : "36px",
                            height: depth > 0 ? "30px" : "36px",
                            borderRadius: "50%",
                            background: depth > 0
                                ? "linear-gradient(135deg, #a78bfa, #38bdf8)"
                                : "linear-gradient(135deg, #8b5cf6, #0ea5e9)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontSize: depth > 0 ? "11px" : "13px", fontWeight: 700,
                            flexShrink: 0,
                        }}>
                            {comment.user?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                                {comment.user?.username}
                            </span>
                            <span style={{ fontSize: "11px", marginLeft: "10px", color: "var(--text-secondary)" }}>
                                {new Date(comment.createdAt).toLocaleDateString("tr-TR")}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {/* Beğen butonu */}
                        <button
                            onClick={() => onLike(comment._id)}
                            style={{
                                fontSize: "11px", background: "transparent",
                                border: "none", cursor: user ? "pointer" : "default", padding: "4px 10px", borderRadius: "8px",
                                fontWeight: 600, display: "flex", alignItems: "center", gap: "4px",
                                transition: "background 0.2s",
                                color: comment.likedBy?.includes(user?._id) ? "#ef4444" : "var(--text-secondary)",
                                opacity: user ? 1 : 0.6,
                            }}
                            onMouseEnter={(e) => { if (user) e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                            disabled={!user}
                            title={!user ? "Beğenmek için giriş yapın" : ""}
                        >
                            <svg width="14" height="14" fill={comment.likedBy?.includes(user?._id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                            {(comment.likes || 0) > 0 && <span>{comment.likes}</span>}
                        </button>
                        {/* Cevapla butonu */}
                        {user && (
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                style={{
                                    fontSize: "11px", color: "#a78bfa", background: "transparent",
                                    border: "none", cursor: "pointer", padding: "4px 10px", borderRadius: "8px",
                                    fontWeight: 600, display: "flex", alignItems: "center", gap: "4px",
                                    transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) => e.target.style.background = "rgba(124,58,237,0.1)"}
                                onMouseLeave={(e) => e.target.style.background = "transparent"}
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 10h10a5 5 0 015 5v6M3 10l6 6M3 10l6-6" />
                                </svg>
                                Cevapla
                            </button>
                        )}
                        {/* Sil butonu */}
                        {(user?._id === comment.user?._id || user?.role === "admin") && (
                            <button
                                onClick={() => onDelete(comment._id)}
                                style={{
                                    fontSize: "11px", color: "#f87171", background: "transparent",
                                    border: "none", cursor: "pointer", padding: "4px 10px", borderRadius: "8px",
                                }}
                                onMouseEnter={(e) => e.target.style.background = "rgba(248,113,113,0.1)"}
                                onMouseLeave={(e) => e.target.style.background = "transparent"}
                            >
                                Sil
                            </button>
                        )}
                    </div>
                </div>

                {/* İçerik */}
                <p style={{ fontSize: "14px", lineHeight: "1.8", paddingLeft: depth > 0 ? "0" : "46px", color: "var(--text-secondary)", margin: 0 }}>
                    {comment.content}
                </p>

                {/* Cevap Formu */}
                {showReplyForm && (
                    <form onSubmit={handleSubmitReply} style={{ marginTop: "16px", paddingLeft: depth > 0 ? "0" : "46px" }}>
                        <div style={{
                            borderRadius: "12px", padding: "12px", marginBottom: "10px",
                            background: "var(--bg-primary)", border: "1px solid rgba(124,58,237,0.3)",
                        }}>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`${comment.user?.username} kullanıcısına cevap yaz...`}
                                rows={2}
                                style={{
                                    width: "100%", background: "transparent", fontSize: "13px",
                                    outline: "none", resize: "none", color: "var(--text-primary)",
                                    lineHeight: "1.6", border: "none", fontFamily: "inherit",
                                }}
                                autoFocus
                            />
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                type="submit"
                                style={{
                                    padding: "8px 20px", fontSize: "12px", fontWeight: 600,
                                    borderRadius: "10px", background: "linear-gradient(to right, #7c3aed, #0ea5e9)",
                                    color: "#fff", border: "none", cursor: "pointer",
                                }}
                            >
                                Cevapla
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowReplyForm(false); setReplyText(""); }}
                                style={{
                                    padding: "8px 20px", fontSize: "12px", fontWeight: 600,
                                    borderRadius: "10px", background: "transparent",
                                    color: "var(--text-secondary)", border: "1px solid var(--border-color)",
                                    cursor: "pointer",
                                }}
                            >
                                İptal
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>

            {/* ALT YANITLAR (Replies) */}
            {replies && replies.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                    {replies.map((reply) => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            replies={[]}
                            user={user}
                            onDelete={onDelete}
                            onReply={onReply}
                            onLike={onLike}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


/* ===== Ana Sayfa Bileşeni ===== */
export default function BlogDetailPage() {
    const { id } = useParams();
    const router = useRouter();
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

    const handleReply = (content, parentCommentId) => {
        dispatch(addComment({ blogId: id, content, parentCommentId }));
    };

    const blogAlreadyLiked = currentBlog?.likedBy?.includes(user?._id);

    const handleLike = () => {
        if (blogAlreadyLiked) return;
        dispatch(likeBlog(id));
    };

    const handleDeleteComment = (commentId) => {
        if (window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
            dispatch(deleteComment(commentId));
        }
    };

    const handleDeleteBlog = () => {
        if (window.confirm("Bu blog yazısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
            dispatch(deleteBlogAction(id));
            router.push("/");
        }
    };

    // Yazarın kendisi mi kontrol et
    const isAuthor = user && currentBlog && (
        (currentBlog.author?._id || currentBlog.author) === user._id
    );
    const isAdmin = user?.role === "admin";
    const canEdit = isAuthor || isAdmin;

    // Üst yorumlar (parentComment olmayan)
    const topLevelComments = comments.filter(
        (c) => !c.parentComment
    );

    // Bir üst yorumun alt cevaplarını bul
    const getRepliesFor = (commentId) => {
        return comments.filter(
            (c) => c.parentComment === commentId || c.parentComment?._id === commentId
        );
    };

    const similarBlogs = blogs
        .filter(
            (b) =>
                b._id !== id &&
                b.categories?.some((c) =>
                    currentBlog?.categories?.some((cc) => cc._id === c._id)
                )
        )
        .slice(0, 3);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><LoadingSpinner /></div>;
    if (error) return (<div style={{ paddingTop: "48px", textAlign: "center", color: "#ef4444" }}>Hata: {error}</div>);
    if (!currentBlog) return <div style={{ paddingTop: "48px", textAlign: "center", color: "var(--text-secondary)" }}>Blog bulunamadı.</div>;

    return (
        <div style={{ paddingBottom: "96px" }}>

            {/* ===== HERO BANNER ===== */}
            <section style={{ position: "relative", overflow: "hidden", marginBottom: "64px" }}>
                <div style={{ position: "absolute", top: 0, left: "33%", width: "384px", height: "384px", background: "rgba(124,58,237,0.15)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: 0, right: "25%", width: "288px", height: "288px", background: "rgba(14,165,233,0.12)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />

                <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 10, textAlign: "center" }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        {currentBlog.categories?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginBottom: "32px" }}>
                                {currentBlog.categories.map((cat) => (
                                    <span key={cat._id} style={{ padding: "6px 16px", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", background: "rgba(124,58,237,0.15)", color: "#a78bfa", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.2, marginBottom: "32px", color: "var(--text-primary)" }}>
                            {currentBlog.title}
                        </h1>

                        {/* Düzenle / Sil Butonları (sadece yazar veya admin) */}
                        {canEdit && (
                            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px" }}>
                                <button
                                    onClick={() => router.push(`/write/${id}`)}
                                    style={{
                                        padding: "10px 24px", fontSize: "13px", fontWeight: 600,
                                        borderRadius: "10px", cursor: "pointer", border: "none",
                                        background: "rgba(124,58,237,0.15)", color: "#a78bfa",
                                        display: "flex", alignItems: "center", gap: "6px",
                                        transition: "background 0.2s",
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = "rgba(124,58,237,0.25)"}
                                    onMouseLeave={(e) => e.target.style.background = "rgba(124,58,237,0.15)"}
                                >
                                    ✏️ Düzenle
                                </button>
                                <button
                                    onClick={handleDeleteBlog}
                                    style={{
                                        padding: "10px 24px", fontSize: "13px", fontWeight: 600,
                                        borderRadius: "10px", cursor: "pointer", border: "none",
                                        background: "rgba(239,68,68,0.1)", color: "#f87171",
                                        display: "flex", alignItems: "center", gap: "6px",
                                        transition: "background 0.2s",
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = "rgba(239,68,68,0.2)"}
                                    onMouseLeave={(e) => e.target.style.background = "rgba(239,68,68,0.1)"}
                                >
                                    🗑️ Sil
                                </button>
                            </div>
                        )}

                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "24px", marginTop: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "18px" }}>
                                    {currentBlog.author?.username?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <div style={{ textAlign: "left" }}>
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{currentBlog.author?.username}</p>
                                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
                                        {new Date(currentBlog.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
                                    </p>
                                </div>
                            </div>
                            <div style={{ width: "1px", height: "32px", background: "rgba(124,58,237,0.3)" }} />
                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    {currentBlog.views}
                                </span>
                                <motion.button onClick={handleLike} disabled={blogAlreadyLiked || !user} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", padding: "8px 16px", borderRadius: "12px", border: "none", cursor: (blogAlreadyLiked || !user) ? "default" : "pointer", color: blogAlreadyLiked ? "#ef4444" : "var(--text-secondary)", background: blogAlreadyLiked ? "rgba(239,68,68,0.1)" : "transparent", opacity: !user ? 0.5 : 1 }} whileTap={!blogAlreadyLiked && user ? { scale: 1.2 } : {}}>
                                    <svg width="18" height="18" fill={blogAlreadyLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                                    {currentBlog.likes}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ===== ANA İÇERİK ===== */}
            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>

                {currentBlog.tags?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginBottom: "48px" }}>
                        {currentBlog.tags.map((tag) => (
                            <span key={tag._id} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 500, borderRadius: "12px", background: "rgba(14,165,233,0.1)", color: "#38bdf8" }}>
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                )}

                <motion.article style={{ color: "var(--text-primary)", lineHeight: "2", fontSize: "16px", marginBottom: "80px", textAlign: "justify" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <div dangerouslySetInnerHTML={{ __html: currentBlog.content }} />
                </motion.article>

                <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(124,58,237,0.4), transparent)", marginBottom: "64px" }} />

                {/* ===== YORUMLAR (Threaded) ===== */}
                <section style={{ marginBottom: "80px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px", color: "var(--text-primary)" }}>
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                        Yorumlar ({comments.length})
                    </h2>

                    {/* Yeni Ana Yorum Ekleme */}
                    {user ? (
                        <form onSubmit={handleAddComment} style={{ marginBottom: "40px" }}>
                            <div style={{ borderRadius: "16px", padding: "20px", marginBottom: "16px", background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Düşüncelerinizi paylaşın..."
                                    rows={4}
                                    style={{ width: "100%", background: "transparent", fontSize: "14px", outline: "none", resize: "none", color: "var(--text-primary)", lineHeight: "1.8", border: "none", fontFamily: "inherit" }}
                                />
                            </div>
                            <button type="submit" style={{ padding: "12px 32px", fontSize: "14px", fontWeight: 600, borderRadius: "12px", background: "linear-gradient(to right, #7c3aed, #0ea5e9)", color: "#fff", border: "none", cursor: "pointer" }}>
                                Yorum Ekle
                            </button>
                        </form>
                    ) : (
                        <p style={{ marginBottom: "40px", fontSize: "14px", padding: "16px", borderRadius: "12px", color: "var(--text-secondary)", background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
                            Yorum yapmak için giriş yapmanız gerekmektedir.
                        </p>
                    )}

                    {/* Yorum Ağacı */}
                    {topLevelComments.length === 0 ? (
                        <p style={{ fontSize: "14px", textAlign: "center", padding: "32px 0", color: "var(--text-secondary)" }}>
                            Henüz yorum yok. İlk yorumu siz yazın!
                        </p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {topLevelComments.map((comment) => (
                                <CommentItem
                                    key={comment._id}
                                    comment={comment}
                                    replies={getRepliesFor(comment._id)}
                                    user={user}
                                    onDelete={handleDeleteComment}
                                    onReply={handleReply}
                                    onLike={(commentId) => dispatch(likeComment(commentId))}
                                    depth={0}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* ===== SIMILAR BLOGS ===== */}
                {similarBlogs.length > 0 && (
                    <section style={{ marginBottom: "48px" }}>
                        <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(124,58,237,0.4), transparent)", marginBottom: "48px" }} />
                        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "40px", textAlign: "center", color: "var(--text-primary)" }}>
                            Benzer Yazılar
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
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
