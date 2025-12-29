import { useEffect, useState } from 'react';
import { api, getImageUrl } from '../services/api';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/common/Button';

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
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const toast = useToast();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.product);
            } catch (error) {
                console.error('Failed to fetch product', error);
                toast.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id, toast]);

    const handleAddToCart = async () => {
        if (!product) return;
        setAddingToCart(true);
        try {
            await api.post(`/cart/${product.shop_id}/items`, {
                productId: product.id,
                quantity
            });
            toast.success('Added to cart!');
            // You might want to update some global cart state here
        } catch (error) {
            console.error('Failed to add to cart', error);
            toast.error('Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" text="Loading product..." /></div>;
    if (!product) return <div className="p-8 text-center text-red-600">Product not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Images */}
                <div className="bg-surface-50 rounded-2xl h-96 flex items-center justify-center overflow-hidden border border-surface-200 shadow-inner">
                    {product.images && product.images[0] ? (
                        <img src={getImageUrl(product.images[0])} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-surface-400 text-lg">No Image Available</span>
                    )}
                </div>

                {/* Details */}
                <div>
                    <div className="mb-2 text-sm text-surface-500 font-medium">
                        Sold by <a href={`/shop/${product.shop_slug}`} className="text-brand-600 hover:text-brand-700 hover:underline transition-colors">{product.shop_name}</a>
                    </div>
                    <h1 className="text-4xl font-bold text-surface-900 mb-4 tracking-tight">{product.name}</h1>
                    <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600 mb-6">KSh {product.price.toLocaleString()}</p>

                    <div className="prose prose-brand mb-8 text-surface-600 leading-relaxed">
                        <p>{product.description}</p>
                    </div>

                    <div className="border-t border-surface-200 pt-6">
                        <div className="flex items-center space-x-6 mb-8">
                            <label className="text-surface-700 font-semibold">Quantity:</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    min="1"
                                    max={product.inventory_count}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    className="border border-surface-200 rounded-xl px-4 py-2 w-24 text-center text-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                />
                                <span className="text-sm text-surface-500 font-medium">{product.inventory_count} available</span>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <Button
                                onClick={handleAddToCart}
                                disabled={addingToCart || product.inventory_count === 0}
                                isLoading={addingToCart}
                                size="lg"
                                className="w-full py-4 text-lg shadow-xl shadow-brand-500/20"
                            >
                                {product.inventory_count === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
