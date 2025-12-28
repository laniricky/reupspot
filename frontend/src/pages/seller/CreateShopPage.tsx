import { useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ImageUpload } from '../../components/common/ImageUpload';
import { useToast } from '../../hooks/useToast';

export function CreateShopPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logoUrl: '',
        bannerUrl: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/shops', formData);
            toast.success('Shop created successfully!');
            navigate('/seller/dashboard');
        } catch (err: any) {
            console.error('Failed to create shop', err);
            setError(err.response?.data?.message || 'Failed to create shop');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your Shop
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Let's get you started with selling on ReupSpot.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Shop Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <ImageUpload
                                value={formData.logoUrl ? [formData.logoUrl] : []}
                                onChange={(urls) => setFormData({ ...formData, logoUrl: urls[0] })}
                                multiple={false}
                                label="Shop Logo"
                                maxFiles={1}
                            />
                        </div>

                        <div>
                            <ImageUpload
                                value={formData.bannerUrl ? [formData.bannerUrl] : []}
                                onChange={(urls) => setFormData({ ...formData, bannerUrl: urls[0] })}
                                multiple={false}
                                label="Shop Banner"
                                maxFiles={1}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
                            >
                                {loading ? 'Creating Shop...' : 'Create Shop'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
