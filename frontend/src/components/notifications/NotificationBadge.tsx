import { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBadge() {
    const { unreadCount } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 z-40 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <NotificationDropdown onClose={() => setIsOpen(false)} />
                    </div>
                </>
            )}
        </div>
    );
}
