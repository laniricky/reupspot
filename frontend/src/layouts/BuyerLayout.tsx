import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function BuyerLayout() {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Dashboard', href: '/buyer/dashboard' },
        { name: 'My Orders', href: '/buyer/orders' },
        { name: 'Disputes', href: '/buyer/disputes' },
        { name: 'Following', href: '/buyer/following' },
        { name: 'Settings', href: '/buyer/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navigation */}
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="text-2xl font-bold text-blue-600">ReupSpot</Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-700 mr-4">{user?.email}</span>
                            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Sidebar */}
                        <aside className="w-full md:w-64 flex-shrink-0">
                            <nav className="space-y-1">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`${isActive
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-900 hover:bg-gray-50'
                                                } group flex items-center px-4 py-2 text-sm font-medium rounded-md`}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1">
                            <Outlet />
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
