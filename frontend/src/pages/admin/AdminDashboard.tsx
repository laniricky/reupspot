import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Users, ShoppingBag, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface DashboardStats {
    totalUsers: number;
    totalShops: number;
    activeShops: number;
    totalRevenue: number;
}

export function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) return <LoadingSpinner size="lg" />;
    if (!stats) return <div className="text-red-500">Failed to load payload.</div>;

    const cards = [
        { label: 'Total Users', value: stats.totalUsers, icon: <Users size={24} />, color: 'bg-blue-500' },
        { label: 'Total Shops', value: stats.totalShops, icon: <ShoppingBag size={24} />, color: 'bg-purple-500' },
        { label: 'Active Shops', value: stats.activeShops, icon: <Activity size={24} />, color: 'bg-green-500' },
        { label: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: <DollarSign size={24} />, color: 'bg-yellow-500' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${card.color} text-white bg-opacity-90`}>
                                {card.icon}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600">
                            <TrendingUp size={16} className="mr-1" />
                            <span className="font-medium">12%</span>
                            <span className="text-gray-400 ml-1">vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-96">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Chart placeholder
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-96">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">System Health</h2>
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Metrics placeholder
                    </div>
                </div>
            </div>
        </div>
    );
}
