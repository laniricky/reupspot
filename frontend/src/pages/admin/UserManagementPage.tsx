import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Search, UserX, UserCheck } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface User {
    id: string;
    email: string;
    role: string;
    phone: string;
    email_verified: boolean;
    phone_verified: boolean;
    created_at: string;
}

export function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionType, setActionType] = useState<'suspend' | 'reactivate' | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users', { params: { search, limit: 100 } });
            setUsers(res.data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const handleSuspend = async () => {
        if (!selectedUser) return;

        try {
            await api.post(`/admin/users/${selectedUser.id}/suspend`, {
                reason: 'Admin suspended via dashboard'
            });
            await fetchUsers();
            setActionType(null);
            setSelectedUser(null);
        } catch (error) {
            console.error('Failed to suspend user:', error);
        }
    };

    const handleReactivate = async () => {
        if (!selectedUser) return;

        try {
            await api.post(`/admin/users/${selectedUser.id}/reactivate`);
            await fetchUsers();
            setActionType(null);
            setSelectedUser(null);
        } catch (error) {
            console.error('Failed to reactivate user:', error);
        }
    };

    const columns = [
        {
            key: 'email',
            header: 'Email',
            render: (user: User) => <span className="font-medium">{user.email}</span>
        },
        {
            key: 'role',
            header: 'Role',
            render: (user: User) => (
                <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {user.role}
                </span>
            )
        },
        {
            key: 'phone',
            header: 'Phone',
            render: (user: User) => user.phone || 'N/A'
        },
        {
            key: 'status',
            header: 'Status',
            render: (user: User) => (
                <StatusBadge
                    status={user.email_verified ? 'Active' : 'Suspended'}
                    type="user"
                />
            )
        },
        {
            key: 'verified',
            header: 'Verified',
            render: (user: User) => (
                <div className="flex gap-2">
                    {user.email_verified && <span className="text-xs text-green-600">✓ Email</span>}
                    {user.phone_verified && <span className="text-xs text-green-600">✓ Phone</span>}
                    {!user.email_verified && !user.phone_verified && <span className="text-xs text-gray-400">None</span>}
                </div>
            )
        },
        {
            key: 'created',
            header: 'Joined',
            render: (user: User) => new Date(user.created_at).toLocaleDateString()
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (user: User) => (
                <div className="flex gap-2">
                    {user.email_verified ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                                setActionType('suspend');
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Suspend User"
                        >
                            <UserX size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                                setActionType('reactivate');
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Reactivate User"
                        >
                            <UserCheck size={18} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    if (loading && users.length === 0) return <LoadingSpinner size="lg" />;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable data={users} columns={columns} loading={loading} />
            </div>

            <ConfirmationModal
                isOpen={actionType === 'suspend'}
                title="Suspend User"
                message={`Are you sure you want to suspend ${selectedUser?.email}? They will not be able to log in.`}
                confirmText="Suspend"
                cancelText="Cancel"
                variant="danger"
                onConfirm={handleSuspend}
                onCancel={() => {
                    setActionType(null);
                    setSelectedUser(null);
                }}
            />

            <ConfirmationModal
                isOpen={actionType === 'reactivate'}
                title="Reactivate User"
                message={`Are you sure you want to reactivate ${selectedUser?.email}?`}
                confirmText="Reactivate"
                cancelText="Cancel"
                variant="info"
                onConfirm={handleReactivate}
                onCancel={() => {
                    setActionType(null);
                    setSelectedUser(null);
                }}
            />
        </div>
    );
}
