"use client";

import Link from "next/link";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@/lib/ThemeProvider";
import { logout } from "@/lib/features/authSlice";
import AuthModal from "./AuthModal";

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [showAuth, setShowAuth] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                                B
                            </div>
                            <span className="text-xl font-bold gradient-text hidden sm:block">
                                TechBlog
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                href="/"
                                className="text-sm font-medium hover:text-primary-400 transition-colors"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Ana Sayfa
                            </Link>
                            {token && user?.role === "admin" && (
                                <Link
                                    href="/admin"
                                    className="text-sm font-medium hover:text-primary-400 transition-colors"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    Admin Panel
                                </Link>
                            )}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-600/20 transition-colors cursor-pointer"
                                style={{ color: "var(--text-secondary)" }}
                                title={theme === "dark" ? "Light Mode" : "Dark Mode"}
                            >
                                {theme === "dark" ? (
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5" />
                                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                                    </svg>
                                )}
                            </button>

                            {/* Auth */}
                            {token && user ? (
                                <div className="flex items-center gap-3">
                                    <span
                                        className="text-sm font-medium hidden sm:block"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        {user.username}
                                    </span>
                                    <button
                                        onClick={() => dispatch(logout())}
                                        className="px-4 py-2 text-sm font-medium rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                    >
                                        Çıkış
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAuth(true)}
                                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90 transition-opacity cursor-pointer"
                                >
                                    Giriş Yap
                                </button>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-600/20 transition-colors cursor-pointer"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    {mobileOpen ? (
                                        <path d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileOpen && (
                        <div className="md:hidden pb-4 border-t border-primary-600/20 mt-2 pt-3 flex flex-col gap-2">
                            <Link
                                href="/"
                                className="px-3 py-2 text-sm rounded-lg hover:bg-primary-600/10 transition-colors"
                                style={{ color: "var(--text-secondary)" }}
                                onClick={() => setMobileOpen(false)}
                            >
                                Ana Sayfa
                            </Link>
                            {token && user?.role === "admin" && (
                                <Link
                                    href="/admin"
                                    className="px-3 py-2 text-sm rounded-lg hover:bg-primary-600/10 transition-colors"
                                    style={{ color: "var(--text-secondary)" }}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Admin Panel
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* Auth Modal */}
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
    );
}
