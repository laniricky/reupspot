import { useEffect, useState } from 'react';
import { api, getImageUrl } from '../services/api';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface Shop {
    id: string;
    name: string;
    description: string;
    slug: string;
    logo_url?: string;
    banner_url?: string;
}

export function ShopListPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                // Fetch all shops
                const response = await api.get('/search/shops?q=&limit=20');
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
        <div className="min-h-screen pt-16">
            <Helmet>
                <title>All Shops | ReupSpot</title>
                <meta name="description" content="Browse all independent shops and sellers on ReupSpot." />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-surface-900">All Shops</h1>
                    <p className="text-surface-500 mt-2">Discover our community of independent sellers.</p>
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
                                className="group relative rounded-2xl shadow-sm hover:shadow-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 h-64 ring-1 ring-surface-900/5"
                            >
                                {/* Banner Background with Blur */}
                                <div className="absolute inset-0">
                                    {shop.banner_url ? (
                                        <>
                                            <img
                                                src={getImageUrl(shop.banner_url)}
                                                alt={`${shop.name} banner`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 backdrop-blur-md bg-white/30"></div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-brand-100 via-accent-50 to-brand-50">
                                            <div className="absolute inset-0 backdrop-blur-sm bg-white/40"></div>
                                        </div>
                                    )}
                                    {/* Gradient overlay for text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                </div>

                                {/* Content */}
                                <div className="relative h-full flex flex-col justify-between p-6">
                                    {/* Top section with profile picture */}
                                    <div className="flex items-start justify-between">
                                        <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white/90 bg-white group-hover:scale-105 transition-transform duration-300">
                                            {shop.logo_url ? (
                                                <img
                                                    src={getImageUrl(shop.logo_url)}
                                                    alt={shop.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-3xl">
                                                    {shop.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center text-xs text-white font-semibold px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm shadow-lg border border-white/30">
                                            ✓ Verified
                                        </div>
                                    </div>

                                    {/* Bottom section with shop info */}
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-brand-100 transition-colors drop-shadow-lg">
                                            {shop.name}
                                        </h3>
                                        <p className="text-white/95 text-sm leading-relaxed line-clamp-2 mb-3 drop-shadow-md">
                                            {shop.description}
                                        </p>
                                        <div className="flex items-center text-white font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                            Visit Shop <span className="ml-1">→</span>
                                        </div>
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
