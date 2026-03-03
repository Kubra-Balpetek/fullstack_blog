"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "@/lib/features/authSlice";
import { createBlog } from "@/lib/features/blogSlice";
import dynamic from "next/dynamic";
import API from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";

// React Quill (SSR devre dışı)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function WritePage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user, token, loading: authLoading } = useSelector((state) => state.auth);

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

    // JWT kontrolü — giriş yapmamışsa ana sayfaya yönlendir
    useEffect(() => {
        if (!token) {
            router.push("/");
            return;
        }
        if (!user) dispatch(getProfile());
    }, [token, user, dispatch, router]);

    // Kategorileri ve etiketleri yükle
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

    // Yeni tag ekle
    const handleAddTag = async (e) => {
        e.preventDefault();
        if (!newTag.trim()) return;
        try {
            const res = await API.post("/tags", { name: newTag });
            setTags((prev) => [...prev, res.data]);
            setBlogForm((prev) => ({
                ...prev,
                tags: [...prev.tags, res.data._id],
            }));
            setNewTag("");
        } catch { }
    };

    // Blog gönder
    const handleSubmitBlog = async (e) => {
        e.preventDefault();
        if (!blogForm.title.trim() || !blogForm.content.trim()) return;
        setSubmitting(true);
        try {
            await dispatch(createBlog(blogForm)).unwrap();
            setSuccess(true);
            setBlogForm({ title: "", content: "", categories: [], tags: [] });
            setTimeout(() => router.push("/"), 2000);
        } catch {
            setSubmitting(false);
        }
    };

    if (authLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><LoadingSpinner /></div>;

    if (!user)
        return (
            <div style={{ paddingTop: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
                Bu sayfaya erişmek için giriş yapmanız gerekmektedir.
            </div>
        );

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 96px" }}>

            {/* Başlık */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: "center", marginBottom: "48px" }}
            >
                <h1 style={{ fontSize: "36px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
                    ✍️ Yeni Blog Yazısı
                </h1>
                <p style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
                    Düşüncelerinizi, deneyimlerinizi ve bilgi birikiminizi paylaşın.
                </p>
            </motion.div>

            {/* Başarı mesajı */}
            {success && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        padding: "20px", borderRadius: "16px", marginBottom: "32px", textAlign: "center",
                        background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e",
                        fontSize: "16px", fontWeight: 600,
                    }}
                >
                    🎉 Blog yazınız başarıyla yayınlandı! Ana sayfaya yönlendiriliyorsunuz...
                </motion.div>
            )}

            {/* Form */}
            <motion.form
                onSubmit={handleSubmitBlog}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* Başlık */}
                <div style={{ marginBottom: "28px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                        Başlık
                    </label>
                    <input
                        type="text"
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        placeholder="Blog başlığını yazın..."
                        required
                        style={{
                            width: "100%", padding: "16px 20px", borderRadius: "12px", fontSize: "16px",
                            background: "var(--bg-card)", color: "var(--text-primary)",
                            border: "1px solid var(--border-color)", outline: "none", fontFamily: "inherit",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
                        onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                    />
                </div>

                {/* İçerik - React Quill */}
                <div style={{ marginBottom: "28px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                        İçerik
                    </label>
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                        <ReactQuill
                            theme="snow"
                            value={blogForm.content}
                            onChange={(val) => setBlogForm({ ...blogForm, content: val })}
                            modules={quillModules}
                            placeholder="Blog içeriğinizi buraya yazın..."
                            style={{ minHeight: "300px", color: "var(--text-primary)" }}
                        />
                    </div>
                </div>

                {/* Kategoriler */}
                {categories.length > 0 && (
                    <div style={{ marginBottom: "28px" }}>
                        <label style={{ display: "block", marginBottom: "12px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                            Kategoriler
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {categories.map((cat) => (
                                <button
                                    type="button"
                                    key={cat._id}
                                    onClick={() =>
                                        setBlogForm({
                                            ...blogForm,
                                            categories: toggleArrayItem(blogForm.categories, cat._id),
                                        })
                                    }
                                    style={{
                                        padding: "8px 18px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600,
                                        cursor: "pointer", transition: "all 0.2s", border: "none",
                                        background: blogForm.categories.includes(cat._id)
                                            ? "linear-gradient(to right, #7c3aed, #0ea5e9)"
                                            : "var(--bg-secondary)",
                                        color: blogForm.categories.includes(cat._id) ? "#fff" : "var(--text-secondary)",
                                        boxShadow: blogForm.categories.includes(cat._id)
                                            ? "0 0 15px rgba(124,58,237,0.4)"
                                            : "none",
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Etiketler (Tags) */}
                <div style={{ marginBottom: "28px" }}>
                    <label style={{ display: "block", marginBottom: "12px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                        Etiketler
                    </label>

                    {/* Mevcut etiketler */}
                    {tags.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                            {tags.map((tag) => (
                                <button
                                    type="button"
                                    key={tag._id}
                                    onClick={() =>
                                        setBlogForm({
                                            ...blogForm,
                                            tags: toggleArrayItem(blogForm.tags, tag._id),
                                        })
                                    }
                                    style={{
                                        padding: "8px 18px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600,
                                        cursor: "pointer", transition: "all 0.2s", border: "none",
                                        background: blogForm.tags.includes(tag._id)
                                            ? "linear-gradient(to right, #0ea5e9, #38bdf8)"
                                            : "var(--bg-secondary)",
                                        color: blogForm.tags.includes(tag._id) ? "#fff" : "var(--text-secondary)",
                                        boxShadow: blogForm.tags.includes(tag._id)
                                            ? "0 0 15px rgba(14,165,233,0.4)"
                                            : "none",
                                    }}
                                >
                                    #{tag.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Yeni etiket oluştur */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Yeni etiket adı..."
                            style={{
                                flex: 1, padding: "12px 16px", borderRadius: "12px", fontSize: "14px",
                                background: "var(--bg-card)", color: "var(--text-primary)",
                                border: "1px solid var(--border-color)", outline: "none", fontFamily: "inherit",
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddTag(e);
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            style={{
                                padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: 600,
                                background: "rgba(14,165,233,0.15)", color: "#38bdf8",
                                border: "1px solid rgba(14,165,233,0.3)", cursor: "pointer",
                                transition: "all 0.2s", whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => e.target.style.background = "rgba(14,165,233,0.25)"}
                            onMouseLeave={(e) => e.target.style.background = "rgba(14,165,233,0.15)"}
                        >
                            + Ekle
                        </button>
                    </div>
                </div>

                {/* Ayırıcı */}
                <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(124,58,237,0.4), transparent)", margin: "32px 0" }} />

                {/* Gönder Butonu */}
                <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        style={{
                            padding: "14px 32px", fontSize: "15px", fontWeight: 600, borderRadius: "12px",
                            background: "transparent", color: "var(--text-secondary)",
                            border: "1px solid var(--border-color)", cursor: "pointer",
                        }}
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !blogForm.title.trim() || !blogForm.content.trim()}
                        style={{
                            padding: "14px 40px", fontSize: "15px", fontWeight: 700, borderRadius: "12px",
                            background: submitting ? "rgba(124,58,237,0.3)" : "linear-gradient(to right, #7c3aed, #0ea5e9)",
                            color: "#fff", border: "none", cursor: submitting ? "not-allowed" : "pointer",
                            boxShadow: "0 0 25px rgba(124,58,237,0.3)", transition: "all 0.2s",
                        }}
                    >
                        {submitting ? "Yayınlanıyor..." : "🚀 Yayınla"}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
