import { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';

interface OrderItem {
    id: string;
    product_title: string;
    quantity: number;
    price: string;
}

interface Order {
    id: string;
    status: string;
    total_amount: string;
    created_at: string;
    items: OrderItem[];
    shipping_info?: any;
    buyer_email?: string;
    buyer_phone?: string;
}

export function SellerOrderDetailsPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const { shop } = useOutletContext<{ shop: { id: string } }>();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${orderId}`);
                setOrder(response.data);
            } catch (error) {
                console.error('Failed to fetch order', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const updateStatus = async (newStatus: string) => {
        if (!confirm(`Mark order as ${newStatus}?`)) return;
        setUpdating(true);
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus, shopId: shop.id });
            // Refresh
            const response = await api.get(`/orders/${orderId}`);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div>Loading order details...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
                    <p className="text-sm text-gray-500">
                        Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize 
                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                </span>
            </div>

            {/* Actions */}
            <div className="bg-white shadow sm:rounded-lg mb-6 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Order</h3>
                <div className="flex space-x-4">
                    {order.status === 'paid' && (
                        <button
                            onClick={() => updateStatus('shipped')}
                            disabled={updating}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            Mark as Shipped
                        </button>
                    )}
                    {order.status === 'pending' && (
                        <button
                            onClick={() => updateStatus('paid')}
                            disabled={updating}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                        >
                            Mark as Paid (Manual)
                        </button>
                    )}
                </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white shadow sm:rounded-lg mb-6 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Details</h3>
                </div>
                <div className="px-4 py-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Contact</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                            {order.buyer_email}<br />
                            {order.buyer_phone}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                            {order.shipping_info ? JSON.stringify(order.shipping_info) : 'No shipping info provided'}
                        </dd>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <ul className="divide-y divide-gray-200">
                        {order.items?.map((item, idx) => (
                            <li key={idx} className="py-4 flex justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{item.product_title}</p>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    KSh {(Number(item.price) * item.quantity).toLocaleString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-gray-200 pt-4 flex justify-end">
                        <div className="text-lg font-bold text-gray-900">
                            Total: KSh {Number(order.total_amount).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
