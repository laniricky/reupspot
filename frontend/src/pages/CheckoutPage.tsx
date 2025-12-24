import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    price_at_add: number;
    product_name: string;
    product_image?: string;
}

interface Cart {
    id: string;
    shop_id: string;
    items: CartItem[];
}

export function CheckoutPage() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Guest form state
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [address, setAddress] = useState('');

    // Assuming we're checking out from a specific shop, or maybe all?
    // The current backend supports one cart per shop.
    // For simplicity, let's assume we pass shopId in query or just fetch the first available cart/cart for a specific shop
    // This part is tricky without a "Global Cart" view.
    // Let's implement checkout for a single shop flow for now, passed via query param or just context.
    // Actually, let's fetch 'my carts' endpoint if it existed.
    // Since we don't have 'get all carts', we might need to rely on localStorage to know which shop we added to?
    // Or just checkout the 'current' shop context.

    // Workaround: We'll assume the user is checking out from the last visited shop or similar.
    // Better: We should list carts if multiple exist.
    // For MVP: Let's assume we checkout a specific shop cart. URL: /checkout/:shopId

    // Re-reading plan: "CheckoutPage: Cart summary, Guest checkout form..."
    // Let's make this page accept shopId as prop or param, or we move it to /shop/:shopId/checkout URL.

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Checkout</h2>
            <p className="text-gray-600">
                To checkout, please go to a specific shop and click "Checkout" in the cart view.
                <br />
                (Global unified cart functionality pending Phase 4 enhancements)
            </p>
            <div className="mt-8">
                <a href="/shops" className="text-blue-600 hover:underline">
                    Browse Shops to Order
                </a>
            </div>
        </div>
    );
}

// NOTE: Since the backend is "per-shop cart", a global checkout page is complex.
// Instead, adding a "Cart Drawer" or "Cart Page" per shop is better.
// I will create a `ShopCartPage` instead.
