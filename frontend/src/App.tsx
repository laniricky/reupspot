import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ShopListPage } from './pages/ShopListPage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { SearchPage } from './pages/SearchPage';
import { ShopCartPage } from './pages/ShopCartPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { BuyerLayout } from './layouts/BuyerLayout';
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { OrderListPage } from './pages/buyer/OrderListPage';
import { OrderDetailsPage } from './pages/buyer/OrderDetailsPage';
import { DisputeListPage } from './pages/buyer/DisputeListPage';
import { CreateDisputePage } from './pages/buyer/CreateDisputePage';

// Protected Route wrapper (simplified)
function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}
import { Navigate } from 'react-router-dom';

function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600">
                            ReupSpot
                        </Link>
                        <div className="hidden md:flex ml-10 space-x-8">
                            <Link to="/shops" className="text-gray-700 hover:text-blue-600">
                                Shops
                            </Link>
                            <Link to="/search" className="text-gray-700 hover:text-blue-600">
                                Search Products
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-gray-700">Hi, {user?.email}</span>
                                <button
                                    onClick={logout}
                                    className="text-gray-500 hover:text-gray-900"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />

                    <main>
                        <Routes>
                            <Route path="/" element={<ShopListPage />} />
                            <Route path="/shops" element={<ShopListPage />} />
                            <Route path="/shop/:slug" element={<ShopPage />} />
                            <Route path="/product/:id" element={<ProductPage />} />
                            <Route path="/search" element={<SearchPage />} />
                            <Route path="/cart/:shopId" element={<ShopCartPage />} />

                            {/* Auth pages */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            {/* Buyer Dashboard */}
                            <Route path="/buyer" element={<ProtectedRoute><BuyerLayout /></ProtectedRoute>}>
                                <Route path="dashboard" element={<BuyerDashboard />} />
                                <Route path="orders" element={<OrderListPage />} />
                                <Route path="orders/:orderId" element={<OrderDetailsPage />} />
                                <Route path="disputes" element={<DisputeListPage />} />
                                <Route path="disputes/new" element={<CreateDisputePage />} />
                            </Route>
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;

