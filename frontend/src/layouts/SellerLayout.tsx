import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export function SellerLayout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [shop, setShop] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkShop = async () => {
            // If user is not seller, maybe redirect? For now assume RBAC middleware handles it or we handle it here
            if (user?.role !== 'seller') {
                // For now, allow buyers to be upgraded or show error
                // navigate('/buyer/dashboard');
            }

            try {
                const response = await api.get('/shops/me');
                if (response.data.shop) {
                    setShop(response.data.shop);
                } else {
                    // No shop found, redirect to creation
                    // check prevent infinite loop if already on create page
                    if (location.pathname !== '/seller/create-shop') {
                        navigate('/seller/create-shop');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch shop', error);
            } finally {
                setLoading(false);
            }
        };

        checkShop();
    }, [navigate, location.pathname, user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="p-8 text-center">Loading Seller Dashboard...</div>;

    // If on create shop page, render simple layout
    if (location.pathname === '/seller/create-shop') {
        return <Outlet />;
    }

    // Navigation items
    const navigation = [
        { name: 'Dashboard', href: '/seller/dashboard' },
        { name: 'Products', href: '/seller/products' },
        { name: 'Orders', href: '/seller/orders' },
        { name: 'Payouts', href: '/seller/payouts' },
        { name: 'Store Settings', href: '/seller/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex-shrink-0">
                <div className="p-4 bg-gray-800 flex items-center justify-between">
                    <span className="font-bold text-xl">Seller Center</span>
                </div>
                <div className="p-4 border-b border-gray-700">
                    <p className="text-sm font-medium text-gray-300">Shop:</p>
                    <p className="font-bold truncate">{shop?.name}</p>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`${isActive
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <h1 className="text-2xl font-bold leading-tight text-gray-900">
                            {/* Dynamic Header could go here */}
                            Dashboard
                        </h1>
                        <div className="flex items-center">
                            <span className="mr-4 text-sm text-gray-500">{user?.email}</span>
                            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-900">
                                Logout
                            </button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet context={{ shop }} />
                </main>
            </div>
        </div>
    );
}
