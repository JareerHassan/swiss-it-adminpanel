'use client';

import { useState } from 'react';

const SubmissionModal = ({ isOpen, onClose, submission, onStatusChange }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    if (!isOpen || !submission) return null;

    const handleApprove = async () => {
        setActionLoading(true);
        await onStatusChange(submission._id, 'approved');
        setActionLoading(false);
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        setActionLoading(true);
        await onStatusChange(submission._id, 'rejected', rejectionReason);
        setActionLoading(false);
        setRejectionReason('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Submission Details</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tool Name</label>
                            <p className="text-gray-900">{submission.toolName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                            <p className="text-gray-900">{submission.category?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pricing</label>
                            {submission.isPaid ? (
                                <p className="text-gray-900 font-semibold">${submission.price?.toFixed(2) || '0.00'} USD</p>
                            ) : (
                                <p className="text-gray-900">Free</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{submission.description}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Website</label>
                        <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {submission.website}
                        </a>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Submitted By</label>
                            <p className="text-gray-900">{submission.submittedBy?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{submission.submittedBy?.email || ''}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Submitted On</label>
                            <p className="text-gray-900">{new Date(submission.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    {submission.status === 'rejected' && submission.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <label className="block text-sm font-semibold text-red-700 mb-1">Rejection Reason</label>
                            <p className="text-red-900">{submission.rejectionReason}</p>
                        </div>
                    )}

                    {submission.status === 'pending' && (
                        <div className="border-t pt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Rejection Reason (if rejecting)
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    rows="3"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? 'Processing...' : 'Approve Submission'}
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading || !rejectionReason.trim()}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? 'Processing...' : 'Reject Submission'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionModal;
