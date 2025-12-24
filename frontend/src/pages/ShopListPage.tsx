import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

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

    if (loading) return <div className="p-8 text-center">Loading shops...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse Shops</h2>

            {shops.length === 0 ? (
                <div className="text-gray-500">No shops found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.map((shop) => (
                        <Link
                            key={shop.id}
                            to={`/shop/${shop.slug}`}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {shop.name.charAt(0)}
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-xl font-semibold text-gray-900">{shop.name}</h3>
                                </div>
                            </div>
                            <p className="text-gray-600 line-clamp-2">{shop.description}</p>
                            <div className="mt-4 text-blue-600 font-medium text-sm">
                                Visit Shop →
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
