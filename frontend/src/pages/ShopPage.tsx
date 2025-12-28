import { useEffect, useState } from 'react';
import { api, getImageUrl } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
}

interface Shop {
    id: string;
    name: string;
    description: string;
    slug: string;
    logoUrl?: string;
    bannerUrl?: string;
}

export function ShopPage() {
    const { slug } = useParams<{ slug: string }>();
    const [shop, setShop] = useState<Shop | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ... (logging removed for cleaner code)
        const fetchShopData = async () => {
            try {
                // Fetch shop details
                const shopRes = await api.get(`/shops/${slug}`);
                setShop(shopRes.data.shop); // Ensure backend returns shop object structure correctly

                // Fetch shop products
                if (shopRes.data.shop?.id) {
                    const productsRes = await api.get(`/search/products?shopId=${shopRes.data.shop.id}`);
                    setProducts(productsRes.data.products || []);
                }
            } catch (error) {
                console.error('Failed to fetch shop details', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchShopData();
    }, [slug]);

    if (loading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" text="Loading shop..." /></div>;
    if (!shop) return <div className="p-8 text-center text-red-600">Shop not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {shop.bannerUrl && (
                <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6">
                    <img src={getImageUrl(shop.bannerUrl)} alt={`${shop.name} Banner`} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-8 mb-8 flex items-start space-x-6">
                {shop.logoUrl ? (
                    <div className="w-24 h-24 flex-shrink-0 rounded-full overflow-hidden border border-gray-100">
                        <img src={getImageUrl(shop.logoUrl)} alt={`${shop.name} Logo`} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-24 h-24 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                        {shop.name.charAt(0).toUpperCase()}
                    </div>
                )}

                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{shop.name}</h1>
                    <p className="text-gray-600 text-lg">{shop.description}</p>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-6">Products</h3>

            {products.length === 0 ? (
                <div className="text-gray-500">No products available in this shop.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
                        >
                            <div className="h-48 bg-gray-200 w-full object-cover flex items-center justify-center text-gray-400">
                                {product.images && product.images[0] ? (
                                    <img src={getImageUrl(product.images[0])} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span>No Image</span>
                                )}
                            </div>
                            <div className="p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h4>
                                <p className="text-blue-600 font-bold">KSh {product.price.toLocaleString()}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
