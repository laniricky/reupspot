import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    price_at_add: number; // This comes from DB as string decimal usually, need to parse
    product: {
        name: string;
        images: string[];
        price: number;
    };
}

interface Cart {
    id: string;
    shop_id: string;
    items: CartItem[];
}

export function ShopCartPage() {
    const { shopId } = useParams<{ shopId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);

    // Guest info
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        const fetchCart = async () => {
            try {
                // Determine user ID or session ID from cookies (handled by backend usually)
                // We just call GET /api/cart/:shopId
                const response = await api.get(`/cart/${shopId}`);
                setCart(response.data.cart);
            } catch (error) {
                console.error('Failed to fetch cart', error);
            } finally {
                setLoading(false);
            }
        };

        if (shopId) fetchCart();
    }, [shopId]);

    const calculateTotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((total, item) => {
            const price = parseFloat(item.price_at_add as any) || item.product.price;
            return total + (price * item.quantity);
        }, 0);
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setCheckingOut(true);

        try {
            const payload = isAuthenticated ? {
                shippingAddress: address
            } : {
                email,
                phone,
                address: address // Using 'address' in current component state mapping to 'address' in payload
            };

            await api.post(`/cart/${shopId}/checkout`, payload);

            alert('Order placed successfully! (Mock Payment)');
            navigate(`/shop/${shopId}`); // Redirect back to shop or order success
        } catch (error: any) {
            console.error('Checkout failed', error);
            alert(error.response?.data?.message || 'Checkout failed');
        } finally {
            setCheckingOut(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading cart...</div>;

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                <Link to={`/shop/${shopId || ''}`} className="text-blue-600 hover:underline">
                    Return to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Cart Items */}
                <div className="space-y-6">
                    {cart.items.map((item) => (
                        <div key={item.id} className="flex gap-4 border-b pb-4">
                            <div className="h-24 w-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                {item.product.images && item.product.images[0] ? (
                                    <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                                <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                <p className="text-blue-600 font-bold mt-1">
                                    {(parseFloat(item.price_at_add as any) * item.quantity).toLocaleString()} KSh
                                </p>
                            </div>
                        </div>
                    ))}

                    <div className="border-t pt-4">
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                            <span>Total</span>
                            <span>{calculateTotal().toLocaleString()} KSh</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
                    <h2 className="text-xl font-bold mb-6">Details</h2>
                    <form onSubmit={handleCheckout} className="space-y-4">
                        {!isAuthenticated && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full border rounded px-3 py-2"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full border rounded px-3 py-2"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="+254..."
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                            <textarea
                                required
                                className="w-full border rounded px-3 py-2"
                                rows={3}
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={checkingOut}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
                            >
                                {checkingOut ? 'Processing...' : 'Place Order (Pay on Delivery)'}
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                By placing an order, you agree to our terms.
                                <br />
                                Funds are held in escrow until you verify receipt.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
