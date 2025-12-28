interface StatusBadgeProps {
    status: string;
    type?: 'shop' | 'dispute' | 'order' | 'user';
}

export function StatusBadge({ status, type = 'shop' }: StatusBadgeProps) {
    const getColorClasses = () => {
        const statusLower = status.toLowerCase();

        // Shop statuses
        if (type === 'shop') {
            if (statusLower === 'active') return 'bg-green-100 text-green-800';
            if (statusLower === 'frozen') return 'bg-yellow-100 text-yellow-800';
            if (statusLower === 'suspended') return 'bg-red-100 text-red-800';
        }

        // Dispute statuses
        if (type === 'dispute') {
            if (statusLower === 'open') return 'bg-orange-100 text-orange-800';
            if (statusLower === 'resolved') return 'bg-green-100 text-green-800';
            if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
        }

        // Order statuses
        if (type === 'order') {
            if (statusLower === 'completed') return 'bg-green-100 text-green-800';
            if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
            if (statusLower === 'shipped') return 'bg-blue-100 text-blue-800';
            if (statusLower === 'cancelled') return 'bg-red-100 text-red-800';
        }

        // User statuses
        if (type === 'user') {
            if (statusLower === 'active' || statusLower === 'verified') return 'bg-green-100 text-green-800';
            if (statusLower === 'suspended') return 'bg-red-100 text-red-800';
        }

        return 'bg-gray-100 text-gray-800';
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClasses()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
