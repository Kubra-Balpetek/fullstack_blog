"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function BlogCard({ blog, index = 0 }) {
    // Temporary tech placeholder for blogs without cover image
    const defaultImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1080&auto=format&fit=crop";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
        >
            <Link href={`/blog/${blog._id}`} className="block h-full group">
                <div
                    className="h-full flex flex-col rounded-2xl overflow-hidden glow-border"
                    style={{ background: "var(--bg-card)" }}
                >
                    {/* Thumbnail (16:9) */}
                    <div className="relative w-full aspect-video overflow-hidden">
                        <img
                            src={blog.coverImage || defaultImage}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Dark overlay for better contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a16] via-transparent to-transparent opacity-90" />

                        {/* Category Badges positioned over image */}
                        {blog.categories?.length > 0 && (
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                {blog.categories.map((cat) => (
                                    <span
                                        key={cat._id}
                                        className="px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase rounded bg-primary-900/80 text-primary-300 backdrop-blur-sm border border-primary-500/30"
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 flex flex-col flex-grow relative z-10 -mt-4">
                        {/* Title */}
                        <h3
                            className="text-xl font-bold mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-primary-400"
                            style={{ color: "var(--text-primary)" }}
                        >
                            {blog.title}
                        </h3>

                        {/* Excerpt */}
                        <p
                            className="text-sm line-clamp-3 mb-6 leading-relaxed flex-grow"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {blog.content?.replace(/<[^>]*>/g, "").slice(0, 140)}...
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-primary-900/40 mt-auto">
                            {/* Author */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-primary-300/80 uppercase tracking-wider">
                                    By {blog.author?.username || "STL Digital"}
                                </span>
                            </div>

                            {/* Neo Arrow Button */}
                            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center glow-purple text-white transform transition-transform group-hover:translate-x-1 group-hover:scale-110">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
