import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';

interface Order {
    id: string;
    status: string;
    total_amount: string;
    created_at: string;
    buyer_email?: string;
}

export function SellerOrderListPage() {
    const { shop } = useOutletContext<{ shop: { id: string } }>();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            if (!shop?.id) return;
            try {
                const params: any = {};
                if (statusFilter) params.status = statusFilter;

                const response = await api.get(`/orders/seller/${shop.id}`, { params });
                setOrders(response.data.orders || response.data || []);
            } catch (error) {
                console.error('Failed to fetch orders', error);
                // Mock data
                setOrders([
                    { id: '1', status: 'pending', total_amount: '1500.00', created_at: new Date().toISOString(), buyer_email: 'buyer@example.com' },
                    { id: '2', status: 'shipped', total_amount: '3200.00', created_at: new Date(Date.now() - 86400000).toISOString(), buyer_email: 'customer@test.com' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [shop?.id, statusFilter]);

    if (loading) return <div>Loading orders...</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'disputed': return 'bg-purple-100 text-purple-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
                <div className="flex space-x-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="disputed">Disputed</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {orders.length === 0 ? (
                        <li className="px-4 py-8 text-center text-gray-500">No orders found.</li>
                    ) : (
                        orders.map((order) => (
                            <li key={order.id} className="hover:bg-gray-50">
                                <Link to={`/seller/orders/${order.id}`} className="block px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-blue-600 truncate">
                                                Order #{order.id.slice(0, 8)}
                                            </div>
                                            <div className="mt-1 text-sm text-gray-500">
                                                {order.buyer_email || 'Guest Buyer'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <div className="mt-1 text-sm text-gray-900">
                                                KSh {Number(order.total_amount).toLocaleString()}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
