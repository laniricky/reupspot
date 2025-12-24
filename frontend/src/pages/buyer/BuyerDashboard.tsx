import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function BuyerDashboard() {
    const { user } = useAuth();

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Welcome back, {user?.email}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Here's what's happening with your orders.
                </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow rounded-lg border">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                Active Orders
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                0
                            </dd>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg border">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                Active Disputes
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                0
                            </dd>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg border">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                Following Shops
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                0
                            </dd>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
