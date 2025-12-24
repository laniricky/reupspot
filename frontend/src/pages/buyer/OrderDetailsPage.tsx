import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useParams, Link } from 'react-router-dom';

export function OrderDetailsPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${orderId}`);
                setOrder(response.data.order);
            } catch (error) {
                console.error('Failed to fetch order', error);
                // Mock
                setOrder({
                    id: orderId,
                    status: 'pending',
                    total_amount: 1250,
                    items: [
                        { id: 'i1', product_name: 'Wireless Mouse', quantity: 1, price: 1250 }
                    ],
                    created_at: new Date().toISOString()
                });
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    const markReceived = async () => {
        if (!confirm('Confirm receipt of goods? This will release funds to the seller.')) return;
        try {
            await api.post(`/orders/${orderId}/receive`);
            alert('Order marked as received!');
            // Refresh
        } catch (error) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div>Loading order...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
                <Link to="/buyer/orders" className="text-blue-600 hover:text-blue-800">← Back to Orders</Link>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id?.slice(0, 8)}</h1>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Order Information</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {order.status}
                        </span>
                    </div>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">KSh {order.total_amount?.toLocaleString()}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Items</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                    {order.items?.map((item: any) => (
                                        <li key={item.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                            <div className="w-0 flex-1 flex items-center">
                                                <span className="ml-2 flex-1 w-0 truncate">
                                                    {item.quantity}x {item.product_name}
                                                </span>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                KSh {item.price}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </dd>
                        </div>
                    </dl>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    {order.status === 'shipped' && (
                        <button
                            onClick={markReceived}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Mark as Received
                        </button>
                    )}
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <Link
                            to={`/buyer/disputes/new?orderId=${order.id}`}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Open Dispute
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
