import { useEffect, useState } from 'react';
import { api, getImageUrl } from '../services/api';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface Shop {
    id: string;
    name: string;
    description: string;
    slug: string;
    logo_url?: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
}

interface Category {
    category: string;
    count: number;
}

export function HomePage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Shops
                const shopsResponse = await api.get('/search/shops?q=&limit=6');
                setShops(shopsResponse.data.shops || []);

                // Fetch Products
                const productsResponse = await api.get('/search/products?limit=8');
                setProducts(productsResponse.data.products || []);

                // Fetch Categories
                const categoriesResponse = await api.get('/search/categories');
                const fetchedCategories = categoriesResponse.data.categories || [];

                // Fallback for demo if empty
                if (fetchedCategories.length === 0) {
                    setCategories([
                        { category: 'Electronics', count: 0 },
                        { category: 'Fashion', count: 0 },
                        { category: 'Home & Garden', count: 0 },
                        { category: 'Beauty', count: 0 },
                        { category: 'Sports', count: 0 },
                        { category: 'Toys', count: 0 }
                    ]);
                } else {
                    setCategories(fetchedCategories);
                }
            } catch (error) {
                console.error('Failed to fetch home data', error);
                // Set default categories on error too
                setCategories([
                    { category: 'Electronics', count: 0 },
                    { category: 'Fashion', count: 0 },
                    { category: 'Home & Garden', count: 0 },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-16">
            <Helmet>
                <title>ReupSpot | Discover Unique Shops & Independent Sellers</title>
                <meta name="description" content="Shop unique products from independent sellers. Join ReupSpot today to discover curated collections or start your own shop." />
            </Helmet>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 text-white py-24 px-4 sm:px-6 lg:px-8 mb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-900/20"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in tracking-tight drop-shadow-sm">
                        Discover Unique Shops
                    </h1>
                    <p className="text-xl md:text-2xl text-brand-50/90 max-w-2xl mx-auto animate-slide-up font-light leading-relaxed mb-10">
                        Explore curated collections from our top independent sellers.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Link to="/search" className="w-full sm:w-auto px-8 py-3 bg-white text-brand-600 font-bold rounded-full hover:bg-brand-50 transition-colors shadow-lg">
                            Shop Now
                        </Link>
                        <Link to="/register" className="w-full sm:w-auto px-8 py-3 bg-brand-700/30 backdrop-blur-sm text-white border border-white/30 font-bold rounded-full hover:bg-brand-700/50 transition-all">
                            Start Selling
                        </Link>
                    </div>
                </div>
            </div>



            {/* Trending Products Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-surface-900">Trending Products</h2>
                        <p className="text-surface-500 mt-2">Fresh finds from our community</p>
                    </div>
                    <Link to="/search" className="hidden sm:inline-flex items-center text-brand-600 font-semibold hover:text-brand-700">
                        View All <ArrowRight size={16} className="ml-2" />
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-surface-200">
                        <ShoppingBag size={48} className="mx-auto text-surface-300 mb-4" />
                        <p className="text-surface-500">No products found regarding trending.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                to={`/product/${product.id}`}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-surface-100"
                            >
                                <div className="h-64 bg-surface-100 w-full object-cover relative overflow-hidden">
                                    {product.images && product.images.length > 0 ? (
                                        <img src={getImageUrl(product.images[0])} alt={product.name} className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-surface-400">
                                            <ShoppingBag size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h4 className="text-lg font-bold text-surface-900 mb-2 truncate group-hover:text-brand-600 transition-colors">{product.name}</h4>
                                    <div className="flex items-center justify-between">
                                        <p className="text-brand-600 font-bold text-lg">KSh {product.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Shop Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-surface-900">Trending Shops</h2>
                        <p className="text-surface-500 mt-2">Check out the most popular sellers this week</p>
                    </div>
                    <Link to="/search" className="hidden sm:inline-flex items-center text-brand-600 font-semibold hover:text-brand-700">
                        View All <Store size={16} className="ml-2" />
                    </Link>
                </div>

                {shops.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-surface-200">
                        <div className="text-surface-400 mb-4">
                            <Store size={48} className="mx-auto opacity-50" />
                        </div>
                        <h3 className="text-xl font-medium text-surface-900">No shops found yet</h3>
                        <p className="text-surface-500 mt-2">Check back soon for new arrivals!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {shops.map((shop) => (
                            <Link
                                key={shop.id}
                                to={`/shop/${shop.slug}`}
                                className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-white/50 p-6 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ring-1 ring-surface-900/5"
                            >
                                <div className="flex items-center mb-6">
                                    <div className="h-16 w-16 bg-gradient-to-br from-brand-100 to-brand-50 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-2xl shadow-inner group-hover:scale-105 transition-transform duration-300 ring-1 ring-brand-200">
                                        {shop.logo_url ? (
                                            <img src={shop.logo_url} alt={shop.name} className="h-full w-full object-cover rounded-2xl" />
                                        ) : (
                                            shop.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-surface-900 group-hover:text-brand-600 transition-colors truncate">{shop.name}</h3>
                                        <div className="flex items-center text-xs text-brand-600 font-medium mt-1 bg-brand-50 px-2 py-0.5 rounded-full w-fit border border-brand-100">
                                            Verified Seller
                                        </div>
                                    </div>
                                </div>
                                <p className="text-surface-600 line-clamp-2 mb-6 text-sm leading-relaxed flex-grow">{shop.description}</p>
                                <div className="flex items-center text-brand-600 font-semibold text-sm group-hover:translate-x-1 transition-transform mt-auto">
                                    Visit Shop <span className="ml-1">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Categories Section */}
                {categories.length > 0 && (
                    <div className="max-w-7xl mx-auto px-0 mb-20">
                        <h2 className="text-2xl font-bold text-surface-900 mb-6 flex items-center">
                            Shop by Category
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {categories.map((cat, idx) => (
                                <Link
                                    key={idx}
                                    to={`/search?category=${encodeURIComponent(cat.category)}`}
                                    className="px-6 py-3 bg-white rounded-xl shadow-sm border border-surface-200 hover:border-brand-500 hover:text-brand-600 transition-all font-medium text-surface-700 flex items-center"
                                >
                                    {cat.category}
                                    <span className="ml-2 bg-surface-100 text-surface-500 text-xs px-2 py-0.5 rounded-full">
                                        {cat.count}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Seller CTA Section */}
                <div className="bg-surface-900 rounded-3xl overflow-hidden relative isolate">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-900 to-surface-900 z-0"></div>
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500 rounded-full blur-3xl opacity-20"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-500 rounded-full blur-3xl opacity-20"></div>

                    <div className="relative z-10 px-8 py-16 md:py-20 md:px-16 flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-8 md:mb-0 md:mr-12 max-w-xl">
                            <h2 className="text-3xl md:text-4xl font-bold text-white/50 mb-4">Ready to start your journey?</h2>
                            <p className="text-brand-50 text-lg leading-relaxed">
                                Join thousands of independent sellers on ReupSpot. Build your brand, reach new customers, and grow your business today.
                            </p>
                        </div>
                        <Link to="/register" className="whitespace-nowrap px-8 py-4 bg-white text-surface-900 font-bold rounded-xl hover:bg-brand-50 hover:scale-105 transition-all shadow-xl">
                            Become a Seller
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
