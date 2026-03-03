"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "@/lib/features/authSlice";
import { fetchBlogById, updateBlog } from "@/lib/features/blogSlice";
import dynamic from "next/dynamic";
import API from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function EditBlogPage() {
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const { user, token, loading: authLoading } = useSelector((state) => state.auth);
    const { currentBlog, loading: blogLoading } = useSelector((state) => state.blog);

    const [blogForm, setBlogForm] = useState({
        title: "",
        content: "",
        categories: [],
        tags: [],
    });

    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loaded, setLoaded] = useState(false);

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

    useEffect(() => {
        if (!token) {
            router.push("/");
            return;
        }
        if (!user) dispatch(getProfile());
    }, [token, user, dispatch, router]);

    useEffect(() => {
        if (id) dispatch(fetchBlogById(id));
    }, [id, dispatch]);

    // Blog verisi geldiğinde formu doldur
    useEffect(() => {
        if (currentBlog && !loaded) {
            setBlogForm({
                title: currentBlog.title || "",
                content: currentBlog.content || "",
                categories: currentBlog.categories?.map((c) => c._id) || [],
                tags: currentBlog.tags?.map((t) => t._id) || [],
            });
            setLoaded(true);
        }
    }, [currentBlog, loaded]);

    // Yetki kontrolü — sadece yazar veya admin düzenleyebilir
    useEffect(() => {
        if (user && currentBlog && loaded) {
            const authorId = currentBlog.author?._id || currentBlog.author;
            if (authorId !== user._id && user.role !== "admin") {
                router.push("/");
            }
        }
    }, [user, currentBlog, loaded, router]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [catRes, tagRes] = await Promise.all([
                    API.get("/categories"),
                    API.get("/tags"),
                ]);
                setCategories(catRes.data);
                setTags(tagRes.data);
            } catch { }
        };
        if (user) loadData();
    }, [user]);

    const toggleArrayItem = (arr, item) =>
        arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

    const handleAddTag = async (e) => {
        e.preventDefault();
        if (!newTag.trim()) return;
        try {
            const res = await API.post("/tags", { name: newTag });
            setTags((prev) => [...prev, res.data]);
            setBlogForm((prev) => ({ ...prev, tags: [...prev.tags, res.data._id] }));
            setNewTag("");
        } catch { }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!blogForm.title.trim() || !blogForm.content.trim()) return;
        setSubmitting(true);
        try {
            await dispatch(updateBlog({ id, blogData: blogForm })).unwrap();
            setSuccess(true);
            setTimeout(() => router.push(`/blog/${id}`), 2000);
        } catch {
            setSubmitting(false);
        }
    };

    if (authLoading || blogLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><LoadingSpinner /></div>;
    if (!user) return <div style={{ paddingTop: "48px", textAlign: "center", color: "var(--text-secondary)" }}>Giriş yapmanız gerekmektedir.</div>;

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 96px" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: "48px" }}>
                <h1 style={{ fontSize: "36px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
                    ✏️ Yazıyı Düzenle
                </h1>
                <p style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
                    Blog yazınızı güncelleyin.
                </p>
            </motion.div>

            {success && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: "20px", borderRadius: "16px", marginBottom: "32px", textAlign: "center", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: "16px", fontWeight: 600 }}>
                    ✅ Yazınız başarıyla güncellendi! Yönlendiriliyorsunuz...
                </motion.div>
            )}

            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                {/* Başlık */}
                <div style={{ marginBottom: "28px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Başlık</label>
                    <input type="text" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} placeholder="Blog başlığı..." required style={{ width: "100%", padding: "16px 20px", borderRadius: "12px", fontSize: "16px", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-color)", outline: "none", fontFamily: "inherit" }} onFocus={(e) => e.target.style.borderColor = "#7c3aed"} onBlur={(e) => e.target.style.borderColor = "var(--border-color)"} />
                </div>

                {/* İçerik */}
                <div style={{ marginBottom: "28px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>İçerik</label>
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                        <ReactQuill theme="snow" value={blogForm.content} onChange={(val) => setBlogForm({ ...blogForm, content: val })} modules={quillModules} placeholder="Blog içeriğinizi buraya yazın..." style={{ minHeight: "300px", color: "var(--text-primary)" }} />
                    </div>
                </div>

                {/* Kategoriler */}
                {categories.length > 0 && (
                    <div style={{ marginBottom: "28px" }}>
                        <label style={{ display: "block", marginBottom: "12px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Kategoriler</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {categories.map((cat) => (
                                <button type="button" key={cat._id} onClick={() => setBlogForm({ ...blogForm, categories: toggleArrayItem(blogForm.categories, cat._id) })} style={{ padding: "8px 18px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", border: "none", background: blogForm.categories.includes(cat._id) ? "linear-gradient(to right, #7c3aed, #0ea5e9)" : "var(--bg-secondary)", color: blogForm.categories.includes(cat._id) ? "#fff" : "var(--text-secondary)", boxShadow: blogForm.categories.includes(cat._id) ? "0 0 15px rgba(124,58,237,0.4)" : "none" }}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Etiketler */}
                <div style={{ marginBottom: "28px" }}>
                    <label style={{ display: "block", marginBottom: "12px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Etiketler</label>
                    {tags.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                            {tags.map((tag) => (
                                <button type="button" key={tag._id} onClick={() => setBlogForm({ ...blogForm, tags: toggleArrayItem(blogForm.tags, tag._id) })} style={{ padding: "8px 18px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", border: "none", background: blogForm.tags.includes(tag._id) ? "linear-gradient(to right, #0ea5e9, #38bdf8)" : "var(--bg-secondary)", color: blogForm.tags.includes(tag._id) ? "#fff" : "var(--text-secondary)", boxShadow: blogForm.tags.includes(tag._id) ? "0 0 15px rgba(14,165,233,0.4)" : "none" }}>
                                    #{tag.name}
                                </button>
                            ))}
                        </div>
                    )}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Yeni etiket adı..." style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", fontSize: "14px", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-color)", outline: "none", fontFamily: "inherit" }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(e); } }} />
                        <button type="button" onClick={handleAddTag} style={{ padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, background: "rgba(14,165,233,0.15)", color: "#38bdf8", border: "1px solid rgba(14,165,233,0.3)", cursor: "pointer" }}>
                            + Ekle
                        </button>
                    </div>
                </div>

                <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(124,58,237,0.4), transparent)", margin: "32px 0" }} />

                <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => router.push(`/blog/${id}`)} style={{ padding: "14px 32px", fontSize: "15px", fontWeight: 600, borderRadius: "12px", background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer" }}>
                        İptal
                    </button>
                    <button type="submit" disabled={submitting} style={{ padding: "14px 40px", fontSize: "15px", fontWeight: 700, borderRadius: "12px", background: submitting ? "rgba(124,58,237,0.3)" : "linear-gradient(to right, #7c3aed, #0ea5e9)", color: "#fff", border: "none", cursor: submitting ? "not-allowed" : "pointer", boxShadow: "0 0 25px rgba(124,58,237,0.3)" }}>
                        {submitting ? "Güncelleniyor..." : "💾 Güncelle"}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
