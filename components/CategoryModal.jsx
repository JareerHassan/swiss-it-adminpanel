'use client';

import { useState, useEffect } from 'react';
import api from '../services/axios';

const CategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        type: 'business',
        isActive: true,
        // SEO fields
        meta_title: '',
        meta_description: '',
        focus_keyword: '',
        seo_slug: '',
        canonical_url: '',
        robots: 'index, follow',
        og_title: '',
        og_description: '',
        og_image: '',
        schema_markup: '',
        breadcrumb_title: '',
        page_language: 'en',
        last_updated_date: new Date().toISOString().split('T')[0],
    });
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                description: category.description || '',
                type: category.type || 'business',
                isActive: category.isActive !== undefined ? category.isActive : true,
                meta_title: category.seo?.meta_title || '',
                meta_description: category.seo?.meta_description || '',
                focus_keyword: category.seo?.focus_keyword || '',
                seo_slug: category.seo?.slug || '',
                canonical_url: category.seo?.canonical_url || '',
                robots: category.seo?.robots || 'index, follow',
                og_title: category.seo?.og_title || '',
                og_description: category.seo?.og_description || '',
                og_image: category.seo?.og_image || '',
                schema_markup: category.seo?.schema_markup
                    ? (typeof category.seo.schema_markup === 'string'
                        ? category.seo.schema_markup
                        : JSON.stringify(category.seo.schema_markup, null, 2))
                    : '',
                breadcrumb_title: category.seo?.breadcrumb_title || '',
                page_language: category.seo?.page_language || 'en',
                last_updated_date: category.seo?.last_updated_date
                    ? new Date(category.seo.last_updated_date).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
            });
            // Set icon preview if category has icon
            if (category.icon) {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketplacebackend.oxmite.com';
                const iconUrl = category.icon.startsWith('http') 
                    ? category.icon 
                    : `${API_BASE_URL}/${category.icon}`;
                setIconPreview(iconUrl);
            } else {
                setIconPreview('');
            }
        } else {
            setFormData({
                name: '',
                slug: '',
                description: '',
                type: 'business',
                isActive: true,
                meta_title: '',
                meta_description: '',
                focus_keyword: '',
                seo_slug: '',
                canonical_url: '',
                robots: 'index, follow',
                og_title: '',
                og_description: '',
                og_image: '',
                schema_markup: '',
                breadcrumb_title: '',
                page_language: 'en',
                last_updated_date: new Date().toISOString().split('T')[0],
            });
            setIconPreview('');
        }
        setIconFile(null);
        setError(''); // Clear error when modal opens/closes
    }, [category, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        if (error) setError(''); // Clear error on input change
    };

    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            setIconFile(file);
            setError('');
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setIconPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate name
        if (!formData.name || formData.name.trim() === '') {
            setError('Category name is required');
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            if (formData.slug.trim()) {
                formDataToSend.append('slug', formData.slug.trim());
            }
            formDataToSend.append('description', formData.description.trim() || '');
            formDataToSend.append('type', formData.type || 'business');
            formDataToSend.append('isActive', formData.isActive);
            
            // Add icon file if selected
            if (iconFile) {
                formDataToSend.append('icon', iconFile);
            }

            // SEO fields
            formDataToSend.append('meta_title', formData.meta_title || '');
            formDataToSend.append('meta_description', formData.meta_description || '');
            formDataToSend.append('focus_keyword', formData.focus_keyword || '');
            formDataToSend.append('seo_slug', formData.seo_slug || '');
            formDataToSend.append('canonical_url', formData.canonical_url || '');
            formDataToSend.append('robots', formData.robots || 'index, follow');
            formDataToSend.append('og_title', formData.og_title || '');
            formDataToSend.append('og_description', formData.og_description || '');
            formDataToSend.append('og_image', formData.og_image || '');
            if (formData.schema_markup) {
                formDataToSend.append('schema_markup', formData.schema_markup);
            }
            formDataToSend.append('breadcrumb_title', formData.breadcrumb_title || '');
            formDataToSend.append('page_language', formData.page_language || 'en');
            formDataToSend.append('last_updated_date', formData.last_updated_date || new Date().toISOString().split('T')[0]);

            if (category) {
                await api.put(`/categories/${category._id}`, formDataToSend);
            } else {
                await api.post('/categories', formDataToSend);
            }
            setLoading(false);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving category:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save category';
            setError(errorMessage);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-3xl max-h-[90vh] shadow-2xl rounded-2xl bg-white overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {category ? 'Edit Category' : 'Add New Category'}
                        </h3>
                        <p className="text-sm text-blue-100 mt-1">
                            {category ? 'Update category information' : 'Create a new category for your products'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-shake">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form id="category-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    placeholder="e.g., Web Development Tools"
                                    required
                                />
                            </div>
                        </div>

                        {/* Slug Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Slug
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="category-slug"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Auto-generated from name if left empty
                            </p>
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Brief description of this category..."
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 resize-none"
                            />
                        </div>

                        {/* Category Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                            >
                                <option value="business">Business Category</option>
                                <option value="tool">Tool Type Category</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Use <span className="font-semibold">Business</span> for industries/segments and <span className="font-semibold">Tool</span> for tool types.
                            </p>
                        </div>

                        {/* Icon Upload Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category Icon
                            </label>
                            <div className="space-y-3">
                                {iconPreview && (
                                    <div className="relative w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                                        <img
                                            src={iconPreview}
                                            alt="Icon preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIconPreview('');
                                                setIconFile(null);
                                            }}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleIconChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Recommended: Square image (e.g., 512x512px), max 5MB
                                </p>
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </div>
                                <div className="ml-3">
                                    <span className="text-sm font-semibold text-gray-900">Active Status</span>
                                    <p className="text-xs text-gray-500">Inactive categories won't appear in product selection</p>
                                </div>
                            </label>
                        </div>

                        {/* SEO Settings */}
                        <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                            <h4 className="text-sm font-semibold text-gray-800">SEO Settings</h4>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    name="meta_title"
                                    value={formData.meta_title}
                                    onChange={handleChange}
                                    maxLength={60}
                                    placeholder="Category page title"
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Meta Description
                                </label>
                                <textarea
                                    name="meta_description"
                                    value={formData.meta_description}
                                    onChange={handleChange}
                                    maxLength={160}
                                    rows="2"
                                    placeholder="Short description for search engines"
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Focus Keyword
                                    </label>
                                    <input
                                        type="text"
                                        name="focus_keyword"
                                        value={formData.focus_keyword}
                                        onChange={handleChange}
                                        placeholder="primary keyword"
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        SEO Slug (optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="seo_slug"
                                        value={formData.seo_slug}
                                        onChange={handleChange}
                                        placeholder="seo-friendly-slug"
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Canonical URL
                                </label>
                                <input
                                    type="url"
                                    name="canonical_url"
                                    value={formData.canonical_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/category-url"
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Robots
                                    </label>
                                    <select
                                        name="robots"
                                        value={formData.robots}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    >
                                        <option value="index, follow">index, follow</option>
                                        <option value="noindex, follow">noindex, follow</option>
                                        <option value="noindex, nofollow">noindex, nofollow</option>
                                        <option value="index, nofollow">index, nofollow</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Breadcrumb Title
                                    </label>
                                    <input
                                        type="text"
                                        name="breadcrumb_title"
                                        value={formData.breadcrumb_title}
                                        onChange={handleChange}
                                        placeholder="e.g. Categories > AI Tools"
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Page Language
                                    </label>
                                    <select
                                        name="page_language"
                                        value={formData.page_language}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    >
                                        <option value="en">English (en)</option>
                                        <option value="sv">Swedish (sv)</option>
                                        <option value="ar">Arabic (ar)</option>
                                        <option value="ur">Urdu (ur)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Last Updated Date
                                    </label>
                                    <input
                                        type="date"
                                        name="last_updated_date"
                                        value={formData.last_updated_date}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Open Graph Title
                                </label>
                                <input
                                    type="text"
                                    name="og_title"
                                    value={formData.og_title}
                                    onChange={handleChange}
                                    placeholder="Social share title"
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Open Graph Description
                                </label>
                                <textarea
                                    name="og_description"
                                    value={formData.og_description}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Social share description"
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Open Graph Image URL
                                </label>
                                <input
                                    type="url"
                                    name="og_image"
                                    value={formData.og_image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/og-image.jpg"
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Schema Markup (JSON-LD)
                                </label>
                                <textarea
                                    name="schema_markup"
                                    value={formData.schema_markup}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder='{"@context":"https://schema.org","@type":"Category"}'
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-mono text-xs"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="category-form"
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {category ? 'Update Category' : 'Create Category'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;
