'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import ProductTable from '../../components/ProductTable';
import ProductModal from '../../components/ProductModal';
import api from '../../services/axios';
import { getToken } from '../../utils/auth';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/login');
        } else {
            fetchProducts();
            fetchCategories();
        }
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm, selectedCategory]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/products');
            console.log(data);
            setProducts(data);
            setFilteredProducts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.shortDescription || product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by category (match primary or multi-category arrays)
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => {
                const primaryCategoryId = product.category?._id || product.category;
                const businessIds = (product.businessCategories || []).map(
                    (c) => c?._id || c
                );
                const toolIds = (product.toolCategories || []).map(
                    (c) => c?._id || c
                );
                return (
                    primaryCategoryId === selectedCategory ||
                    businessIds.includes(selectedCategory) ||
                    toolIds.includes(selectedCategory)
                );
            });
        }

        setFilteredProducts(filtered);
    };

    const handleAddProduct = () => {
        setCurrentProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
    };

    const handleSuccess = () => {
        fetchProducts();
    };

    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setSelectedProduct(null);
        setIsViewModalOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                                    <p className="text-gray-600 mt-1">Manage your marketplace products</p>
                                </div>
                                <button
                                    onClick={handleAddProduct}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Product
                                </button>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Products</p>
                                            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                                        </div>
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Filtered</p>
                                            <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
                                        </div>
                                        <div className="p-3 bg-purple-100 rounded-lg">
                                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Categories</p>
                                            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                                        </div>
                                        <div className="p-3 bg-green-100 rounded-lg">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Active</p>
                                            <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.category).length}</p>
                                        </div>
                                        <div className="p-3 bg-orange-100 rounded-lg">
                                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search and Filter Bar */}
                            <div className="bg-white rounded-lg shadow p-4 mb-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Search */}
                                    <div className="flex-1">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search products by name, description, or tags..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Category Filter */}
                                    <div className="md:w-64">
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="all">All Categories</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* View Toggle */}
                                    <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded transition-colors ${
                                                viewMode === 'grid'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                            title="Grid View"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`p-2 rounded transition-colors ${
                                                viewMode === 'table'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                            title="Table View"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Display */}
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <ProductTable
                                products={filteredProducts}
                                onEdit={handleEditProduct}
                                onView={handleViewProduct}
                                onDelete={fetchProducts}
                                viewMode={viewMode}
                            />
                        )}
                    </div>
                </main>
            </div>
            <ProductModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                product={currentProduct}
                onSuccess={handleSuccess}
            />

            {/* View Product Modal */}
            {isViewModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-scaleIn">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            {selectedProduct.category?.name || 'Uncategorized'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {selectedProduct.createdAt 
                                                ? new Date(selectedProduct.createdAt).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                  })
                                                : '-'}
                                        </span>
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            {selectedProduct.pricingModel || 'Paid'}
                                        </span>
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {selectedProduct.productType === 'featuredProduct' ? 'Featured Product' : 'User Product'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseViewModal}
                                    className="p-2 hover:bg-gray-100 text-black rounded-lg transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Product Image */}
                            {selectedProduct.image && (
                                <div className="relative h-80 rounded-xl overflow-hidden mb-6 shadow-lg">
                                    <img
                                        src={`${api.defaults.baseURL?.replace('/api', '')}/${selectedProduct.image}`}
                                        alt={selectedProduct.name}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                </div>
                            )}

                            {/* Basic Information */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Short Description</label>
                                    <p className="text-gray-900 mt-1">{selectedProduct.shortDescription || selectedProduct.description || 'Not set'}</p>
                                </div>
                                {selectedProduct.fullDescription && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Full Description</label>
                                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedProduct.fullDescription}</p>
                                    </div>
                                )}
                                {selectedProduct.useCase && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Use Case</label>
                                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedProduct.useCase}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Website Link</label>
                                    <a href={selectedProduct.websiteLink || selectedProduct.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 block">
                                        {selectedProduct.websiteLink || selectedProduct.link}
                                    </a>
                                </div>
                                {selectedProduct.bestFor && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Best For</label>
                                        <p className="text-gray-900 mt-1">{selectedProduct.bestFor}</p>
                                    </div>
                                )}
                            </div>

                            {/* Categories */}
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                                <div className="space-y-3">
                                    {selectedProduct.category && (
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Primary Category</label>
                                            <p className="text-gray-900 mt-1">{selectedProduct.category.name || selectedProduct.category}</p>
                                        </div>
                                    )}
                                    {selectedProduct.businessCategories && selectedProduct.businessCategories.length > 0 && (
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Business Categories</label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedProduct.businessCategories.map((cat, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                        {cat?.name || cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedProduct.toolCategories && selectedProduct.toolCategories.length > 0 && (
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Tool Type Categories</label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedProduct.toolCategories.map((cat, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                                        {cat?.name || cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pros */}
                            {selectedProduct.pros && selectedProduct.pros.length > 0 && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pros</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {selectedProduct.pros.map((pro, idx) => (
                                            <li key={idx} className="text-gray-700">{pro}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Limitations */}
                            {selectedProduct.limitations && selectedProduct.limitations.length > 0 && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Limitations</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {selectedProduct.limitations.map((lim, idx) => (
                                            <li key={idx} className="text-gray-700">{lim}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Tags */}
                            {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProduct.tags.map((tag, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SEO Data Section */}
                            {selectedProduct.seo && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        SEO Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Meta Title</label>
                                            <p className="text-gray-900 mt-1">{selectedProduct.seo.meta_title || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Focus Keyword</label>
                                            <p className="text-gray-900 mt-1">{selectedProduct.seo.focus_keyword || 'Not set'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-semibold text-gray-600">Meta Description</label>
                                            <p className="text-gray-900 mt-1">{selectedProduct.seo.meta_description || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">SEO Slug</label>
                                            <p className="text-gray-900 mt-1 font-mono text-sm">{selectedProduct.seo.slug || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Canonical URL</label>
                                            <p className="text-gray-900 mt-1 break-all text-sm">{selectedProduct.seo.canonical_url || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Robots</label>
                                            <p className="text-gray-900 mt-1">{selectedProduct.seo.robots || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Page Language</label>
                                            <p className="text-gray-900 mt-1">{selectedProduct.seo.page_language || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Breadcrumb Title</label>
                                            <p className="text-gray-900 mt-1">{selectedProduct.seo.breadcrumb_title || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">OG Title</label>
                                            <p className="text-gray-900 mt-1">{selectedProduct.seo.og_title || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">OG Description</label>
                                            <p className="text-gray-900 mt-1">{selectedProduct.seo.og_description || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">OG Image</label>
                                            <p className="text-gray-900 mt-1 break-all text-sm">{selectedProduct.seo.og_image || 'Not set'}</p>
                                        </div>
                                        {selectedProduct.seo.schema_markup && (
                                            <div className="md:col-span-2">
                                                <label className="text-sm font-semibold text-gray-600">Schema Markup</label>
                                                <pre className="text-gray-900 mt-1 bg-white p-3 rounded border text-xs overflow-auto">
                                                    {JSON.stringify(selectedProduct.seo.schema_markup, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Last Updated</label>
                                            <p className="text-gray-900 mt-1">
                                                {selectedProduct.seo.last_updated_date 
                                                    ? new Date(selectedProduct.seo.last_updated_date).toLocaleString('en-US', {
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

                            {/* Timeline */}
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <label className="text-sm font-semibold text-gray-600">Created At</label>
                                        <p className="text-gray-900 mt-1">
                                            {selectedProduct.createdAt 
                                                ? new Date(selectedProduct.createdAt).toLocaleString('en-US', {
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
                                            {selectedProduct.updatedAt 
                                                ? new Date(selectedProduct.updatedAt).toLocaleString('en-US', {
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

                            {/* Actions */}
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => {
                                        handleCloseViewModal();
                                        handleEditProduct(selectedProduct);
                                    }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-400 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
