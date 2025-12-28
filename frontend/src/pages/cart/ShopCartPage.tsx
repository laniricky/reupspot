import { useParams } from 'react-router-dom';

export function ShopCartPage() {
    const { shopId } = useParams();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
            <p>Cart for shop: {shopId}</p>
            <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500">Your cart is empty.</p>
            </div>
        </div>
    );
}
