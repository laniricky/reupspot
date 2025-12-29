import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

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
            </div>
        </div>
    );
}
