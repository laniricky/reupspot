import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function BuyerProfilePage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        email: user?.email || '',
        phone: '', // would come from user object in real app
        notifyEmail: true,
        notifySms: false
    });

    // Placeholder for update
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Profile update functionality coming soon in Phase 6 (Security & Polish)');
    };

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6 space-y-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>

                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-4">
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <input
                                type="email"
                                // disabled for now as email change requires verification
                                disabled
                                value={formData.email}
                                className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm px-3 py-2 border"
                            />
                            <p className="mt-1 text-xs text-gray-500">Contact support to change email.</p>
                        </div>

                        <div className="col-span-6 sm:col-span-4">
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+254..."
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Notifications</h3>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="email_notify"
                                        type="checkbox"
                                        checked={formData.notifyEmail}
                                        onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.checked })}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="email_notify" className="font-medium text-gray-700">Email Notifications</label>
                                    <p className="text-gray-500">Receive order updates via email.</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="sms_notify"
                                        type="checkbox"
                                        checked={formData.notifySms}
                                        onChange={(e) => setFormData({ ...formData, notifySms: e.target.checked })}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="sms_notify" className="font-medium text-gray-700">SMS Notifications</label>
                                    <p className="text-gray-500">Receive critical alerts via SMS.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Save Details
                    </button>
                </div>
            </form>
        </div>
    );
}
