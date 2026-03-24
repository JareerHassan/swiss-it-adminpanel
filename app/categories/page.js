'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import CategoryTable from '../../components/CategoryTable';
import CategoryModal from '../../components/CategoryModal';
import api from '../../services/axios';
import { getToken } from '../../utils/auth';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/login');
        } else {
            fetchCategories();
        }
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/categories');
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        setCurrentCategory(null);
        setIsModalOpen(true);
    };

    const handleEditCategory = (category) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCategory(null);
    };

    const handleSuccess = () => {
        fetchCategories();
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                                <p className="text-gray-600 mt-1">Manage product categories</p>
                            </div>
                            <button
                                onClick={handleAddCategory}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Category
                            </button>
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <CategoryTable
                                categories={categories}
                                onEdit={handleEditCategory}
                                onDelete={fetchCategories}
                            />
                        )}
                    </div>
                </main>
            </div>
            <CategoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                category={currentCategory}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default CategoriesPage;
