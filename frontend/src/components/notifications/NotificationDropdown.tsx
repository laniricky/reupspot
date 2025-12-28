import { useNotifications } from '../../contexts/NotificationContext';
import { Check, Info, AlertTriangle, Package, CheckCircle } from 'lucide-react';
// import { Link } from 'react-router-dom';

interface NotificationDropdownProps {
    onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
    const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
    // const navigate = useNavigate();

    const handleNotificationClick = async (notification: any) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Handle navigation based on type or data
        // For now just close, but example: if (notification.type === 'order') navigate(`/orders/${notification.data.orderId}`)
        onClose();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order_update': return <Package className="text-blue-500" size={18} />;
            case 'dispute_update': return <AlertTriangle className="text-orange-500" size={18} />;
            case 'promotion': return <CheckCircle className="text-green-500" size={18} />;
            default: return <Info className="text-gray-500" size={18} />;
        }
    };

    return (
        <div className="flex flex-col max-h-96">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllAsRead()}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        <Check size={14} className="mr-1" />
                        Mark all read
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        No notifications
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="ml-2 flex-shrink-0">
                                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="p-2 border-t border-gray-100 text-center bg-gray-50">
                <button
                    onClick={onClose}
                    className="text-xs text-gray-500 hover:text-gray-900"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
