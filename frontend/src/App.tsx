import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold text-blue-600">
                                    Multi-Tenant E-Commerce
                                </h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <a href="/login" className="text-gray-700 hover:text-blue-600">
                                    Login
                                </a>
                                <a
                                    href="/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Register
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>

                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

function HomePage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Welcome to the Multi-Tenant E-Commerce Platform
            </h2>
            <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-2xl font-semibold mb-4">Platform Features</h3>
                <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Multi-Tenant Architecture with Individual Shops</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Escrow-Based Payments for Buyer Protection</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Trust Engine with Anti-Scam Detection</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Guest Checkout - No Account Required</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Global Product Search Across All Shops</span>
                    </li>
                </ul>
                <div className="mt-8">
                    <h4 className="text-lg font-semibold mb-2">Test Shops:</h4>
                    <div className="space-y-2">
                        <a
                            href="/shop/tech-haven"
                            className="block text-blue-600 hover:underline"
                        >
                            → Tech Haven - Electronics & Gadgets
                        </a>
                        <a
                            href="/shop/fashion-hub"
                            className="block text-blue-600 hover:underline"
                        >
                            → Fashion Hub - Clothing & Accessories
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoginPage() {
    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6">Login</h2>
                <p className="text-gray-600 mb-6">
                    Backend API running at: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code>
                </p>
                <p className="text-sm text-gray-500">
                    Use the API endpoints documented in README.md to interact with the backend.
                </p>
            </div>
        </div>
    );
}

function RegisterPage() {
    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6">Register</h2>
                <p className="text-gray-600 mb-6">
                    Backend API running at: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code>
                </p>
                <p className="text-sm text-gray-500">
                    Use the API endpoints documented in README.md to interact with the backend.
                </p>
            </div>
        </div>
    );
}

export default App;
