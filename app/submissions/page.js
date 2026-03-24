'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import api from '../../services/axios';
import SubmissionTable from '../../components/SubmissionTable';
import SubmissionModal from '../../components/SubmissionModal';

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, [statusFilter]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const params = statusFilter !== 'all' ? { status: statusFilter } : {};
            const response = await api.get('/submissions', { params });
            setSubmissions(response.data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewSubmission = (submission) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (submissionId, status, rejectionReason = '') => {
        try {
            await api.put(`/submissions/${submissionId}/status`, { status, rejectionReason });
            fetchSubmissions();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating submission status:', error);
            alert('Failed to update submission: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteSubmission = async (submissionId) => {
        if (confirm('Are you sure you want to delete this submission?')) {
            try {
                await api.delete(`/submissions/${submissionId}`);
                fetchSubmissions();
            } catch (error) {
                console.error('Error deleting submission:', error);
                alert('Failed to delete submission: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const filteredSubmissions = submissions.filter(submission =>
        submission.toolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.submittedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.submittedBy?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Tool Submissions</h1>
                                <p className="text-gray-600 mt-1">Review and manage tool submissions</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
                                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
                                <div className="text-sm text-yellow-700 mb-1">Pending</div>
                                <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
                            </div>
                            <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
                                <div className="text-sm text-green-700 mb-1">Approved</div>
                                <div className="text-2xl font-bold text-green-800">{stats.approved}</div>
                            </div>
                            <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
                                <div className="text-sm text-red-700 mb-1">Rejected</div>
                                <div className="text-2xl font-bold text-red-800">{stats.rejected}</div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by tool name or submitter..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <SubmissionTable
                            submissions={filteredSubmissions}
                            onView={handleViewSubmission}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteSubmission}
                        />
                    )}

                    <SubmissionModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        submission={selectedSubmission}
                        onStatusChange={handleStatusChange}
                    />
                </main>
            </div>
        </div>
    );
}
