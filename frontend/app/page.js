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
    API.get("/tags")
      .then((res) => setTags(res.data))
      .catch(() => { });
  }, [dispatch]);

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

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);

  return (
    <div className="bg-[#02020a]">
      {/* ===== HERO SECTION (Cyberpunk/Fiber Optic) ===== */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center pt-20 hero-fiber border-b border-primary-900/50">
        <div className="relative z-10 text-center px-4 w-full flex flex-col items-center">

          {/* Search Bar matching the new theme (MOVED ABOVE TITLE) */}
          <motion.div
            className="max-w-3xl mx-auto mb-10 relative w-full px-4 flex justify-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-full shadow-[0_0_40px_rgba(160,32,240,0.15)] rounded-full">
              {/* Sadece yazı yokken ikonu göster */}
              {!searchQuery && (
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-opacity duration-300">
                  <svg className="h-6 w-6 text-primary-400 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <input
                type="text"
                placeholder={!searchQuery ? "Search insights, algorithms, updates..." : ""}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`block w-full py-5 rounded-full text-lg bg-[#050512]/90 backdrop-blur-xl text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 transition-all glow-border border border-primary-500/40 text-center ${!searchQuery ? "pl-14 pr-6" : "px-6"}`}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white glow-text mb-4" style={{ textShadow: "0 0 40px rgba(160,32,240,0.6), 0 0 10px rgba(160,32,240,0.4)" }}>
              KB Blogs
            </h1>
            <p className="text-[#a8b8d0] text-lg md:text-xl font-medium tracking-wide">
              Yazılım Teknolojileri <span className="mx-2 opacity-50">•</span> Bilgi & Deneyim
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* TAG FILTERS */}
        {tags.length > 0 && (
          <div className="mb-12 border-b border-primary-900/30 pb-6">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all tracking-wider ${!selectedTag
                  ? "bg-primary-600 text-white shadow-[0_0_15px_rgba(160,32,240,0.5)]"
                  : "bg-[#0a0a16] text-[#64748b] border border-primary-900/50 hover:text-white hover:border-primary-500/50"
                  }`}
              >
                All Industries
              </button>
              {tags.map((tag) => (
                <button
                  key={tag._id}
                  onClick={() => setSelectedTag(selectedTag === tag._id ? null : tag._id)}
                  className={`px-5 py-2 text-sm font-semibold rounded-full transition-all tracking-wider ${selectedTag === tag._id
                    ? "bg-primary-600 text-white shadow-[0_0_15px_rgba(160,32,240,0.5)]"
                    : "bg-[#0a0a16] text-[#64748b] border border-primary-900/50 hover:text-white hover:border-primary-500/50"
                    }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3-COLUMN BLOG GRID */}
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
            {error}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-32 bg-[#0a0a16] rounded-2xl border border-primary-900/30">
            <div className="text-6xl mb-4 text-primary-500/50">∅</div>
            <p className="text-xl font-medium text-[#64748b]">No articles found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
              {visibleBlogs.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} index={i} />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {visibleCount < filteredBlogs.length && (
              <div ref={loadMoreRef} className="flex justify-center py-16">
                <LoadingSpinner />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
