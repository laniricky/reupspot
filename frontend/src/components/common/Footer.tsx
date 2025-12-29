import { Link } from 'react-router-dom';
import { Mail, Facebook, Twitter, Instagram, Github } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-surface-50 border-t border-surface-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-accent-600">
                            ReupSpot
                        </Link>
                        <p className="mt-4 text-surface-500 text-sm leading-relaxed">
                            The premier marketplace for unique finds and independent sellers. Discover quality products from trusted merchants.
                        </p>
                        <div className="flex space-x-4 mt-6">
                            <a href="#" className="text-surface-400 hover:text-brand-600 transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-surface-400 hover:text-brand-600 transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-surface-400 hover:text-brand-600 transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-surface-400 hover:text-brand-600 transition-colors"><Github size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4">Marketplace</h3>
                        <ul className="space-y-3">
                            <li><Link to="/shops" className="text-surface-500 hover:text-brand-600 text-sm transition-colors">All Shops</Link></li>
                            <li><Link to="/search" className="text-surface-500 hover:text-brand-600 text-sm transition-colors">Search Products</Link></li>
                            <li><Link to="/register" className="text-surface-500 hover:text-brand-600 text-sm transition-colors">Become a Seller</Link></li>
                            <li><Link to="/login" className="text-surface-500 hover:text-brand-600 text-sm transition-colors">Login</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4">Support</h3>
                        <ul className="space-y-3">
                            <li><Link to="/help" className="text-surface-500 hover:text-brand-600 text-sm transition-colors">Help Center</Link></li>
                            <li><Link to="/terms" className="text-surface-500 hover:text-brand-600 text-sm transition-colors">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="text-surface-500 hover:text-brand-600 text-sm transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/contact" className="text-surface-500 hover:text-brand-600 text-sm transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4">Stay Loop</h3>
                        <p className="text-surface-500 text-sm mb-4">Subscribe to our newsletter for the latest drops and offers.</p>
                        <form className="flex flex-col space-y-2">
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-surface-400" />
                                </div>
                                <input
                                    type="email"
                                    className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-surface-300 rounded-md py-2"
                                    placeholder="Enter your email"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 border-t border-surface-200 pt-8 text-center sm:text-left">
                    <p className="text-sm text-surface-400">
                        &copy; {new Date().getFullYear()} ReupSpot. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
