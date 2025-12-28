import { useEffect, useState } from 'react';
import { api, getImageUrl } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { Store as StoreIcon } from 'lucide-react';

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
        console.log('ShopPage mounted, slug:', slug);
        const fetchShopData = async () => {
            try {
                console.log(`Fetching shop data for slug: ${slug}`);
                // Fetch shop details
                const shopRes = await api.get(`/shops/${slug}`);
                console.log('Shop API response:', shopRes);
                console.log('Shop data from response:', shopRes.data);

                setShop(shopRes.data);

                // Fetch shop products
                if (shopRes.data?.id) {
                    const productsRes = await api.get(`/search/products?shopId=${shopRes.data.id}`);
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



    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
    );

    if (!shop) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="text-surface-400 mb-4">
                <StoreIcon size={48} className="mx-auto opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 mb-2">Shop Not Found</h2>
            <p className="text-surface-500 mb-6">The shop you're looking for doesn't exist or has been removed.</p>
            <Link to="/shops" className="text-brand-600 font-medium hover:text-brand-700 hover:underline">
                Browse all shops
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen pb-20">
            {/* Banner Section */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                {shop.bannerUrl ? (
                    <img src={getImageUrl(shop.bannerUrl)} alt={`${shop.name} Banner`} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
                {/* Shop Header Card */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-10 mb-12 border border-white/50">
                    <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                        {shop.logoUrl ? (
                            <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden border-4 border-white shadow-lg mb-4 md:mb-0 md:mr-8">
                                <img src={getImageUrl(shop.logoUrl)} alt={`${shop.name} Logo`} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-32 h-32 flex-shrink-0 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 border-4 border-white shadow-lg mb-4 md:mb-0 md:mr-8 flex items-center justify-center text-brand-600 text-5xl font-bold">
                                {shop.name.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold text-surface-900 mb-4">{shop.name}</h1>
                            <p className="text-lg text-surface-600 leading-relaxed max-w-3xl">{shop.description}</p>

                            <div className="flex items-center justify-center md:justify-start mt-6 space-x-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Verified Merchant
                                </span>
                                <span className="text-surface-400 text-sm">Member since {new Date().getFullYear()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-surface-900">Featured Products</h3>
                    <div className="h-px bg-surface-200 flex-1 ml-6"></div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-surface-200 border-dashed">
                        <p className="text-surface-500 text-lg">No products available in this shop yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                to={`/product/${product.id}`}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-surface-100"
                            >
                                <div className="h-64 bg-surface-100 w-full object-cover relative overflow-hidden group-hover:opacity-90 transition-opacity">
                                    {product.images && product.images[0] ? (
                                        <img src={getImageUrl(product.images[0])} alt={product.name} className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-surface-400">
                                            <span>No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-surface-900 shadow-sm">
                                        New
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h4 className="text-lg font-bold text-surface-900 mb-2 truncate group-hover:text-brand-600 transition-colors">{product.name}</h4>
                                    <div className="flex items-center justify-between">
                                        <p className="text-brand-600 font-bold text-lg">KSh {product.price.toLocaleString()}</p>
                                        <span className="text-xs text-surface-400 font-medium bg-surface-50 px-2 py-1 rounded-md group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">View Details</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
