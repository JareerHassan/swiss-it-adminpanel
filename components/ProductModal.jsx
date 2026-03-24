'use client';

import { useState, useEffect } from 'react';
import api from '../services/axios';

const ProductModal = ({ isOpen, onClose, product, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [categories, setCategories] = useState([]);
    const [businessCategories, setBusinessCategories] = useState([]);
    const [toolCategories, setToolCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        shortDescription: '',
        fullDescription: '',
        category: '',
        businessCategories: [],
        toolCategories: [],
        useCase: '',
        pricingModel: 'Paid',
        productType: 'userProduct',
        websiteLink: '',
        pros: '',
        limitations: '',
        bestFor: '',
        tags: '',
        image: null,
        // SEO Fields
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

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories/active');
            setCategories(data);
            // Separate by type
            setBusinessCategories(data.filter(cat => cat.type === 'business'));
            setToolCategories(data.filter(cat => cat.type === 'tool'));
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        if (product) {
            // Handle primary category - it can be an object with _id or just _id string
            const categoryId = product.category?._id || product.category || '';

            const businessCategoryIds = (product.businessCategories || []).map(
                (c) => c?._id || c
            );
            const toolCategoryIds = (product.toolCategories || []).map(
                (c) => c?._id || c
            );
            
            // Set image preview using api baseURL
            if (product.image) {
                const baseURL = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
                setImagePreview(`${baseURL}/${product.image}`);
            } else {
                setImagePreview(null);
            }
            
            setFormData({
                name: product.name || '',
                slug: product.slug || '',
                shortDescription: product.shortDescription || product.description || '',
                fullDescription: product.fullDescription || '',
                category: categoryId,
                businessCategories: businessCategoryIds,
                toolCategories: toolCategoryIds,
                useCase: product.useCase || '',
                pricingModel: product.pricingModel || 'Paid',
                productType: product.productType || 'userProduct',
                websiteLink: product.websiteLink || product.link || '',
                pros: product.pros ? product.pros.join(', ') : (product.features ? product.features.join(', ') : ''),
                limitations: product.limitations ? product.limitations.join(', ') : '',
                bestFor: product.bestFor || '',
                tags: product.tags ? product.tags.join(', ') : '',
                image: null,
                // SEO Fields
                meta_title: product.seo?.meta_title || '',
                meta_description: product.seo?.meta_description || '',
                focus_keyword: product.seo?.focus_keyword || '',
                seo_slug: product.seo?.slug || '',
                canonical_url: product.seo?.canonical_url || '',
                robots: product.seo?.robots || 'index, follow',
                og_title: product.seo?.og_title || '',
                og_description: product.seo?.og_description || '',
                og_image: product.seo?.og_image || '',
                schema_markup: product.seo?.schema_markup ? JSON.stringify(product.seo.schema_markup, null, 2) : '',
                breadcrumb_title: product.seo?.breadcrumb_title || '',
                page_language: product.seo?.page_language || 'en',
                last_updated_date: product.seo?.last_updated_date 
                    ? new Date(product.seo.last_updated_date).toISOString().split('T')[0] 
                    : new Date().toISOString().split('T')[0],
            });
        } else {
            setImagePreview(null);
            setFormData({
                name: '',
                slug: '',
                shortDescription: '',
                fullDescription: '',
                category: '',
                businessCategories: [],
                toolCategories: [],
                useCase: '',
                pricingModel: 'Paid',
                productType: 'userProduct',
                websiteLink: '',
                pros: '',
                limitations: '',
                bestFor: '',
                tags: '',
                image: null,
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
        }
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (submitError) setSubmitError(''); // Clear error on input change
    };

    const handleBusinessCategoriesChange = (e) => {
        const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
        setFormData((prev) => ({ ...prev, businessCategories: values }));
        if (submitError) setSubmitError('');
    };

    const handleToolCategoriesChange = (e) => {
        const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
        setFormData((prev) => ({ ...prev, toolCategories: values }));
        if (submitError) setSubmitError('');
    };

    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getCharacterCount = (text, maxLength) => {
        return `${text?.length || 0}/${maxLength}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitting(true);

        // Client-side validation
        if (!formData.name || formData.name.trim() === '') {
            setSubmitError('Product name is required');
            setSubmitting(false);
            return;
        }
        if (!formData.shortDescription || formData.shortDescription.trim() === '') {
            setSubmitError('Short description is required');
            setSubmitting(false);
            return;
        }
        if (
            (!formData.businessCategories || formData.businessCategories.length === 0) &&
            (!formData.toolCategories || formData.toolCategories.length === 0)
        ) {
            setSubmitError('At least one category (business or tool type) is required');
            setSubmitting(false);
            return;
        }
        if (!formData.websiteLink || formData.websiteLink.trim() === '') {
            setSubmitError('Website link is required');
            setSubmitting(false);
            return;
        }
        if (!product && !formData.image) {
            setSubmitError('Product image is required');
            setSubmitting(false);
            return;
        }

        const data = new FormData();
        
        // Basic Info Fields
        data.append('name', formData.name.trim());
        data.append('slug', formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        data.append('shortDescription', formData.shortDescription.trim());
        data.append('fullDescription', formData.fullDescription || '');

        // Determine primary category (first of business, then tool)
        const primaryCategory =
            (formData.businessCategories && formData.businessCategories[0]) ||
            (formData.toolCategories && formData.toolCategories[0]) ||
            formData.category;

        if (primaryCategory) {
            data.append('category', primaryCategory);
        }

        // Multi-category arrays
        data.append(
            'businessCategories',
            JSON.stringify(formData.businessCategories || [])
        );
        data.append(
            'toolCategories',
            JSON.stringify(formData.toolCategories || [])
        );
        data.append('useCase', formData.useCase || '');
        data.append('pricingModel', formData.pricingModel || 'Paid');
        data.append('productType', formData.productType || 'userProduct');
        data.append('websiteLink', formData.websiteLink.trim());
        
        // Handle array fields - only split if not empty
        const prosArray = formData.pros && formData.pros.trim() ? formData.pros.split(',').map((f) => f.trim()).filter(f => f) : [];
        const limitationsArray = formData.limitations && formData.limitations.trim() ? formData.limitations.split(',').map((f) => f.trim()).filter(f => f) : [];
        const tagsArray = formData.tags && formData.tags.trim() ? formData.tags.split(',').map((f) => f.trim()).filter(f => f) : [];
        
        data.append('pros', JSON.stringify(prosArray));
        data.append('limitations', JSON.stringify(limitationsArray));
        data.append('bestFor', formData.bestFor || '');
        data.append('tags', JSON.stringify(tagsArray));
        
        // SEO Fields
        data.append('meta_title', formData.meta_title || '');
        data.append('meta_description', formData.meta_description || '');
        data.append('focus_keyword', formData.focus_keyword || '');
        data.append('seo_slug', formData.seo_slug || '');
        data.append('canonical_url', formData.canonical_url || '');
        data.append('robots', formData.robots || 'index, follow');
        data.append('og_title', formData.og_title || '');
        data.append('og_description', formData.og_description || '');
        data.append('og_image', formData.og_image || '');
        if (formData.schema_markup) {
            data.append('schema_markup', formData.schema_markup);
        }
        data.append('breadcrumb_title', formData.breadcrumb_title || '');
        data.append('page_language', formData.page_language || 'en');
        data.append('last_updated_date', formData.last_updated_date || new Date().toISOString().split('T')[0]);
        
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (product) {
                await api.put(`/products/${product._id}`, data);
            } else {
                await api.post('/products', data);
            }
            setSubmitting(false);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save product';
            setSubmitError(errorMessage);
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-5xl max-h-[95vh] shadow-2xl rounded-2xl bg-white overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {product ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <p className="text-sm text-blue-100 mt-1">
                            {activeTab === 'basic' && 'Basic Information'}
                            {activeTab === 'seo' && 'SEO Settings'}
                            {activeTab === 'social' && 'Social Media'}
                            {activeTab === 'advanced' && 'Advanced SEO'}
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

                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                    
                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('basic')}
                                    className={`py-3 px-4 border-b-2 font-semibold text-sm rounded-t-lg transition-all ${
                                        activeTab === 'basic'
                                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Basic Info
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('seo')}
                                    className={`py-3 px-4 border-b-2 font-semibold text-sm rounded-t-lg transition-all ${
                                        activeTab === 'seo'
                                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        SEO Settings
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('social')}
                                    className={`py-3 px-4 border-b-2 font-semibold text-sm rounded-t-lg transition-all ${
                                        activeTab === 'social'
                                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Social Media
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('advanced')}
                                    className={`py-3 px-4 border-b-2 font-semibold text-sm rounded-t-lg transition-all ${
                                        activeTab === 'advanced'
                                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Advanced SEO
                                    </div>
                                </button>
                            </nav>
                        </div>

                    {submitError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-shake">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-700">{submitError}</p>
                        </div>
                    )}

                    <form id="product-form" onSubmit={handleSubmit}>
                        {/* Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Slug <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            placeholder="product-name-slug"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (auto-generated from name if empty)</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Short Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Brief description of the product"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Full Description
                                    </label>
                                    <textarea
                                        name="fullDescription"
                                        value={formData.fullDescription}
                                        onChange={handleChange}
                                        rows="6"
                                        placeholder="Detailed description of the product, features, and benefits"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Business Categories <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            multiple
                                            value={formData.businessCategories || []}
                                            onChange={handleBusinessCategoriesChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 h-28"
                                            required
                                        >
                                            {businessCategories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name} (Business)
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Hold Ctrl (Windows) or Command (Mac) to select multiple.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Tool Type Categories
                                        </label>
                                        <select
                                            multiple
                                            value={formData.toolCategories || []}
                                            onChange={handleToolCategoriesChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 h-28"
                                        >
                                            {toolCategories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name} (Tool type)
                                                </option>
                                            ))}
                                        </select>
                                        {businessCategories.length === 0 && toolCategories.length === 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                No categories available. <a href="/categories" className="text-blue-600 hover:underline">Create one</a>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Pricing Model
                                        </label>
                                        <select
                                            name="pricingModel"
                                            value={formData.pricingModel}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                        >
                                            <option value="Free">Free</option>
                                            <option value="Freemium">Freemium</option>
                                            <option value="Paid">Paid</option>
                                            <option value="One-time">One-time</option>
                                            <option value="Subscription">Subscription</option>
                                            <option value="Custom">Custom</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Product Type
                                        </label>
                                        <select
                                            name="productType"
                                            value={formData.productType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                                        >
                                            <option value="userProduct">User Product</option>
                                            <option value="featuredProduct">Featured Product</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Use Case
                                    </label>
                                    <textarea
                                        name="useCase"
                                        value={formData.useCase}
                                        onChange={handleChange}
                                        rows="2"
                                        placeholder="Describe when and how this product should be used"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Website Link <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="websiteLink"
                                        value={formData.websiteLink}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Pros (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="pros"
                                        value={formData.pros}
                                        onChange={handleChange}
                                        placeholder="Advantage 1, Advantage 2, Advantage 3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Limitations (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="limitations"
                                        value={formData.limitations}
                                        onChange={handleChange}
                                        placeholder="Limitation 1, Limitation 2, Limitation 3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Best For
                                    </label>
                                    <input
                                        type="text"
                                        name="bestFor"
                                        value={formData.bestFor}
                                        onChange={handleChange}
                                        placeholder="e.g., Small businesses, Developers, Designers"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Tags (comma separated keywords)
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="keyword1, keyword2, keyword3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Image {!product && <span className="text-red-500">*</span>}
                                    </label>
                                    {imagePreview && (
                                        <div className="mb-4">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept="image/*"
                                                required={!product && !imagePreview}
                                            />
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-600">
                                                    <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SEO Settings Tab */}
                        {activeTab === 'seo' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Meta Title (Page Title)
                                        <span className="text-gray-500 text-xs ml-2">
                                            {getCharacterCount(formData.meta_title, 60)} characters (Recommended: 55-60)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="meta_title"
                                        value={formData.meta_title}
                                        onChange={handleChange}
                                        maxLength={60}
                                        placeholder="Best Web Development Company in Pakistan"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Meta Description
                                        <span className="text-gray-500 text-xs ml-2">
                                            {getCharacterCount(formData.meta_description, 160)} characters (Recommended: 150-160)
                                        </span>
                                    </label>
                                    <textarea
                                        name="meta_description"
                                        value={formData.meta_description}
                                        onChange={handleChange}
                                        maxLength={160}
                                        rows="3"
                                        placeholder="We provide professional web development and SEO services in Pakistan."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Focus Keyword / Primary Keyword
                                    </label>
                                    <input
                                        type="text"
                                        name="focus_keyword"
                                        value={formData.focus_keyword}
                                        onChange={handleChange}
                                        placeholder="web development, company Pakistan"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        SEO URL Slug (Permalink)
                                    </label>
                                    <input
                                        type="text"
                                        name="seo_slug"
                                        value={formData.seo_slug}
                                        onChange={handleChange}
                                        placeholder="/web-development-services"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Example: /web-development-services (Different from product slug)</p>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Canonical URL
                                    </label>
                                    <input
                                        type="url"
                                        name="canonical_url"
                                        value={formData.canonical_url}
                                        onChange={handleChange}
                                        placeholder="https://example.com/web-development-services"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Robots Meta
                                    </label>
                                    <select
                                        name="robots"
                                        value={formData.robots}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    >
                                        <option value="index, follow">index, follow (Default)</option>
                                        <option value="noindex, follow">noindex, follow</option>
                                        <option value="noindex, nofollow">noindex, nofollow</option>
                                        <option value="index, nofollow">index, nofollow</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Breadcrumb Title
                                    </label>
                                    <input
                                        type="text"
                                        name="breadcrumb_title"
                                        value={formData.breadcrumb_title}
                                        onChange={handleChange}
                                        placeholder="Services > Web Development"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Page Language
                                    </label>
                                    <select
                                        name="page_language"
                                        value={formData.page_language}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    >
                                        <option value="en">English (en)</option>
                                        <option value="ur">Urdu (ur)</option>
                                        <option value="ar">Arabic (ar)</option>
                                        <option value="es">Spanish (es)</option>
                                        <option value="fr">French (fr)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Last Updated Date
                                    </label>
                                    <input
                                        type="date"
                                        name="last_updated_date"
                                        value={formData.last_updated_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Social Media Tab */}
                        {activeTab === 'social' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Open Graph Title (OG Title)
                                    </label>
                                    <input
                                        type="text"
                                        name="og_title"
                                        value={formData.og_title}
                                        onChange={handleChange}
                                        placeholder="Top Web Development Services"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Open Graph Description (OG Description)
                                    </label>
                                    <textarea
                                        name="og_description"
                                        value={formData.og_description}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Grow your business with our professional web solutions."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Open Graph Image URL (OG Image)
                                        <span className="text-gray-500 text-xs ml-2">Recommended size: 1200 x 630</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="og_image"
                                        value={formData.og_image}
                                        onChange={handleChange}
                                        placeholder="https://example.com/og-image.jpg"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Advanced SEO Tab */}
                        {activeTab === 'advanced' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Schema Markup (JSON-LD)
                                        <span className="text-gray-500 text-xs ml-2">Enter valid JSON</span>
                                    </label>
                                    <textarea
                                        name="schema_markup"
                                        value={formData.schema_markup}
                                        onChange={handleChange}
                                        rows="12"
                                        placeholder={`{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Web Solutions",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png"
}`}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-xs"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supported types: Organization, Product, Article, LocalBusiness
                                    </p>
                                </div>
                            </div>
                        )}

                    </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="product-form"
                        disabled={submitting}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {submitting ? (
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
                                {product ? 'Update Product' : 'Create Product'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
