import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

interface Shop {
    id: string;
    name: string;
    description: string;
    slug: string;
    logo_url?: string;
}

export function ShopListPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                // Using search endpoint to list shops for now
                const response = await api.get('/search/shops?q=');
                setShops(response.data.shops || []);
            } catch (error) {
                console.error('Failed to fetch shops', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShops();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-brand-600 to-accent-600 text-white py-20 px-4 sm:px-6 lg:px-8 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                        Discover Unique Shops
                    </h1>
                    <p className="text-xl md:text-2xl text-brand-100 max-w-2xl mx-auto animate-slide-up">
                        Explore curated collections from our top independent sellers.
                    </p>
                </div>
            </div>

            {/* Shop Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {shops.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-surface-200">
                        <div className="text-surface-400 mb-4">
                            <Store size={48} className="mx-auto opacity-50" />
                        </div>
                        <h3 className="text-xl font-medium text-surface-900">No shops found yet</h3>
                        <p className="text-surface-500 mt-2">Check back soon for new arrivals!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {shops.map((shop) => (
                            <Link
                                key={shop.id}
                                to={`/shop/${shop.slug}`}
                                className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-surface-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="flex items-center mb-6">
                                    <div className="h-16 w-16 bg-gradient-to-br from-brand-100 to-brand-50 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                                        {shop.logo_url ? (
                                            <img src={shop.logo_url} alt={shop.name} className="h-full w-full object-cover rounded-2xl" />
                                        ) : (
                                            shop.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-xl font-bold text-surface-900 group-hover:text-brand-600 transition-colors">{shop.name}</h3>
                                        <div className="flex items-center text-xs text-brand-600 font-medium mt-1 bg-brand-50 px-2 py-0.5 rounded-full w-fit">
                                            Verified Seller
                                        </div>
                                    </div>
                                </div>
                                <p className="text-surface-600 line-clamp-2 mb-6 h-10 text-sm leading-relaxed">{shop.description}</p>
                                <div className="flex items-center text-brand-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                    Visit Shop <span className="ml-1">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
