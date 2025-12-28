import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api, getImageUrl } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface Product {
    id: string;
    title: string;
    price: number;
    stock_quantity: number;
    status: string;
    images: string[];
}

export function ProductListPage() {
    const { shop } = useOutletContext<{ shop: { id: string } }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const response = await api.get(`/search/products?shopId=${shop.id}`);
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Failed to fetch products', error);
            // Don't show demo products on error, show empty state or error message
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shop?.id) fetchProducts();
    }, [shop?.id]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    if (loading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                <Link
                    to="/seller/products/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add Product
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {products.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No products found. Start by adding your first product!
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {products.map((product) => (
                            <li key={product.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                        {product.images && product.images[0] ? (
                                            <img
                                                src={getImageUrl(product.images[0])}
                                                alt={product.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                                No Img
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-blue-600 truncate">{product.title}</div>
                                        <div className="text-sm text-gray-500">
                                            KSh {product.price.toLocaleString()} | Stock: {product.stock_quantity}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <Link to={`/seller/products/${product.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
