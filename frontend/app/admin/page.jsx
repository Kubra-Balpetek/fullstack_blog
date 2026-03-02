"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "@/lib/features/authSlice";
import {
    fetchBlogs,
    deleteBlog,
    createBlog,
    updateBlog,
} from "@/lib/features/blogSlice";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import API from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

// React Quill (SSR devre dışı)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function AdminPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const {
        user,
        token,
        loading: authLoading,
    } = useSelector((state) => state.auth);
    const { blogs, loading: blogsLoading } = useSelector((state) => state.blog);

    const [activeTab, setActiveTab] = useState("blogs");
    const [showEditor, setShowEditor] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);

    // Blog form
    const [blogForm, setBlogForm] = useState({
        title: "",
        content: "",
        categories: [],
        tags: [],
    });

    // Kategori & Etiket
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [newTag, setNewTag] = useState("");

    // Quill modülleri
    const quillModules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["blockquote", "code-block"],
                ["link", "image"],
                [{ color: [] }, { background: [] }],
                ["clean"],
            ],
        }),
        []
    );

    // JWT kontrolü
    useEffect(() => {
        if (!token) {
            router.push("/");
            return;
        }
        if (!user) dispatch(getProfile());
    }, [token, user, dispatch, router]);

    useEffect(() => {
        if (user && user.role !== "admin") router.push("/");
    }, [user, router]);

    useEffect(() => {
        if (user && user.role === "admin") {
            dispatch(fetchBlogs());
            loadCategoriesAndTags();
        }
    }, [user, dispatch]);

    const loadCategoriesAndTags = async () => {
        try {
            const [catRes, tagRes] = await Promise.all([
                API.get("/categories"),
                API.get("/tags"),
            ]);
            setCategories(catRes.data);
            setTags(tagRes.data);
        } catch { }
    };

    // Blog CRUD
    const handleDelete = (id) => {
        if (window.confirm("Bu blog yazısını silmek istediğinize emin misiniz?")) {
            dispatch(deleteBlog(id));
        }
    };

    const handleEditClick = (blog) => {
        setEditingBlog(blog);
        setBlogForm({
            title: blog.title,
            content: blog.content,
            categories: blog.categories?.map((c) => c._id) || [],
            tags: blog.tags?.map((t) => t._id) || [],
        });
        setShowEditor(true);
    };

    const handleNewBlog = () => {
        setEditingBlog(null);
        setBlogForm({ title: "", content: "", categories: [], tags: [] });
        setShowEditor(true);
    };

    const handleSubmitBlog = async (e) => {
        e.preventDefault();
        if (editingBlog) {
            await dispatch(
                updateBlog({ id: editingBlog._id, blogData: blogForm })
            );
        } else {
            await dispatch(createBlog(blogForm));
        }
        setShowEditor(false);
        setEditingBlog(null);
        setBlogForm({ title: "", content: "", categories: [], tags: [] });
    };

    const toggleArrayItem = (arr, item) =>
        arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

    // Kategori CRUD
    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await API.post("/categories", newCategory);
            setNewCategory({ name: "", description: "" });
            loadCategoriesAndTags();
        } catch { }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await API.delete(`/categories/${id}`);
            loadCategoriesAndTags();
        } catch { }
    };

    // Tag CRUD
    const handleAddTag = async (e) => {
        e.preventDefault();
        try {
            await API.post("/tags", { name: newTag });
            setNewTag("");
            loadCategoriesAndTags();
        } catch { }
    };

    const handleDeleteTag = async (id) => {
        try {
            await API.delete(`/tags/${id}`);
            loadCategoriesAndTags();
        } catch { }
    };

    if (authLoading) return <LoadingSpinner />;
    if (!user || user.role !== "admin")
        return (
            <div className="pt-24 text-center" style={{ color: "var(--text-secondary)" }}>
                Yetkiniz yok.
            </div>
        );

    const sidebarTabs = [
        { id: "blogs", label: "Blog Yazıları", icon: "📝" },
        { id: "categories", label: "Kategoriler", icon: "📂" },
        { id: "tags", label: "Etiketler", icon: "🏷️" },
    ];

    return (
        <div className="pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        Admin Paneli
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                        Hoş geldiniz, {user.username}
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="lg:w-56 shrink-0">
                        <div
                            className="rounded-2xl p-3 flex lg:flex-col gap-1"
                            style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-color)",
                            }}
                        >
                            {sidebarTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setShowEditor(false);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all w-full text-left cursor-pointer ${activeTab === tab.id
                                            ? "bg-gradient-to-r from-primary-600/20 to-accent-500/10 text-primary-400"
                                            : ""
                                        }`}
                                    style={
                                        activeTab !== tab.id
                                            ? { color: "var(--text-secondary)" }
                                            : {}
                                    }
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* ===== BLOGS TAB ===== */}
                        {activeTab === "blogs" && (
                            <div>
                                {!showEditor ? (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                                                Blog Yazıları ({blogs.length})
                                            </h2>
                                            <button
                                                onClick={handleNewBlog}
                                                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90 transition-opacity cursor-pointer"
                                            >
                                                + Yeni Yazı
                                            </button>
                                        </div>

                                        {blogsLoading ? (
                                            <LoadingSpinner />
                                        ) : blogs.length === 0 ? (
                                            <p style={{ color: "var(--text-secondary)" }}>
                                                Henüz yazı yok.
                                            </p>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {blogs.map((blog) => (
                                                    <motion.div
                                                        key={blog._id}
                                                        className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                                        style={{
                                                            background: "var(--bg-card)",
                                                            border: "1px solid var(--border-color)",
                                                        }}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                    >
                                                        <div className="min-w-0">
                                                            <h3
                                                                className="font-semibold text-sm truncate"
                                                                style={{ color: "var(--text-primary)" }}
                                                            >
                                                                {blog.title}
                                                            </h3>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                                    {blog.author?.username}
                                                                </span>
                                                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                                    {new Date(blog.createdAt).toLocaleDateString("tr-TR")}
                                                                </span>
                                                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                                    👁 {blog.views} • ❤ {blog.likes}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <button
                                                                onClick={() => handleEditClick(blog)}
                                                                className="px-4 py-2 text-xs font-medium rounded-lg bg-primary-600/15 text-primary-400 hover:bg-primary-600/25 transition-colors cursor-pointer"
                                                            >
                                                                Düzenle
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(blog._id)}
                                                                className="px-4 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                                            >
                                                                Sil
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Blog Editor */
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                                                {editingBlog ? "Yazıyı Düzenle" : "Yeni Yazı Oluştur"}
                                            </h2>
                                            <button
                                                onClick={() => setShowEditor(false)}
                                                className="text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}
                                            >
                                                ← Geri
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmitBlog} className="flex flex-col gap-5">
                                            {/* Title */}
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                                                    Başlık
                                                </label>
                                                <input
                                                    type="text"
                                                    value={blogForm.title}
                                                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                                    style={{
                                                        background: "var(--bg-primary)",
                                                        color: "var(--text-primary)",
                                                        border: "1px solid var(--border-color)",
                                                    }}
                                                    placeholder="Blog başlığı..."
                                                />
                                            </div>

                                            {/* Content (Quill) */}
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                                                    İçerik
                                                </label>
                                                <ReactQuill
                                                    theme="snow"
                                                    value={blogForm.content}
                                                    onChange={(val) => setBlogForm({ ...blogForm, content: val })}
                                                    modules={quillModules}
                                                    placeholder="İçerik yazın..."
                                                />
                                            </div>

                                            {/* Categories */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                                    Kategoriler
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {categories.map((cat) => (
                                                        <button
                                                            key={cat._id}
                                                            type="button"
                                                            onClick={() =>
                                                                setBlogForm({
                                                                    ...blogForm,
                                                                    categories: toggleArrayItem(blogForm.categories, cat._id),
                                                                })
                                                            }
                                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${blogForm.categories.includes(cat._id)
                                                                    ? "bg-primary-600 text-white"
                                                                    : "bg-primary-600/10 text-primary-400"
                                                                }`}
                                                        >
                                                            {cat.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                                    Etiketler
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {tags.map((tag) => (
                                                        <button
                                                            key={tag._id}
                                                            type="button"
                                                            onClick={() =>
                                                                setBlogForm({
                                                                    ...blogForm,
                                                                    tags: toggleArrayItem(blogForm.tags, tag._id),
                                                                })
                                                            }
                                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${blogForm.tags.includes(tag._id)
                                                                    ? "bg-accent-500 text-white"
                                                                    : "bg-accent-500/10 text-accent-400"
                                                                }`}
                                                        >
                                                            #{tag.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="self-start px-8 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90 transition-opacity cursor-pointer"
                                            >
                                                {editingBlog ? "Güncelle" : "Yayınla"}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* ===== CATEGORIES TAB ===== */}
                        {activeTab === "categories" && (
                            <div>
                                <h2 className="text-lg font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                                    Kategoriler ({categories.length})
                                </h2>

                                <form
                                    onSubmit={handleAddCategory}
                                    className="flex flex-col sm:flex-row gap-3 mb-6"
                                >
                                    <input
                                        type="text"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        required
                                        placeholder="Kategori adı"
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                        style={{
                                            background: "var(--bg-card)",
                                            color: "var(--text-primary)",
                                            border: "1px solid var(--border-color)",
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                        placeholder="Açıklama (opsiyonel)"
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                        style={{
                                            background: "var(--bg-card)",
                                            color: "var(--text-primary)",
                                            border: "1px solid var(--border-color)",
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90 cursor-pointer"
                                    >
                                        Ekle
                                    </button>
                                </form>

                                <div className="flex flex-col gap-2">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat._id}
                                            className="flex items-center justify-between rounded-xl p-4"
                                            style={{
                                                background: "var(--bg-card)",
                                                border: "1px solid var(--border-color)",
                                            }}
                                        >
                                            <div>
                                                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                    {cat.name}
                                                </span>
                                                {cat.description && (
                                                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                                                        {cat.description}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteCategory(cat._id)}
                                                className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ===== TAGS TAB ===== */}
                        {activeTab === "tags" && (
                            <div>
                                <h2 className="text-lg font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                                    Etiketler ({tags.length})
                                </h2>

                                <form
                                    onSubmit={handleAddTag}
                                    className="flex gap-3 mb-6"
                                >
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        required
                                        placeholder="Etiket adı"
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                        style={{
                                            background: "var(--bg-card)",
                                            color: "var(--text-primary)",
                                            border: "1px solid var(--border-color)",
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90 cursor-pointer"
                                    >
                                        Ekle
                                    </button>
                                </form>

                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <div
                                            key={tag._id}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl"
                                            style={{
                                                background: "var(--bg-card)",
                                                border: "1px solid var(--border-color)",
                                            }}
                                        >
                                            <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                                                #{tag.name}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteTag(tag._id)}
                                                className="text-xs text-red-400 hover:text-red-300 cursor-pointer ml-1"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
