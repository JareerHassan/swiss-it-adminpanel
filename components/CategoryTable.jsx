'use client';

import api from '../services/axios';

const CategoryTable = ({ categories = [], onEdit, onDelete }) => {

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            try {
                await api.delete(`/categories/${id}`);
                onDelete();
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Failed to delete category: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    // helper to build icon url
    const getIconUrl = (icon) => {
        if (!icon) return null;
    
        // already full URL
        if (icon.startsWith('http')) return icon;
    
        // get axios baseURL
        let base = api.defaults.baseURL 
    
        // remove trailing /api if it exists
        base = base.replace(/\/api\/?$/, '');
    
        // build full URL
        return `${base}/${icon}`;
    };
    

    if (!categories || categories.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Icon</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Slug</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => {
                            const iconUrl = getIconUrl(category.icon);

                            return (
                                <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                                    
                                    {/* ICON */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {iconUrl ? (
                                            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200">
                                                <img
                                                    src={iconUrl}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => (e.target.style.display = 'none')}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            </div>
                                        )}
                                    </td>

                                    {/* NAME */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {category.name}
                                        </div>
                                    </td>

                                    {/* SLUG */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 font-mono">
                                            {category.slug}
                                        </div>
                                    </td>

                                    {/* DESCRIPTION */}
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                            {category.description || '-'}
                                        </div>
                                    </td>

                                    {/* STATUS */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                category.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => onEdit(category)}
                                            className="text-blue-600 hover:text-blue-900 mr-4 font-semibold"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            className="text-red-600 hover:text-red-900 font-semibold"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryTable;
