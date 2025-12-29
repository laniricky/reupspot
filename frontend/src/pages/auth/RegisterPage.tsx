import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { api } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Mail, Phone, Lock, User } from 'lucide-react';

export function RegisterPage() {
    useEffect(() => {
        console.log("RegisterPage MOUNTED");
    }, []);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'buyer' // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // Register endpoint expects: { email, password, role, phone, captchaToken? }
            // Todo: Add CAPTCHA token integration here
            await api.post('/auth/register', {
                email: formData.email,
                password: formData.password,
                role: formData.role,
                phone: formData.phone
            });

            // On success, redirect to login
            // alert('Registration successful! Please login.'); // Removed alert for better UX
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err: any) {
            console.error('Registration failed', err);
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-400/20 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-400/20 blur-[100px]"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <h2 className="mt-6 text-center text-4xl font-extrabold text-surface-900 tracking-tight">
                    Create new account
                </h2>
                <p className="mt-2 text-center text-sm text-surface-600">
                    Or{' '}
                    <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500 hover:underline transition-all">
                        sign in to existing account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/70 backdrop-blur-xl py-8 px-4 shadow-xl border border-white/50 sm:rounded-2xl sm:px-10 ring-1 ring-surface-900/5">
                    {error && (
                        <div className="mb-6 bg-red-50/50 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3 rounded-xl relative text-sm font-medium" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-surface-700">I want to</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                                    <User size={18} />
                                </div>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-surface-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm shadow-sm"
                                >
                                    <option value="buyer">Buy Products</option>
                                    <option value="seller">Sell Products</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-surface-700">
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-surface-200 rounded-xl shadow-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white/50"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-surface-700">
                                Phone Number
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                                    <Phone size={18} />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    placeholder="2547..."
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-surface-200 rounded-xl shadow-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-surface-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-surface-200 rounded-xl shadow-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white/50"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700">
                                Confirm Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-surface-200 rounded-xl shadow-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white/50"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full justify-center py-2.5"
                                isLoading={loading}
                            >
                                {loading ? 'Creating Account...' : 'Register'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
