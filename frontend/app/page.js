"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "@/lib/features/blogSlice";
import { motion } from "framer-motion";
import BlogCard from "@/components/BlogCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import API from "@/lib/api";

export default function HomePage() {
  const dispatch = useDispatch();
  const { blogs, loading, error } = useSelector((state) => state.blog);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(6);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    dispatch(fetchBlogs());
    // Etiketleri getir
    API.get("/tags")
      .then((res) => setTags(res.data))
      .catch(() => { });
  }, [dispatch]);

  // IntersectionObserver for infinite scroll
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setVisibleCount((prev) => prev + 6);
      }
    },
    []
  );

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [handleObserver]);

  // Filtreleme
  const filteredBlogs = blogs.filter((blog) => {
    const matchesTag = selectedTag
      ? blog.tags?.some((t) => t._id === selectedTag)
      : true;
    const matchesSearch = searchQuery
      ? blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesTag && matchesSearch;
  });

  // Popüler bloglar (en çok görüntülenen)
  const popularBlogs = [...blogs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);

  return (
    <div className="pt-20">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              <span className="gradient-text">Tech Blog</span>
              <br />
              <span style={{ color: "var(--text-primary)" }}>Keşfet, Öğren, Paylaş</span>
            </h1>
            <p
              className="text-lg mb-10 max-w-xl mx-auto leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Yazılım, teknoloji ve dijital dünya hakkında güncel makaleler.
              Bilgi paylaştıkça çoğalır.
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--text-secondary)" }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Blog yazılarında ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm outline-none glass focus:ring-2 focus:ring-primary-500 transition-all"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* ===== TAG FILTERS ===== */}
        {tags.length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Etiketler
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${!selectedTag
                    ? "bg-gradient-to-r from-primary-600 to-accent-500 text-white"
                    : "hover:bg-primary-600/10"
                  }`}
                style={
                  selectedTag
                    ? { color: "var(--text-secondary)", border: "1px solid var(--border-color)" }
                    : {}
                }
              >
                Tümü
              </button>
              {tags.map((tag) => (
                <button
                  key={tag._id}
                  onClick={() => setSelectedTag(selectedTag === tag._id ? null : tag._id)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${selectedTag === tag._id
                      ? "bg-gradient-to-r from-primary-600 to-accent-500 text-white"
                      : "hover:bg-primary-600/10"
                    }`}
                  style={
                    selectedTag !== tag._id
                      ? { color: "var(--text-secondary)", border: "1px solid var(--border-color)" }
                      : {}
                  }
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== POPULAR BLOGS ===== */}
        {popularBlogs.length > 0 && !selectedTag && !searchQuery && (
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Popüler Yazılar
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularBlogs.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} index={i} />
              ))}
            </div>
          </motion.section>
        )}

        {/* ===== ALL BLOGS (INFINITE SCROLL) ===== */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {selectedTag || searchQuery ? "Filtrelenmiş Yazılar" : "Son Yazılar"}
            </h2>
            <span className="text-sm ml-auto" style={{ color: "var(--text-secondary)" }}>
              {filteredBlogs.length} yazı
            </span>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-2">Bir hata oluştu</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{error}</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
                Henüz blog yazısı bulunamadı.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleBlogs.map((blog, i) => (
                  <BlogCard key={blog._id} blog={blog} index={i} />
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              {visibleCount < filteredBlogs.length && (
                <div ref={loadMoreRef} className="flex justify-center py-10">
                  <LoadingSpinner />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
