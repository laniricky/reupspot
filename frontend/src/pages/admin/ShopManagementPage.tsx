import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Filter, Lock, Unlock, Ban, TrendingUp } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface Shop {
    id: string;
    name: string;
    slug: string;
    status: 'active' | 'frozen' | 'suspended';
    owner_email: string;
    trust_score: number;
    product_count: number;
    order_count: number;
    created_at: string;
}

type ActionType = 'freeze' | 'activate' | 'suspend' | 'override-trust' | null;

export function ShopManagementPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [actionType, setActionType] = useState<ActionType>(null);
    const [newTrustScore, setNewTrustScore] = useState<number>(50);

    const fetchShops = async () => {
        try {
            setLoading(true);
            const params: any = { limit: 100 };
            if (statusFilter) params.status = statusFilter;

            const res = await api.get('/admin/shops', { params });
            setShops(res.data.shops);
        } catch (error) {
            console.error('Failed to fetch shops:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, [statusFilter]);

    const handleStatusChange = async (status: 'active' | 'frozen' | 'suspended') => {
        if (!selectedShop) return;

        try {
            await api.post(`/admin/shops/${selectedShop.id}/status`, {
                status,
                reason: `Admin changed status to ${status}`
            });
            await fetchShops();
            setActionType(null);
            setSelectedShop(null);
        } catch (error) {
            console.error('Failed to update shop status:', error);
        }
    };

    const handleTrustScoreOverride = async () => {
        if (!selectedShop) return;

        try {
            await api.post(`/admin/shops/${selectedShop.id}/trust-score`, {
                score: newTrustScore,
                reason: 'Manual admin override'
            });
            await fetchShops();
            setActionType(null);
            setSelectedShop(null);
            setNewTrustScore(50);
        } catch (error) {
            console.error('Failed to override trust score:', error);
        }
    };

    const getTrustScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const columns = [
        {
            key: 'name',
            header: 'Shop Name',
            render: (shop: Shop) => (
                <div>
                    <div className="font-medium">{shop.name}</div>
                    <div className="text-xs text-gray-500">/{shop.slug}</div>
                </div>
            )
        },
        {
            key: 'owner',
            header: 'Owner',
            render: (shop: Shop) => shop.owner_email
        },
        {
            key: 'status',
            header: 'Status',
            render: (shop: Shop) => <StatusBadge status={shop.status} type="shop" />
        },
        {
            key: 'trust',
            header: 'Trust Score',
            render: (shop: Shop) => (
                <span className={`font-semibold ${getTrustScoreColor(shop.trust_score || 50)}`}>
                    {shop.trust_score || 50}
                </span>
            )
        },
        {
            key: 'stats',
            header: 'Products / Orders',
            render: (shop: Shop) => `${shop.product_count || 0} / ${shop.order_count || 0}`
        },
        {
            key: 'created',
            header: 'Created',
            render: (shop: Shop) => new Date(shop.created_at).toLocaleDateString()
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (shop: Shop) => (
                <div className="flex gap-1">
                    {shop.status !== 'active' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShop(shop);
                                setActionType('activate');
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Activate"
                        >
                            <Unlock size={18} />
                        </button>
                    )}
                    {shop.status === 'active' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShop(shop);
                                setActionType('freeze');
                            }}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Freeze"
                        >
                            <Lock size={18} />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShop(shop);
                            setActionType('suspend');
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Suspend"
                    >
                        <Ban size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShop(shop);
                            setNewTrustScore(shop.trust_score || 50);
                            setActionType('override-trust');
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Override Trust Score"
                    >
                        <TrendingUp size={18} />
                    </button>
                </div>
            )
        }
    ];

    if (loading && shops.length === 0) return <LoadingSpinner size="lg" />;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Shop Management</h1>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="frozen">Frozen</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable data={shops} columns={columns} loading={loading} />
            </div>

            {/* Freeze Modal */}
            <ConfirmationModal
                isOpen={actionType === 'freeze'}
                title="Freeze Shop"
                message={`Freeze "${selectedShop?.name}"? This will pause all operations temporarily.`}
                confirmText="Freeze"
                variant="warning"
                onConfirm={() => handleStatusChange('frozen')}
                onCancel={() => { setActionType(null); setSelectedShop(null); }}
            />

            {/* Activate Modal */}
            <ConfirmationModal
                isOpen={actionType === 'activate'}
                title="Activate Shop"
                message={`Activate "${selectedShop?.name}"? This will restore normal operations.`}
                confirmText="Activate"
                variant="info"
                onConfirm={() => handleStatusChange('active')}
                onCancel={() => { setActionType(null); setSelectedShop(null); }}
            />

            {/* Suspend Modal */}
            <ConfirmationModal
                isOpen={actionType === 'suspend'}
                title="Suspend Shop"
                message={`Suspend "${selectedShop?.name}"? This is a severe action that will block all shop activities.`}
                confirmText="Suspend"
                variant="danger"
                onConfirm={() => handleStatusChange('suspended')}
                onCancel={() => { setActionType(null); setSelectedShop(null); }}
            />

            {/* Trust Score Override Modal */}
            {actionType === 'override-trust' && selectedShop && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setActionType(null)}></div>
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Override Trust Score</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Current score for "{selectedShop.name}": {selectedShop.trust_score || 50}
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Trust Score (0-100)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newTrustScore}
                                    onChange={(e) => setNewTrustScore(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setActionType(null); setSelectedShop(null); }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTrustScoreOverride}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Override
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
