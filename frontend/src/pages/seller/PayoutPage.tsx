import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';

interface Earnings {
    paid: string;
    pending: string;
}

interface Payout {
    id: string;
    amount: string;
    status: string;
    created_at: string;
    processed_at?: string;
}

interface ScheduleItem {
    payout_eligible_at: string;
    total_amount: string;
    transaction_count: string;
}

export function PayoutPage() {
    const { shop } = useOutletContext<{ shop: { id: string } }>();
    const [earnings, setEarnings] = useState<Earnings | null>(null);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!shop?.id) return;
            try {
                const [earningsRes, payoutsRes, scheduleRes] = await Promise.all([
                    api.get(`/payments/payouts/${shop.id}/earnings`),
                    api.get(`/payments/payouts/${shop.id}`),
                    api.get(`/payments/payouts/${shop.id}/schedule`)
                ]);

                setEarnings(earningsRes.data);
                setPayouts(payoutsRes.data.data || []);
                setSchedule(scheduleRes.data);
            } catch (error) {
                console.error('Failed to fetch payout data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [shop?.id]);

    if (loading) return <div>Loading payout info...</div>;

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Payouts</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Track your earnings and upcoming transfers.
                </p>
            </div>

            {/* Overview Cards */}
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Available Balance (Pending)</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        KSh {Number(earnings?.pending || 0).toLocaleString()}
                    </dd>
                    <p className="mt-2 text-xs text-gray-500">Scheduled for next payout cycle</p>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Paid Out</dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">
                        KSh {Number(earnings?.paid || 0).toLocaleString()}
                    </dd>
                    <p className="mt-2 text-xs text-gray-500">Lifetime earnings processed</p>
                </div>
            </dl>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Schedule */}
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Schedule</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {schedule.length === 0 ? (
                            <li className="px-4 py-4 text-sm text-gray-500">No upcoming payouts scheduled.</li>
                        ) : (
                            schedule.map((item, idx) => (
                                <li key={idx} className="px-4 py-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(item.payout_eligible_at).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-500">{item.transaction_count} transactions</p>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        KSh {Number(item.total_amount).toLocaleString()}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* History */}
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Payout History</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {payouts.length === 0 ? (
                            <li className="px-4 py-4 text-sm text-gray-500">No payout history found.</li>
                        ) : (
                            payouts.map((payout) => (
                                <li key={payout.id} className="px-4 py-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Payout #{payout.id.slice(0, 8)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(payout.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">
                                            KSh {Number(payout.amount).toLocaleString()}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize 
                                            ${payout.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {payout.status}
                                        </span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
