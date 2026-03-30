'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from '../../../services/axios';
import ProtectedRoute from "../../../components/ProtectedRoute";

import Image from 'next/image';

function BlogEditorContent() {
  const searchParams = useSearchParams();
  const blogId = searchParams.get('id');
  const editorRef = useRef(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [blogContent, setBlogContent] = useState(null);
  const [tags, setTags] = useState(''); // Comma-separated string
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('basic');
  const isEdit = Boolean(blogId);

  // ✅ SEO state
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [slug, setSlug] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robots, setRobots] = useState('index, follow');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [schemaMarkup, setSchemaMarkup] = useState('');
  const [breadcrumbTitle, setBreadcrumbTitle] = useState('');
  const [pageLanguage, setPageLanguage] = useState('en');

  const generateSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  useEffect(() => {
    if (isEdit && blogId) {
      setLoading(true);
      axios.get(`/blogs/byid/${blogId}`)
        .then((res) => {
          console.log(res, "Blog Data");
          const blog = res.data;
          setTitle(blog.title || '');
          setCategory(blog.category || '');
          setTags(blog.tags?.join(', ') || '');
          setLanguage(blog.language || 'en');
          setCoverImagePreview(blog.coverImage || null);
          setBlogContent(blog.content || null); // Store content here

          const seo = blog.seo || {};
          setMetaTitle(seo.meta_title || '');
          setMetaDescription(seo.meta_description || '');
          setFocusKeyword(seo.focus_keyword || '');
          setSlug(seo.slug || '');
          setCanonicalUrl(seo.canonical_url || '');
          setRobots(seo.robots || 'index, follow');
          setOgTitle(seo.og_title || '');
          setOgDescription(seo.og_description || '');
          setOgImage(seo.og_image || '');
          if (seo.schema_markup) {
            try {
              setSchemaMarkup(
                typeof seo.schema_markup === 'string'
                  ? seo.schema_markup
                  : JSON.stringify(seo.schema_markup, null, 2)
              );
            } catch {
              setSchemaMarkup('');
            }
          } else {
            setSchemaMarkup('');
          }
          setBreadcrumbTitle(seo.breadcrumb_title || '');
          setPageLanguage(seo.page_language || blog.language || 'en');
        })
        .catch((err) => {
          console.error('Failed to fetch blog', err);
          alert('Failed to load blog for editing.');
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, blogId]);

  useEffect(() => {
    if (typeof window !== 'undefined' && activeTab === 'content') {
      // Check if element exists before initializing
      const editorElement = document.getElementById('editorjs');
      if (!editorElement) {
        // Wait a bit for the element to be rendered
        const timer = setTimeout(() => {
          initializeEditor();
        }, 100);
        return () => clearTimeout(timer);
      } else {
        initializeEditor();
      }
    }

    function initializeEditor() {
      // Destroy existing editor if any
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }

      const editorElement = document.getElementById('editorjs');
      if (!editorElement) {
        console.warn('Editor element not found, skipping initialization');
        return;
      }

      Promise.all([
        import('@editorjs/editorjs'),
        import('@editorjs/header'),
        import('@editorjs/image'),
        import('@editorjs/list'),
        import('@editorjs/link'),
        import('@editorjs/quote'),
        import('@editorjs/paragraph'),
      ]).then(([{ default: EditorJS }, { default: Header }, { default: ImageTool }, { default: List }, { default: LinkTool }, { default: Quote }, { default: Paragraph }]) => {
        // Clean and validate blogContent before initializing editor
        let initialData = undefined;
        if (isEdit && blogContent) {
          // Ensure blogContent has proper EditorJS structure
          if (blogContent.blocks && Array.isArray(blogContent.blocks)) {
            // Filter out invalid blocks
            const validBlocks = blogContent.blocks.filter(block => {
              if (!block || !block.type) return false;

              // Validate paragraph blocks - allow empty text (empty paragraphs are valid)
              if (block.type === 'paragraph') {
                return block.data && block.data.text !== undefined && block.data.text !== null;
              }

              // Validate header blocks
              if (block.type === 'header') {
                return block.data && block.data.text && typeof block.data.text === 'string' && block.data.level;
              }

              // Validate list blocks
              if (block.type === 'list') {
                return block.data && Array.isArray(block.data.items) && block.data.items.length > 0;
              }

              // Validate image blocks
              if (block.type === 'image') {
                return block.data && (block.data.file || block.data.url);
              }

              // Validate quote blocks
              if (block.type === 'quote') {
                return block.data && block.data.text && typeof block.data.text === 'string';
              }

              // Validate linkTool blocks
              if (block.type === 'linkTool') {
                return block.data && (block.data.link || block.data.url);
              }

              // Other block types are valid if they have data
              return true;
            });

            initialData = {
              time: blogContent.time || Date.now(),
              blocks: validBlocks,
              version: blogContent.version || '2.31.3'
            };
          } else if (typeof blogContent === 'object') {
            // If content is an object but not in EditorJS format, create empty structure
            initialData = {
              time: Date.now(),
              blocks: [],
              version: '2.31.3'
            };
          }
        }

        try {
          const editor = new EditorJS({
            holder: 'editorjs',
            autofocus: false,
            data: initialData,
            tools: {
              header: Header,
              paragraph: { class: Paragraph, inlineToolbar: true },
              list: { class: List, inlineToolbar: true },
              quote: Quote,
              linkTool: LinkTool,
              image: {
                class: ImageTool,
                config: {
                  uploader: {
                    async uploadByFile(file) {
                      const fd = new FormData();
                      fd.append('image', file);
                      try {
                        const res = await axios.post(
                          `/blogs/editor-image`,
                          fd,
                          { headers: { 'Content-Type': 'multipart/form-data' } }
                        );
                        return res.data;
                      } catch (err) {
                        console.error('Editor image upload failed', err);
                        return { success: 0 };
                      }
                    },
                  },
                },
              },
            },
            onReady: () => {
              console.log('EditorJS is ready');
            },
            onChange: () => {
              // Optional: handle changes
            }
          });
          editorRef.current = editor;
        } catch (error) {
          console.error('Error initializing EditorJS:', error);
        }
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [isEdit, blogId, blogContent, activeTab]); // Add activeTab as dependency

  const onCoverChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverImageFile(f);
    setCoverImagePreview(URL.createObjectURL(f));
  };

  const saveBlog = async () => {
    if (!title?.trim()) {
      alert('Please provide a title');
      return;
    }
    if (!slug?.trim()) {
      alert('Please provide a slug for SEO (or click out of the title to auto-generate).');
      return;
    }
    setLoading(true);
    try {
      const rawContent = await editorRef.current.save();

      // Validate and clean content
      let content = rawContent;
      if (!content || typeof content !== 'object') {
        content = { blocks: [], time: Date.now(), version: '2.31.3' };
      }

      if (!content.blocks || !Array.isArray(content.blocks)) {
        content.blocks = [];
      }

      // Filter out invalid blocks and ensure proper structure
      const validBlocks = content.blocks.filter(block => {
        if (!block || !block.type || !block.data) return false;

        // Validate paragraph blocks - allow empty text (empty paragraphs are valid)
        if (block.type === 'paragraph') {
          return block.data.text !== undefined && block.data.text !== null;
        }

        // Validate header blocks
        if (block.type === 'header') {
          return block.data.text && typeof block.data.text === 'string' && block.data.level;
        }

        // Validate list blocks
        if (block.type === 'list') {
          return Array.isArray(block.data.items) && block.data.items.length > 0;
        }

        // Validate image blocks
        if (block.type === 'image') {
          return block.data.file || block.data.url;
        }

        // Validate quote blocks
        if (block.type === 'quote') {
          return block.data.text && typeof block.data.text === 'string';
        }

        // Validate linkTool blocks
        if (block.type === 'linkTool') {
          return block.data.link || block.data.url;
        }

        // Other block types are valid if they have data
        return true;
      });

      // Ensure content has proper structure
      const cleanedContent = {
        time: content.time || Date.now(),
        blocks: validBlocks,
        version: content.version || '2.31.3'
      };

      const fd = new FormData();
      fd.append('title', title);
      fd.append('language', language);
      fd.append('category', category);
      fd.append('content', JSON.stringify(cleanedContent));
      if (tags.trim()) {
        fd.append('tags', tags); // Comma-separated
      }
      if (coverImageFile) {
        fd.append('coverImage', coverImageFile); // New file
      }

      // ✅ SEO fields
      fd.append('meta_title', metaTitle || title);
      fd.append('meta_description', metaDescription);
      fd.append('focus_keyword', focusKeyword);
      fd.append('slug', slug);
      fd.append('canonical_url', canonicalUrl);
      fd.append('robots', robots);
      fd.append('og_title', ogTitle || title);
      fd.append('og_description', ogDescription || metaDescription);
      fd.append('og_image', ogImage || (coverImagePreview || ''));
      if (schemaMarkup.trim()) {
        fd.append('schema_markup', schemaMarkup);
      }
      fd.append('breadcrumb_title', breadcrumbTitle || title);
      fd.append('page_language', pageLanguage || language);

      if (isEdit && blogId) {
        await axios.put(`/blogs/${blogId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Blog updated!');
      } else {
        await axios.post(`/blogs`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Blog saved!');
        // Reset fields for create mode
        setTitle('');
        setCategory('');
        setTags('');
        setCoverImageFile(null);
        setCoverImagePreview(null);
        if (editorRef.current) editorRef.current.clear();
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save/update blog. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "";

    // remove /api if exists
    return url.replace("/api", "");
  };

  return (
    <div className="max-w-5xl mx-auto my-10 p-6 rounded-2xl shadow-md bg-gray-100 text-black">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Blog' : 'Create Blog'}</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-4 border-b-2 font-semibold text-sm rounded-t-lg transition-all ${activeTab === 'basic'
              ? 'border-indigo-400 text-indigo-400 bg-indigo-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`py-3 px-4 border-b-2 font-semibold text-sm rounded-t-lg transition-all ${activeTab === 'seo'
              ? 'border-indigo-400 text-indigo-400 bg-indigo-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            SEO Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`py-3 px-4 border-b-2 font-semibold text-sm rounded-t-lg transition-all ${activeTab === 'content'
              ? 'border-indigo-400 text-indigo-400 bg-indigo-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            Content
          </button>
        </nav>
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Blog Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (!slug && title) {
                  setSlug(generateSlug(title));
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          {/* Slug (SEO URL) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              SEO Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Slug (seo-friendly-url)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-generated from title if left empty</p>
          </div>

          {/* Category Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              placeholder="Enter tags (comma separated: tech, coding, news)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            >
              <option value="en">English</option>
              <option value="sv">Swedish</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={onCoverChange}
              className="mb-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-50 file:text-indigo-400
                           hover:file:bg-blue-100"
            />
            {/* Cover Preview */}
            {coverImagePreview && (
              <div className="mt-2">
                <img
                  src={getImageUrl(coverImagePreview)}
                  alt="Cover"
                  width={200}
                  height={200}
                  className="rounded-lg shadow-sm object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Settings Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These SEO fields help improve your blog's visibility in search engines and social media platforms.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meta Title <span className="text-gray-500 text-xs">({metaTitle.length}/60)</span>
            </label>
            <input
              type="text"
              placeholder="Meta Title (recommended: 55-60 characters)"
              maxLength={60}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meta Description <span className="text-gray-500 text-xs">({metaDescription.length}/160)</span>
            </label>
            <textarea
              placeholder="Meta Description (recommended: 150-160 characters)"
              maxLength={160}
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Focus Keyword</label>
            <input
              type="text"
              placeholder="Primary keyword for this blog"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Canonical URL</label>
            <input
              type="url"
              placeholder="https://example.com/blog-url"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Robots Meta</label>
            <select
              value={robots}
              onChange={(e) => setRobots(e.target.value)}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            >
              <option value="index, follow">Index, Follow (Default)</option>
              <option value="noindex, follow">Noindex, Follow</option>
              <option value="noindex, nofollow">Noindex, Nofollow</option>
              <option value="index, nofollow">Index, Nofollow</option>
            </select>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Open Graph (Social Media)</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">OG Title</label>
                <input
                  type="text"
                  placeholder="Open Graph Title (og:title)"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">OG Description</label>
                <textarea
                  placeholder="Open Graph Description (og:description)"
                  rows={3}
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">OG Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/og-image.jpg"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1200 x 630 pixels</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced SEO</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Breadcrumb Title</label>
                <input
                  type="text"
                  placeholder="e.g., Home > Blog > Article Title"
                  value={breadcrumbTitle}
                  onChange={(e) => setBreadcrumbTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Page Language (SEO)</label>
                <select
                  value={pageLanguage}
                  onChange={(e) => setPageLanguage(e.target.value)}
                  className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                >
                  <option value="en">English (en)</option>
                  <option value="sv">Swedish (sv)</option>
                  <option value="ar">Arabic (ar)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Schema Markup (JSON-LD)</label>
                <textarea
                  placeholder='{"@context":"https://schema.org","@type":"Article",...}'
                  rows={6}
                  value={schemaMarkup}
                  onChange={(e) => setSchemaMarkup(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Enter valid JSON-LD structured data</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      <div className={activeTab === 'content' ? '' : 'hidden'}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Tip:</strong> Use the editor below to create rich content with headers, paragraphs, lists, images, and more.
          </p>
        </div>
        {/* EditorJS - Always rendered but hidden when not active */}
        <div
          id="editorjs"
          className="min-h-[400px] bg-gray-50 text-black p-4 rounded-lg border border-gray-200"
        ></div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={saveBlog}
          disabled={loading}
          className="px-6 py-3 bg-indigo-400 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
        >
          {loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Blog' : 'Save Blog')}
        </button>
      </div>
    </div>
  );
}

export default function BlogEditorPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="max-w-4xl mx-auto my-10 p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
          </div>
        </div>
      }>
        <BlogEditorContent />
      </Suspense>
    </ProtectedRoute>
  );
}