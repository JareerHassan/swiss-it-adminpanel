'use client';

import { useEffect, useRef, useState } from 'react';
import axios from '../../services/axios';
import ProtectedRoute from "../../components/ProtectedRoute";


export default function BlogEditorPage() {
  const editorRef = useRef(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState(''); // ✅ new state
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [EditorTools, setEditorTools] = useState(null);

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
    // only run in browser
    if (typeof window !== 'undefined') {
      Promise.all([
        import('@editorjs/editorjs'),
        import('@editorjs/header'),
        import('@editorjs/image'),
        import('@editorjs/list'),
        import('@editorjs/link'),
        import('@editorjs/quote'),
        import('@editorjs/paragraph'),
      ]).then(([{ default: EditorJS }, { default: Header }, { default: ImageTool }, { default: List }, { default: LinkTool }, { default: Quote }, { default: Paragraph }]) => {
        const editor = new EditorJS({
          holder: 'editorjs',
          autofocus: true,
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
        });
        editorRef.current = editor;
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

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
        // ✅ send tags as comma separated string
        fd.append('tags', tags);
      }
      if (coverImageFile) fd.append('coverImage', coverImageFile);

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

      await axios.post(`/blogs`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Blog saved!');
      setTitle('');
      setCategory('');
      setTags('');
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setMetaTitle('');
      setMetaDescription('');
      setFocusKeyword('');
      setSlug('');
      setCanonicalUrl('');
      setRobots('index, follow');
      setOgTitle('');
      setOgDescription('');
      setOgImage('');
      setSchemaMarkup('');
      setBreadcrumbTitle('');
      setPageLanguage('en');
      if (editorRef.current) editorRef.current.clear();
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save blog. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto my-10 p-6 rounded-2xl shadow-md bg-white">
        <h1 className="text-2xl font-bold mb-6 "> Create Blog</h1>

          {/* Title Input */}
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
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          {/* Slug (SEO URL) */}
          <input
            type="text"
            placeholder="Slug (seo-friendly-url)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          {/* Category Input */}
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          {/* Tags Input */}
          <input
            type="text"
            placeholder="Enter tags (comma separated: tech, coding, news)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <label className="block mb-2 font-medium">Select Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 mb-4 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          >
            <option value="en">English</option>
            <option value="sv">Swedish</option>
            <option value="ar">Arabic</option>
          </select>
          {/* Cover Image Upload */}
          <label className="block mb-2 font-medium">Cover Image</label>
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
            <img
              src={coverImagePreview}
              alt="Cover"
              className="w-30 h-30 rounded-lg mb-4 shadow-sm"
            />
          )}

          {/* SEO Fields */}
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>

            <input
              type="text"
              placeholder="Meta Title"
              maxLength={60}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />

            <textarea
              placeholder="Meta Description"
              maxLength={160}
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />

            <input
              type="text"
              placeholder="Focus Keyword"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />

            <input
              type="text"
              placeholder="Canonical URL (optional)"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />

            <label className="block mb-2 font-medium">Robots</label>
            <select
              value={robots}
              onChange={(e) => setRobots(e.target.value)}
              className="w-full p-3 mb-3 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            >
              <option value="index, follow">Index, Follow</option>
              <option value="noindex, follow">Noindex, Follow</option>
            </select>

            <input
              type="text"
              placeholder="Open Graph Title (og:title)"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />

            <textarea
              placeholder="Open Graph Description (og:description)"
              rows={3}
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />

            <input
              type="text"
              placeholder="Open Graph Image URL (og:image)"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />

            <textarea
              placeholder='Schema Markup (JSON-LD)'
              rows={4}
              value={schemaMarkup}
              onChange={(e) => setSchemaMarkup(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />

            <input
              type="text"
              placeholder="Breadcrumb Title"
              value={breadcrumbTitle}
              onChange={(e) => setBreadcrumbTitle(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />

            <label className="block mb-2 font-medium">Page Language (SEO)</label>
            <input
              type="text"
              placeholder="Page language code (e.g. en, sv, ar)"
              value={pageLanguage}
              onChange={(e) => setPageLanguage(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          {/* EditorJS */}
          <div
            id="editorjs"
            className="min-h-[300px] bg-gray-50 text-black p-4 rounded-lg border border-gray-200"
          ></div>

          {/* Save Button */}
          <button
            onClick={saveBlog}
            disabled={loading}
            className="mt-6 w-full bg-indigo-400 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-200"
          >
            {loading ? 'Saving...' : 'Save Blog'}
          </button>
      </div>
    </ProtectedRoute>
  );
}