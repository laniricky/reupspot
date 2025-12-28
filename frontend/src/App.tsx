import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
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
import { BuyerProfilePage } from './pages/buyer/BuyerProfilePage';
import { SellerLayout } from './layouts/SellerLayout';
import { CreateShopPage } from './pages/seller/CreateShopPage';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { ProductListPage } from './pages/seller/ProductListPage';
import { ProductEditorPage } from './pages/seller/ProductEditorPage';
import { SellerOrderListPage } from './pages/seller/SellerOrderListPage';
import { SellerOrderDetailsPage } from './pages/seller/SellerOrderDetailsPage';
import { ThemeEditor } from './pages/seller/ThemeEditor';
import { PayoutPage } from './pages/seller/PayoutPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Authenticating..." /></div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

import { Navbar } from './components/common/Navbar';

function App() {
    useEffect(() => {
        console.log("App mounted");
    }, []);

    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <div className="min-h-screen bg-gray-50">
                        <Navbar />

                        <main>
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
                                </Routes>
                            </ErrorBoundary>
                        </main>
                    </div>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;

