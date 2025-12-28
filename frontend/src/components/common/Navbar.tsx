import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Search, Home, Store, LogIn, UserPlus } from 'lucide-react';
import { NotificationBadge } from '../notifications/NotificationBadge';

export function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Desktop Nav */}
                    <div className="flex items-center">
                        <Link to="/" onClick={closeMenu} className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-accent-600 flex items-center hover:opacity-80 transition-opacity">
                            ReupSpot
                        </Link>
                        <div className="hidden md:flex ml-10 space-x-8">
                            <Link
                                to="/shops"
                                className={`flex items-center space-x-1 ${isActive('/shops') ? 'text-brand-600' : 'text-gray-700 hover:text-brand-600'}`}
                            >
                                <Store size={18} />
                                <span>Shops</span>
                            </Link>
                            <Link
                                to="/search"
                                className={`flex items-center space-x-1 ${isActive('/search') ? 'text-brand-600' : 'text-gray-700 hover:text-brand-600'}`}
                            >
                                <Search size={18} />
                                <span>Search</span>
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Right Side */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <NotificationBadge />
                                <span className="text-gray-700 text-sm">Hi, {user?.email}</span>
                                {user?.role === 'buyer' && (
                                    <Link to="/buyer/dashboard" className="text-gray-700 hover:text-brand-600 font-medium">Dashboard</Link>
                                )}
                                {user?.role === 'seller' && (
                                    <Link to="/seller/dashboard" className="text-gray-700 hover:text-brand-600 font-medium">Dashboard</Link>
                                )}
                                <button
                                    onClick={() => { logout(); }}
                                    className="text-gray-500 hover:text-gray-900 font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-brand-600 font-medium">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-700 hover:text-brand-600 focus:outline-none"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg border-t border-gray-100 py-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 space-y-1">
                        <Link
                            to="/shops"
                            onClick={closeMenu}
                            className={`flex items-center space-x-3 px-3 py-3 rounded-md ${isActive('/shops') ? 'bg-brand-50 text-brand-600' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Store size={20} />
                            <span>Shops</span>
                        </Link>
                        <Link
                            to="/search"
                            onClick={closeMenu}
                            className={`flex items-center space-x-3 px-3 py-3 rounded-md ${isActive('/search') ? 'bg-brand-50 text-brand-600' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Search size={20} />
                            <span>Search Products</span>
                        </Link>

                        <div className="border-t border-gray-100 my-2 pt-2">
                            {isAuthenticated ? (
                                <>
                                    <div className="px-3 py-2 text-sm text-gray-500 mb-2">Signed in as {user?.email}</div>
                                    <Link
                                        to={user?.role === 'seller' ? "/seller/dashboard" : "/buyer/dashboard"}
                                        onClick={closeMenu}
                                        className="flex items-center space-x-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        <Home size={20} />
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={() => { logout(); closeMenu(); }}
                                        className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-red-600 hover:bg-red-50 text-left"
                                    >
                                        <LogOutIcon />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={closeMenu}
                                        className="flex items-center space-x-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        <LogIn size={20} />
                                        <span>Login</span>
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeMenu}
                                        className="flex items-center space-x-3 px-3 py-3 rounded-md text-brand-600 hover:bg-brand-50"
                                    >
                                        <UserPlus size={20} />
                                        <span>Register</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

function LogOutIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
    )
}
