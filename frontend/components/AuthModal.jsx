"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, clearError } from "@/lib/features/authSlice";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthModal({ onClose }) {
    const [tab, setTab] = useState("login");
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let result;
        if (tab === "login") {
            result = await dispatch(loginUser({ email: form.email, password: form.password }));
        } else {
            result = await dispatch(registerUser(form));
        }
        if (!result.error) {
            onClose();
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) dispatch(clearError());
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    className="relative w-full max-w-md rounded-2xl p-8 glass glow-purple"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                >
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-600/20 transition-colors cursor-pointer"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        ✕
                    </button>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: "var(--bg-primary)" }}>
                        <button
                            onClick={() => setTab("login")}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${tab === "login"
                                    ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white"
                                    : ""
                                }`}
                            style={tab !== "login" ? { color: "var(--text-secondary)" } : {}}
                        >
                            Giriş Yap
                        </button>
                        <button
                            onClick={() => setTab("register")}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${tab === "register"
                                    ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white"
                                    : ""
                                }`}
                            style={tab !== "register" ? { color: "var(--text-secondary)" } : {}}
                        >
                            Kayıt Ol
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {tab === "register" && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                                    Kullanıcı Adı
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500"
                                    style={{
                                        background: "var(--bg-primary)",
                                        color: "var(--text-primary)",
                                        border: "1px solid var(--border-color)",
                                    }}
                                    placeholder="kullanici_adi"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                                E-posta
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500"
                                style={{
                                    background: "var(--bg-primary)",
                                    color: "var(--text-primary)",
                                    border: "1px solid var(--border-color)",
                                }}
                                placeholder="email@ornek.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                                Şifre
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500"
                                style={{
                                    background: "var(--bg-primary)",
                                    color: "var(--text-primary)",
                                    border: "1px solid var(--border-color)",
                                }}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                        >
                            {loading
                                ? "Yükleniyor..."
                                : tab === "login"
                                    ? "Giriş Yap"
                                    : "Kayıt Ol"}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
