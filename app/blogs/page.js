"use client";

import { useEffect, useMemo, useState } from "react";
import axios from '../../services/axios';
import Link from "next/link";
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  Calendar,
  Image as ImageIcon,
  Tag,
  Globe,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  Reset,
  AlertCircle
} from "lucide-react";

import ProtectedRoute from "../../components/ProtectedRoute";

export default function BlogsListPage() {
  const [blogs, setBlogs] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");
  const [hasImage, setHasImage] = useState("all");
  const [language, setLanguage] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [perPage, setPerPage] = useState(9);
  const [page, setPage] = useState(1);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get("/blogs/dashboard");
      console.log(res);
      setBlogs(Array.isArray(res.data) ? res.data : res.data?.blogs || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  const deleteBlog = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`/blogs/${id}`);
      setBlogs((s) => s.filter((b) => b._id !== id));
      if (selectedBlog?._id === id) closeModal();
    } catch (err) {
      console.error("Error deleting blog:", err);
      alert("Failed to delete. See console.");
    }
  };
  console.log(selectedBlog, "Blogs content")
  const openModal = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedBlog(null);
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  const renderBlocks = (blocks = []) => {
    if (!Array.isArray(blocks)) return null;
    return blocks.map((block) => {
      switch (block.type) {
        case "header":
          return (
            <h2 key={block.id} className="text-2xl font-bold my-3 text-gray-900">
              {block.data?.text}
            </h2>
          );
        case "paragraph":
          return (
            <p key={block.id} className="my-3 text-gray-700 leading-relaxed">
              {block.data?.text}
            </p>
          );
        case "list":
          return (
            <ul key={block.id} className="list-disc pl-6 my-3 space-y-1">
              {block.data?.items?.map((item, idx) => (
                <li key={idx} className="text-gray-700">
                  {typeof item === "string" ? item : item.content}
                </li>
              ))}
            </ul>
          );
        case "image":
          return (
            <div key={block.id} className="my-5">
  <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-md">
    <img
      src={block.data?.file?.url}
      alt={block.data?.caption || "Image"}
      className="w-full h-full object-cover"
    />
  </div>
  {block.data?.caption && (
    <p className="text-sm text-gray-500 mt-2 text-center italic">{block.data.caption}</p>
  )}
</div>

          );
        case "quote":
          return (
            <blockquote key={block.id} className="border-l-4 border-indigo-400 pl-4 italic my-5 text-gray-700">
              <p>{block.data?.text}</p>
              {block.data?.caption && (
                <footer className="text-sm text-gray-500 mt-2">- {block.data.caption}</footer>
              )}
            </blockquote>
          );
        default:
          return null;
      }
    });
  };

  const detectLanguage = (text = "") => {
    if (!text) return "unknown";
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text) ? "arabic" : "english";
  };

  const categories = useMemo(() => {
    const set = new Set();
    blogs.forEach((b) => b.category && set.add(String(b.category).trim()));
    return ["all", ...Array.from(set)];
  }, [blogs]);

  const topTags = useMemo(() => {
    const counter = {};
    blogs.forEach((b) => (b.tags || []).forEach((t) => {
      if (!t) return;
      const key = String(t).trim().toLowerCase();
      counter[key] = (counter[key] || 0) + 1;
    }));
    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([t]) => t);
  }, [blogs]);

  const stats = useMemo(() => {
    const total = blogs.length;
    const withImage = blogs.filter((b) => b.coverImage).length;
    const thisMonth = blogs.filter((b) => {
      if (!b.createdAt) return false;
      const d = new Date(b.createdAt);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const mostCommonCategory = (() => {
      const c = {};
      blogs.forEach((b) => b.category && (c[b.category] = (c[b.category] || 0) + 1));
      const sorted = Object.entries(c).sort((a, b) => b[1] - a[1]);
      return sorted[0]?.[0] || "None";
    })();
    return { total, withImage, thisMonth, mostCommonCategory };
  }, [blogs]);

  const filtered = useMemo(() => {
    let res = [...blogs];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      res = res.filter((b) =>
        String(b.title || "").toLowerCase().includes(q) ||
        (b.tags || []).some(t => String(t).toLowerCase().includes(q))
      );
    }

    if (category !== "all") {
      res = res.filter((b) => String(b.category || "").toLowerCase() === category.toLowerCase());
    }

    if (tag !== "all") {
      res = res.filter((b) => (b.tags || []).map(t => String(t).toLowerCase()).includes(tag.toLowerCase()));
    }

    if (hasImage === "with") res = res.filter((b) => b.coverImage);
    if (hasImage === "without") res = res.filter((b) => !b.coverImage);

    if (language !== "all") {
      res = res.filter((b) => {
        const lang = detectLanguage(b.title || b.category || "");
        return language === "arabic" ? lang === "arabic" : lang !== "arabic";
      });
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      res = res.filter((b) => b.createdAt && new Date(b.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      res = res.filter((b) => b.createdAt && new Date(b.createdAt) <= to);
    }

    if (sortBy === "newest") res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest") res.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "az") res.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    if (sortBy === "za") res.sort((a, b) => (b.title || "").localeCompare(a.title || ""));

    return res;
  }, [blogs, query, category, tag, hasImage, language, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages]);
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  const resetFilters = () => {
    setQuery(""); setCategory("all"); setTag("all"); setHasImage("all"); setLanguage("all"); setSortBy("newest"); setDateFrom(""); setDateTo(""); setPage(1);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold  flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-400" />
                All Blogs
              </h1>
              <p className="text-gray-500 mt-1">Manage, filter, and analyze your content</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/blog-editor"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-400 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Add New Blog
              </Link>
              {/* <button
                onClick={fetchBlogs}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-50 transition"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button> */}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-gradient-to-br from-indigo-400 to-indigo-400 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Blogs</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">With Image</p>
                  <p className="text-3xl font-bold mt-1">{stats.withImage}</p>
                </div>
                <ImageIcon className="w-10 h-10 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">This Month</p>
                  <p className="text-3xl font-bold mt-1">{stats.thisMonth}</p>
                </div>
                <Clock className="w-10 h-10 text-purple-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Top Category</p>
                  <p className="text-xl font-bold mt-1 truncate">{stats.mostCommonCategory}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-5">
              {/* <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Search by title or tag..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div> */}

              <div className="flex flex-wrap items-center gap-3">
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-indigo-400">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <select value={tag} onChange={(e) => { setTag(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-indigo-400">
                  <option value="all">All Tags</option>
                  {topTags.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>

                <select value={hasImage} onChange={(e) => { setHasImage(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-indigo-400">
                  <option value="all">All Images</option>
                  <option value="with">With Image</option>
                  <option value="without">Without Image</option>
                </select>

                <select value={language} onChange={(e) => { setLanguage(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-indigo-400">
                  <option value="all">All Languages</option>
                  <option value="english">English</option>
                  <option value="arabic">Arabic</option>
                </select>

                <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-indigo-400">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="az">Title A-Z</option>
                  <option value="za">Title Z-A</option>
                </select>

                <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-indigo-400" />
                <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-indigo-400" />

                <button onClick={resetFilters} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                  <Filter className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            {/* Tag Cloud */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Popular Tags</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setTag('all'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${tag === 'all' ? 'bg-indigo-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All
                </button>
                {topTags.slice(0, 12).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTag(t); setPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${tag === t ? 'bg-indigo-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginated.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No blogs found matching your filters.</p>
              </div>
            ) : (
              paginated.map((b) => (
                <div
                  key={b._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    {console.log("Cover Image:", b.coverImage)}
                    {b.coverImage ? (
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </div>



                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{b.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {b.category || 'Uncategorized'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(b.tags || []).slice(0, 4).map((t, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                          {t}
                        </span>
                      ))}
                      {(b.tags || []).length > 4 && (
                        <span className="text-xs text-gray-500">+{(b.tags || []).length - 4}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {b.coverImage ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            <ImageIcon className="w-3.5 h-3.5" /> Image
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                            <AlertCircle className="w-3.5 h-3.5" /> No Image
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(b)}
                          className="p-2 bg-indigo-400 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/blog-editor/edit?id=${b._id}`}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteBlog(b._id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {/* <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div> */}

          {/* Modal */}
          {isModalOpen && selectedBlog && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
              <div className="bg-white max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-scaleIn">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedBlog.title}</h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {selectedBlog.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {selectedBlog.createdAt 
                            ? new Date(selectedBlog.createdAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {detectLanguage(selectedBlog.title) === 'arabic' ? 'العربية' : 'English'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 text-black rounded-lg transition"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {selectedBlog.coverImage && (
                    <div className="relative h-80 rounded-xl overflow-hidden mb-6 shadow-lg">
                      <img
                        src={selectedBlog.coverImage}
                        alt={selectedBlog.title}
                        className="w-full h-full object-cover rounded-xl"
                      />

                    </div>
                  )}

                  <div className="prose prose-lg max-w-none">
                    {selectedBlog.content?.blocks ? (
                      <>
                        {console.log(selectedBlog.content.blocks)}
                        {renderBlocks(selectedBlog.content.blocks)}
                      </>
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <p className="text-gray-600 italic">No rich content available.</p>
                      </div>
                    )}
                  </div>


                  <div className="mt-8 pt-6 border-t">
                    <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedBlog.tags || []).map((t, i) => (
                        <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SEO Data Section */}
                  {selectedBlog.seo && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        SEO Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Meta Title</label>
                          <p className="text-gray-900 mt-1">{selectedBlog.seo.meta_title || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Focus Keyword</label>
                          <p className="text-gray-900 mt-1">{selectedBlog.seo.focus_keyword || 'Not set'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold text-gray-600">Meta Description</label>
                          <p className="text-gray-900 mt-1">{selectedBlog.seo.meta_description || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">SEO Slug</label>
                          <p className="text-gray-900 mt-1 font-mono text-sm">{selectedBlog.seo.slug || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Canonical URL</label>
                          <p className="text-gray-900 mt-1 break-all text-sm">{selectedBlog.seo.canonical_url || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Robots</label>
                          <p className="text-gray-900 mt-1">{selectedBlog.seo.robots || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Page Language</label>
                          <p className="text-gray-900 mt-1">{selectedBlog.seo.page_language || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Breadcrumb Title</label>
                          <p className="text-gray-900 mt-1">{selectedBlog.seo.breadcrumb_title || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">OG Title</label>
                          <p className="text-gray-900 mt-1">{selectedBlog.seo.og_title || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">OG Description</label>
                          <p className="text-gray-900 mt-1">{selectedBlog.seo.og_description || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">OG Image</label>
                          <p className="text-gray-900 mt-1 break-all text-sm">{selectedBlog.seo.og_image || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Last Updated</label>
                          <p className="text-gray-900 mt-1">
                            {selectedBlog.seo.last_updated 
                              ? new Date(selectedBlog.seo.last_updated).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dates Section */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-600">Created At</label>
                        <p className="text-gray-900 mt-1">
                          {selectedBlog.createdAt 
                            ? new Date(selectedBlog.createdAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })
                            : 'Not available'}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-600">Last Updated</label>
                        <p className="text-gray-900 mt-1">
                          {selectedBlog.updatedAt 
                            ? new Date(selectedBlog.updatedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })
                            : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    {/* <Link
                      href={`/blog-editor?id=${selectedBlog._id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-400 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Blog
                    </Link> */}
                    <button
                      onClick={() => { deleteBlog(selectedBlog._id); closeModal(); }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </ProtectedRoute>
  );
}