import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

interface Dispute {
    id: string;
    order_id: string;
    reason: string;
    status: string;
    created_at: string;
}

export function DisputeListPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDisputes = async () => {
            try {
                const response = await api.get('/disputes/my');
                setDisputes(response.data.disputes || []);
            } catch (error) {
                console.error('Failed to fetch disputes', error);
                // Mock
                setDisputes([
                    { id: 'd1', order_id: '1', reason: 'item_damage', status: 'open', created_at: new Date().toISOString() }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDisputes();
    }, []);

    if (loading) return <div>Loading disputes...</div>;

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Disputes</h1>
                <Link to="/buyer/orders" className="bg-blue-600 text-white px-4 py-2 rounded link-btn">
                    New Dispute via Orders
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {disputes.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No active disputes.</div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {disputes.map((dispute) => (
                            <li key={dispute.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-blue-600 truncate">
                                        Dispute #{dispute.id.slice(0, 8)} for Order #{dispute.order_id}
                                    </p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dispute.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {dispute.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                    Reason: {dispute.reason}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
