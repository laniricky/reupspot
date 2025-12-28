import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';

interface Shop {
    id: string;
}

export function ProductEditorPage() {
    const { productId } = useParams<{ productId: string }>();
    const { shop } = useOutletContext<{ shop: Shop }>();
    const navigate = useNavigate();
    const isEdit = !!productId;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: 'electronics',
        images: [] as string[]
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            // Fetch product details
            api.get(`/products/${productId}`)
                .then(res => {
                    const p = res.data;
                    setFormData({
                        title: p.title,
                        description: p.description,
                        price: p.price,
                        stock_quantity: p.stock_quantity,
                        category: p.category || 'electronics',
                        images: p.images || []
                    });
                })
                .catch(err => console.error(err));
        }
    }, [isEdit, productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            shopId: shop.id,
            price: Number(formData.price),
            stock_quantity: Number(formData.stock_quantity),
            // Mock images for now if empty
            images: formData.images.length ? formData.images : ['https://via.placeholder.com/300']
        };

        try {
            if (isEdit) {
                await api.put(`/products/${productId}`, payload);
            } else {
                await api.post('/products', payload);
            }
            navigate('/seller/products');
        } catch (error: any) {
            console.error('Failed to save product', error);
            alert(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        rows={4}
                        required
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    />
                    <p className="mt-1 text-xs text-red-500">
                        Do not include phone numbers or email addresses. Trust engine will reject.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price (KSh)</label>
                        <input
                            type="number"
                            required
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <input
                            type="number"
                            required
                            value={formData.stock_quantity}
                            onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    >
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                        <option value="home">Home & Living</option>
                    </select>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
                    >
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
