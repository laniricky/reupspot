import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';

interface Shop {
    id: string;
    name: string;
    trustScore: number;
}

interface Stats {
    total_orders: string;
    completed_orders: string;
    total_revenue: string;
    product_count: string;
    avg_rating: string;
    trustScore: number;
}

export function SellerDashboard() {
    const { shop } = useOutletContext<{ shop: Shop }>();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!shop?.id) return;
            try {
                const response = await api.get(`/shops/${shop.id}/stats`);
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [shop?.id]);

    if (loading) return <div>Loading stats...</div>;

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Overview for {shop?.name}
                </p>
            </div>

            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        KSh {Number(stats?.total_revenue || 0).toLocaleString()}
                    </dd>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Orders</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {stats?.total_orders || 0}
                    </dd>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Trust Score</dt>
                    <dd className={`mt-1 text-3xl font-semibold ${(stats?.trustScore || 0) >= 80 ? 'text-green-600' :
                        (stats?.trustScore || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {stats?.trustScore || 0}
                    </dd>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Products</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {stats?.product_count || 0}
                    </dd>
                </div>
            </dl>

            <div className="mt-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                <div className="mt-4 bg-white shadow rounded-lg p-6 text-center text-gray-500">
                    No recent activity to display.
                </div>
            </div>
        </div>
    );
}
