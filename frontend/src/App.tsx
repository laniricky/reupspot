import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ShopListPage } from './pages/ShopListPage';
import { ShopPage } from './pages/ShopPage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { CreateShopPage } from './pages/seller/CreateShopPage';
import { ProductEditorPage } from './pages/seller/ProductEditorPage';
import { ProductListPage } from './pages/seller/ProductListPage';
import { ProductPage } from './pages/ProductPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ShopCartPage } from './pages/cart/ShopCartPage';
import { BuyerLayout } from './layouts/BuyerLayout';
import { SellerLayout } from './layouts/SellerLayout';
import { OrderListPage } from './pages/buyer/OrderListPage';
import { OrderDetailsPage } from './pages/buyer/OrderDetailsPage';
import { DisputeListPage } from './pages/buyer/DisputeListPage';
import { CreateDisputePage } from './pages/buyer/CreateDisputePage';
import { BuyerProfilePage } from './pages/buyer/BuyerProfilePage';
import { SellerOrderListPage } from './pages/seller/SellerOrderListPage';
import { SellerOrderDetailsPage } from './pages/seller/SellerOrderDetailsPage';
import { ThemeEditor } from './pages/seller/ThemeEditor';
import { PayoutPage } from './pages/seller/PayoutPage';
import { Navbar } from './components/common/Navbar';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ShopManagementPage } from './pages/admin/ShopManagementPage';
import { DisputeManagementPage } from './pages/admin/DisputeManagementPage';

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <LoadingSpinner size="lg" text="Authenticating..." />;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <LoadingSpinner size="lg" text="Authenticating..." />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

function App() {
    useEffect(() => {
        // Initial setup if needed
    }, []);

    return (
        <AuthProvider>
            <ToastProvider>
                <NotificationProvider>
                    <Router>
                        <div className="min-h-screen bg-gray-50 flex flex-col">
                            <Navbar />
                            <main className="flex-1">
                                <ErrorBoundary>
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
                                            <Route path="settings" element={<BuyerProfilePage />} />
                                        </Route>

                                        {/* Seller Dashboard */}
                                        <Route path="/seller" element={<ProtectedRoute><SellerLayout /></ProtectedRoute>}>
                                            <Route path="create-shop" element={<CreateShopPage />} />
                                            <Route path="dashboard" element={<SellerDashboard />} />
                                            <Route path="products" element={<ProductListPage />} />
                                            <Route path="products/new" element={<ProductEditorPage />} />
                                            <Route path="products/:productId" element={<ProductEditorPage />} />
                                            <Route path="orders" element={<SellerOrderListPage />} />
                                            <Route path="orders/:orderId" element={<SellerOrderDetailsPage />} />
                                            <Route path="settings" element={<ThemeEditor />} />
                                            <Route path="payouts" element={<PayoutPage />} />
                                        </Route>

                                        {/* Admin Dashboard */}
                                        <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
                                            <Route path="dashboard" element={<AdminDashboard />} />
                                            <Route path="users" element={<UserManagementPage />} />
                                            <Route path="shops" element={<ShopManagementPage />} />
                                            <Route path="disputes" element={<DisputeManagementPage />} />
                                            <Route path="settings" element={<div className="p-4">Admin Settings (Coming Soon)</div>} />
                                        </Route>
                                    </Routes>
                                </ErrorBoundary>
                            </main>
                        </div>
                    </Router>
                </NotificationProvider>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
