import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    inventory_count: number;
    images: string[];
    shop_id: string;
    shop_name: string;
    shop_slug: string;
}

export function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.product);
            } catch (error) {
                console.error('Failed to fetch product', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!product) return;
        setAddingToCart(true);
        try {
            await api.post(`/cart/${product.shop_id}/items`, {
                productId: product.id,
                quantity
            });
            alert('Added to cart!');
            // You might want to update some global cart state here
        } catch (error) {
            console.error('Failed to add to cart', error);
            alert('Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading product...</div>;
    if (!product) return <div className="p-8 text-center text-red-600">Product not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Images */}
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center overflow-hidden">
                    {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-gray-400 text-lg">No Image Available</span>
                    )}
                </div>

                {/* Details */}
                <div>
                    <div className="mb-2 text-sm text-gray-500">
                        Sold by <a href={`/shop/${product.shop_slug}`} className="text-blue-600 hover:underline">{product.shop_name}</a>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                    <p className="text-3xl font-bold text-blue-600 mb-6">KSh {product.price.toLocaleString()}</p>

                    <div className="prose prose-blue mb-8">
                        <p>{product.description}</p>
                    </div>

                    <div className="border-t pt-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <label className="text-gray-700 font-medium">Quantity:</label>
                            <input
                                type="number"
                                min="1"
                                max={product.inventory_count}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="border rounded-md px-3 py-2 w-20"
                            />
                            <span className="text-sm text-gray-500">{product.inventory_count} available</span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={addingToCart || product.inventory_count === 0}
                            className={`w-full py-4 rounded-lg font-bold text-lg text-white transition-colors ${product.inventory_count === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {product.inventory_count === 0
                                ? 'Out of Stock'
                                : addingToCart
                                    ? 'Adding...'
                                    : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
