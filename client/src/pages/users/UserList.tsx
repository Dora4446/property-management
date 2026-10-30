import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search, CheckCircle, XCircle, Trash2, Mail, Phone } from 'lucide-react';
import { User } from '../../types';
import { formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/Badge';
import api from '../../services/api';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/users/${user._id}/status`, { status: nextStatus });
      setUsers(users.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete user ${name}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      alert('User deleted.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform User Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage system administrators, property owners, managers, agents, and tenant accounts.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Administrators</option>
          <option value="PROPERTY_OWNER">Property Owners</option>
          <option value="PROPERTY_MANAGER">Property Managers</option>
          <option value="AGENT">Agents</option>
          <option value="TENANT">Tenants</option>
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No users found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={
                          u.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-medium text-slate-800">{u.phone}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-800">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{u.address?.city || 'India'}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={u.status === 'ACTIVE' ? 'Active' : 'Inactive'} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-2 py-1 rounded font-semibold text-[11px] ${
                        u.status === 'ACTIVE'
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(u._id, u.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
