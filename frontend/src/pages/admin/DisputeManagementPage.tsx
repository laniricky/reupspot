import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Filter, CheckCircle, XCircle } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface Dispute {
    id: string;
    reason: string;
    status: string;
    buyer_email: string;
    shop_name: string;
    total_amount: number;
    created_at: string;
    order_id: string;
}

type ActionType = 'refund' | 'reject' | null;

export function DisputeManagementPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [actionType, setActionType] = useState<ActionType>(null);
    const [adminNotes, setAdminNotes] = useState('');

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const params: any = { limit: 100 };
            if (statusFilter) params.status = statusFilter;

            const res = await api.get('/admin/disputes', { params });
            setDisputes(res.data.disputes);
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, [statusFilter]);

    const handleResolve = async (resolution: 'refund' | 'reject') => {
        if (!selectedDispute) return;

        try {
            await api.post(`/admin/disputes/${selectedDispute.id}/resolve`, {
                resolution,
                adminNotes
            });
            await fetchDisputes();
            setActionType(null);
            setSelectedDispute(null);
            setAdminNotes('');
        } catch (error) {
            console.error('Failed to resolve dispute:', error);
        }
    };

    const columns = [
        {
            key: 'id',
            header: 'Dispute ID',
            render: (dispute: Dispute) => (
                <span className="font-mono text-xs">{dispute.id.slice(0, 8)}</span>
            )
        },
        {
            key: 'buyer',
            header: 'Buyer',
            render: (dispute: Dispute) => dispute.buyer_email
        },
        {
            key: 'shop',
            header: 'Shop',
            render: (dispute: Dispute) => dispute.shop_name
        },
        {
            key: 'reason',
            header: 'Reason',
            render: (dispute: Dispute) => (
                <div className="max-w-xs truncate" title={dispute.reason}>
                    {dispute.reason}
                </div>
            )
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (dispute: Dispute) => `$${dispute.total_amount.toFixed(2)}`
        },
        {
            key: 'status',
            header: 'Status',
            render: (dispute: Dispute) => (
                <StatusBadge status={dispute.status} type="dispute" />
            )
        },
        {
            key: 'created',
            header: 'Created',
            render: (dispute: Dispute) => new Date(dispute.created_at).toLocaleDateString()
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (dispute: Dispute) => (
                <div className="flex gap-1">
                    {dispute.status !== 'resolved' && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDispute(dispute);
                                    setActionType('refund');
                                }}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Approve Refund"
                            >
                                <CheckCircle size={18} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDispute(dispute);
                                    setActionType('reject');
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Reject Dispute"
                            >
                                <XCircle size={18} />
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    if (loading && disputes.length === 0) return <LoadingSpinner size="lg" />;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable data={disputes} columns={columns} loading={loading} />
            </div>

            {/* Refund Modal */}
            {actionType === 'refund' && selectedDispute && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setActionType(null)}></div>
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Refund</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Dispute from {selectedDispute.buyer_email} for ${selectedDispute.total_amount.toFixed(2)}
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Notes
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Reason for approval..."
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setActionType(null); setSelectedDispute(null); setAdminNotes(''); }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleResolve('refund')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Approve Refund
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {actionType === 'reject' && selectedDispute && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setActionType(null)}></div>
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Dispute</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Dispute from {selectedDispute.buyer_email}
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Notes (Required)
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Reason for rejection..."
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setActionType(null); setSelectedDispute(null); setAdminNotes(''); }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleResolve('reject')}
                                    disabled={!adminNotes.trim()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Reject Dispute
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
