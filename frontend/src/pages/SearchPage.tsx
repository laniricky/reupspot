import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useSearchParams, Link } from 'react-router-dom';

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    images: string[];
    shop_id: string;
    shop_name: string;
    shop_slug: string;
}

export function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    // Search input state
    const [searchInput, setSearchInput] = useState(query);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (query) params.append('q', query);
                if (category) params.append('category', category);
                if (minPrice) params.append('minPrice', minPrice);
                if (maxPrice) params.append('maxPrice', maxPrice);

                const response = await api.get(`/search/products?${params.toString()}`);
                setProducts(response.data.products || []);
            } catch (error) {
                console.error('Search failed', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, category, minPrice, maxPrice]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams({ ...Object.fromEntries(searchParams), q: searchInput });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Products</h1>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8 flex gap-4">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search for products..."
                    className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                    Search
                </button>
            </form>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="font-bold mb-4">Filters</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                className="w-full border rounded p-2"
                                value={category}
                                onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), category: e.target.value })}
                            >
                                <option value="">All Categories</option>
                                <option value="electronics">Electronics</option>
                                <option value="fashion">Fashion</option>
                                <option value="home">Home & Garden</option>
                                <option value="beauty">Beauty</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full border rounded p-2"
                                    value={minPrice}
                                    onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), minPrice: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full border rounded p-2"
                                    value={maxPrice}
                                    onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), maxPrice: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="text-center py-12">Loading results...</div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No products found matching your criteria.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                                >
                                    <div className="h-48 bg-gray-200 object-cover flex items-center justify-center text-gray-400">
                                        {product.images && product.images[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span>No Image</span>
                                        )}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="mb-2">
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {product.shop_name}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h4>
                                        <div className="mt-auto pt-4">
                                            <p className="text-blue-600 font-bold text-lg">KSh {product.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
