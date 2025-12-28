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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Mobile Header with Toggle */}
            <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
                <span className="font-bold text-xl">Seller Center</span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar (Drawer on mobile, fixed on desktop) */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:flex-shrink-0
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-4 bg-gray-800 flex items-center justify-between">
                        <span className="font-bold text-xl">Seller Center</span>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                            <span className="sr-only">Close sidebar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-4 border-b border-gray-700">
                        <p className="text-sm font-medium text-gray-300">Shop:</p>
                        <p className="font-bold truncate">{shop?.name}</p>
                    </div>
                    <nav className="mt-5 px-2 space-y-1 flex-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
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
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white shadow hidden md:block">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <h1 className="text-2xl font-bold leading-tight text-gray-900">
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
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                    <Outlet context={{ shop }} />
                </main>
            </div>
        </div>
    );
}
