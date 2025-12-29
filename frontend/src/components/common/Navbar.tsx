import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Search, Home, Store, LogOut } from 'lucide-react';
import { NotificationBadge } from '../notifications/NotificationBadge';
import { Button } from './Button';

export function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed w-full z-50 transition-all duration-300 bg-white/70 backdrop-blur-lg border-b border-surface-200/50 supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Desktop Nav */}
                    <div className="flex items-center">
                        <Link to="/" onClick={closeMenu} className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-accent-600 flex items-center hover:opacity-80 transition-opacity tracking-tight">
                            ReupSpot
                        </Link>
                        <div className="hidden md:flex ml-10 space-x-8">
                            <Link
                                to="/shops"
                                className={`flex items-center space-x-1 font-medium transition-colors duration-200 ${isActive('/shops') ? 'text-brand-600' : 'text-surface-600 hover:text-brand-600'}`}
                            >
                                <Store size={18} />
                                <span>Shops</span>
                            </Link>
                            <Link
                                to="/search"
                                className={`flex items-center space-x-1 font-medium transition-colors duration-200 ${isActive('/search') ? 'text-brand-600' : 'text-surface-600 hover:text-brand-600'}`}
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
                                <span className="text-surface-600 text-sm font-medium">Hi, {user?.email}</span>
                                {user?.role === 'buyer' && (
                                    <Button variant="ghost" size="sm" onClick={() => navigate('/buyer/dashboard')}>
                                        Dashboard
                                    </Button>
                                )}
                                {user?.role === 'seller' && (
                                    <Button variant="ghost" size="sm" onClick={() => navigate('/seller/dashboard')}>
                                        Dashboard
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => logout()}
                                    className="text-surface-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={() => navigate('/login')}>
                                    Login
                                </Button>
                                <Button variant="primary" onClick={() => navigate('/register')}>
                                    Register
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-surface-600 hover:text-brand-600 focus:outline-none p-2 rounded-lg hover:bg-surface-100 transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-surface-100 shadow-xl animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 space-y-2">
                        <Link
                            to="/shops"
                            onClick={closeMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive('/shops') ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-surface-600 hover:bg-surface-50'}`}
                        >
                            <Store size={20} />
                            <span>Shops</span>
                        </Link>
                        <Link
                            to="/search"
                            onClick={closeMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive('/search') ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-surface-600 hover:bg-surface-50'}`}
                        >
                            <Search size={20} />
                            <span>Search Products</span>
                        </Link>

                        <div className="border-t border-surface-100 my-2 pt-2">
                            {isAuthenticated ? (
                                <>
                                    <div className="px-4 py-2 text-sm text-surface-400 mb-2 font-medium">Signed in as {user?.email}</div>
                                    <Link
                                        to={user?.role === 'seller' ? "/seller/dashboard" : "/buyer/dashboard"}
                                        onClick={closeMenu}
                                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-surface-600 hover:bg-surface-50"
                                    >
                                        <Home size={20} />
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={() => { logout(); closeMenu(); }}
                                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 text-left transition-colors"
                                    >
                                        <LogOut size={20} />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <Button variant="ghost" onClick={() => { navigate('/login'); closeMenu(); }} className="w-full justify-center">
                                        Login
                                    </Button>
                                    <Button variant="primary" onClick={() => { navigate('/register'); closeMenu(); }} className="w-full justify-center">
                                        Register
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
