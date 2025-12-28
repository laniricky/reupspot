import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';
import { ImageUpload } from '../../components/common/ImageUpload';

interface Shop {
    id: string;
    logo_url?: string;
    banner_url?: string;
    theme?: {
        config: any;
    };
}

export function ThemeEditor() {
    const { shop } = useOutletContext<{ shop: Shop }>();
    const [config, setConfig] = useState({
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
        fontFamily: 'Inter, sans-serif',
        layoutMode: 'grid'
    });
    const [branding, setBranding] = useState({
        logo: [] as string[],
        banner: [] as string[]
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (shop?.theme?.config) {
            setConfig({ ...config, ...shop.theme.config });
        }
        if (shop) {
            setBranding({
                logo: shop.logo_url ? [shop.logo_url] : [],
                banner: shop.banner_url ? [shop.banner_url] : []
            });
        }
    }, [shop]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update theme config
            await api.put(`/shops/${shop.id}/theme`, config);

            // Update branding
            const brandingUpdates = {
                logoUrl: branding.logo[0] || null,
                bannerUrl: branding.banner[0] || null
            };
            await api.put(`/shops/${shop.id}`, brandingUpdates);

            alert('Store appearance updated successfully!');
            // Reload to reflect changes
            window.location.reload();
        } catch (error) {
            console.error('Failed to update theme', error);
            alert('Failed to update theme');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-6">
            <h2 className="text-2xl font-bold mb-6">Store Appearance</h2>

            <form onSubmit={handleSave} className="bg-white shadow sm:rounded-lg p-6 space-y-6">

                {/* Branding */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Branding</h3>
                    <div className="space-y-4">
                        <div>
                            <ImageUpload
                                label="Store Logo"
                                value={branding.logo}
                                onChange={(urls) => setBranding({ ...branding, logo: urls })}
                                multiple={false}
                                maxFiles={1}
                            />
                            <p className="mt-1 text-xs text-gray-500">Recommended size: 200x200px (Square)</p>
                        </div>
                        <div>
                            <ImageUpload
                                label="Store Banner"
                                value={branding.banner}
                                onChange={(urls) => setBranding({ ...branding, banner: urls })}
                                multiple={false}
                                maxFiles={1}
                            />
                            <p className="mt-1 text-xs text-gray-500">Recommended size: 1200x300px (Wide)</p>
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Colors</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                            <div className="mt-1 flex items-center space-x-2">
                                <input
                                    type="color"
                                    name="primaryColor"
                                    value={config.primaryColor}
                                    onChange={handleChange}
                                    className="h-10 w-10 border border-gray-300 rounded shadow-sm p-1"
                                />
                                <span className="text-gray-500 text-sm">{config.primaryColor}</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Used for buttons, links, and highlights.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                            <div className="mt-1 flex items-center space-x-2">
                                <input
                                    type="color"
                                    name="secondaryColor"
                                    value={config.secondaryColor}
                                    onChange={handleChange}
                                    className="h-10 w-10 border border-gray-300 rounded shadow-sm p-1"
                                />
                                <span className="text-gray-500 text-sm">{config.secondaryColor}</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Used for navigation and footers.</p>
                        </div>
                    </div>
                </div>

                {/* Typography */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Typography</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Font Family</label>
                        <select
                            name="fontFamily"
                            value={config.fontFamily}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                            <option value="Merriweather, serif">Merriweather (Classic Serif)</option>
                            <option value="'Courier New', monospace">Courier (Monospace)</option>
                        </select>
                    </div>
                </div>

                {/* Layout */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Layout</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Grid Layout</label>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center">
                                <input
                                    id="layout_grid"
                                    name="layoutMode"
                                    type="radio"
                                    value="grid"
                                    checked={config.layoutMode === 'grid'}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                />
                                <label htmlFor="layout_grid" className="ml-3 block text-sm font-medium text-gray-700">
                                    Grid (Cards)
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="layout_list"
                                    name="layoutMode"
                                    type="radio"
                                    value="list"
                                    checked={config.layoutMode === 'list'}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                />
                                <label htmlFor="layout_list" className="ml-3 block text-sm font-medium text-gray-700">
                                    List (Detailed Rows)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

