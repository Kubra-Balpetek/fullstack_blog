"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function BlogCard({ blog, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link href={`/blog/${blog._id}`} className="block group">
                <div
                    className="rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1 glow-border"
                    style={{ background: "var(--bg-card)" }}
                >
                    {/* Gradient Top Bar */}
                    <div className="h-1 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600" />

                    <div className="p-6">
                        {/* Categories */}
                        {blog.categories?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {blog.categories.map((cat) => (
                                    <span
                                        key={cat._id}
                                        className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-primary-600/15 text-primary-400"
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h3
                            className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors"
                            style={{ color: "var(--text-primary)" }}
                        >
                            {blog.title}
                        </h3>

                        {/* Excerpt */}
                        <p
                            className="text-sm line-clamp-3 mb-4 leading-relaxed"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {blog.content?.replace(/<[^>]*>/g, "").slice(0, 150)}...
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                            <div className="flex items-center gap-2">
                                {/* Author Avatar */}
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                                    {blog.author?.username?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                                    {blog.author?.username || "Anonim"}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Views */}
                                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    {blog.views || 0}
                                </span>

                                {/* Likes */}
                                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                    </svg>
                                    {blog.likes || 0}
                                </span>

                                {/* Date */}
                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                    {new Date(blog.createdAt).toLocaleDateString("tr-TR")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
