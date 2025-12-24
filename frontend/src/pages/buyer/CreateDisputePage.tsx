import React, { useState } from 'react';
import { api } from '../../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function CreateDisputePage() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId') || '';
    const navigate = useNavigate();

    const [reason, setReason] = useState('non_delivery');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/disputes', {
                orderId,
                reason,
                description
            });
            alert('Dispute opened successfully. The trust engine will review it shorty.');
            navigate('/buyer/disputes');
        } catch (error) {
            console.error('Failed to create dispute', error);
            alert('Failed to open dispute');
        } finally {
            setLoading(false);
        }
    };

    if (!orderId) return <div className="p-8 text-red-600">No Order ID provided. Start from Order History.</div>;

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Open Dispute</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Order ID</label>
                    <input type="text" disabled value={orderId} className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm px-3 py-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                    <select
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    >
                        <option value="non_delivery">Item not received</option>
                        <option value="item_damage">Item damaged/defective</option>
                        <option value="item_mismatch">Item description mismatch</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        rows={4}
                        required
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                        placeholder="Please describe the issue in detail..."
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:bg-gray-400"
                    >
                        {loading ? 'Submitting...' : 'Submit Dispute'}
                    </button>
                </div>
            </form>
        </div>
    );
}
