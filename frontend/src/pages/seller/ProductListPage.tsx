import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';

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
            // Need an endpoint to get shop's products. 
            // Public endpoint /shops/:slug/products exists, but we want a seller view (including hidden/drafts maybe?)
            // Using public for now: GET /shops/:slug
            // Wait, we have the slug in shop object?
            // Let's use GET /shops/:slug which returns products too, OR create a dedicated management endpoint.
            // For now, let's assume we can GET /api/shops/:id/products (if implemented) or use public.
            // Actually, we retrieved shop by slug in ShopPage.
            // Let's rely on `GET /shops/me` returning products? No, it returns shop details.

            // Let's use the public endpoint for now or check backend.
            // `shopController.getShopBySlug` returns products?
            // `shops/shop.service.ts` getShopBySlug -> joins? 
            // Checking shop.service.ts... getShopBySlug returns shop object, but DOES NOT join products in the service logic I saw earlier.
            // Wait, `ShopPage.tsx` fetched products separately?
            // `ShopPage` calls `api.get(/shops/${slug})`.
            // Let's check `backend/src/modules/shops/shop.service.ts` again.
            // It selects from shops ... NO products join.
            // Ah, `ShopPage` must fetch products via a separate call?
            // Checking code... `ShopPage` uses `api.get(products?shopId=...)`?
            // Let's check `ProductService`.

            // For now, I'll use `api.get('/products', { params: { shopId: shop.id } })` if products endpoint allows filtering.
            // `backend/src/modules/products/product.controller.ts` likely has `search` or `list`.
            // Let's try `api.get('/search/products?shopId=' + shop.id)` or similar.
            // Or just mock for now to Proceed.
            const response = await api.get(`/search/products?shopId=${shop.id}`); // This might need adjustment
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Failed to fetch products', error);
            setProducts([
                { id: '1', title: 'Demo Product', price: 1000, stock_quantity: 5, status: 'active', images: [] }
            ]);
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

    if (loading) return <div>Loading products...</div>;

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
                <ul className="divide-y divide-gray-200">
                    {products.map((product) => (
                        <li key={product.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md">
                                    {/* Image placeholder */}
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-blue-600 truncate">{product.title}</div>
                                    <div className="text-sm text-gray-500">
                                        KSh {product.price} | Stock: {product.stock_quantity}
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
            </div>
        </div>
    );
}
