import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { apiService } from '../../services/api';
import { User } from '../../types';
import { Users, Search, ShieldCheck, Ban, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { currentUser, orders } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchRealUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getUsers();
      if (data && Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err: any) {
      console.error('❌ Error fetching admin users:', err);
      setError(err.message || 'Failed to fetch registered users from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealUsers();
  }, [currentUser]);

  // Filter users by search term
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-earth-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-terracotta-500/20 text-terracotta-400 border border-terracotta-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
              MongoDB User Management
            </span>
            <span className="text-xs text-earth-400 font-medium">• Total ({users.length}) Users</span>
          </div>
          <h2 className="font-serif text-2xl font-extrabold text-white">Registered User Management</h2>
          <p className="text-xs text-earth-400 mt-0.5">Real-time user accounts from MongoDB Atlas users collection</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRealUsers}
            disabled={loading}
            className="bg-earth-800 hover:bg-earth-700 text-earth-300 p-2.5 rounded-full border border-earth-700 transition-colors"
            title="Refresh Users List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-terracotta-400' : ''}`} />
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-earth-900 border border-earth-700 rounded-full px-4 py-2 pl-9 text-xs text-white placeholder-earth-400 focus:outline-none focus:border-terracotta-500"
            />
            <Search className="w-3.5 h-3.5 text-earth-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-4 rounded-2xl text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchRealUsers} className="underline font-bold">Retry</button>
        </div>
      )}

      <div className="bg-earth-900 border border-earth-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-300">
            <thead className="bg-earth-800/80 text-earth-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-800">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-earth-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-terracotta-400 mb-2" />
                    <span>Loading MongoDB Users...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-earth-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const displayName = u.name || 'Unnamed User';
                  const initial = displayName.charAt(0).toUpperCase();
                  const createdStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

                  return (
                    <tr key={u.id || u._id} className="hover:bg-earth-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-terracotta-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {initial}
                        </div>
                        <span className="line-clamp-1">{displayName}</span>
                      </td>
                      <td className="p-3.5 text-earth-300 font-mono text-[11px]">{u.email}</td>
                      <td className="p-3.5 text-earth-300">{u.phone || 'N/A'}</td>
                      <td className="p-3.5 uppercase font-bold text-[10px]">
                        <span className={`px-2 py-0.5 rounded-md border ${u.role === 'admin' ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-earth-800 text-earth-300 border-earth-700'}`}>
                          {u.role || 'customer'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3.5 text-earth-400 font-mono text-[11px]">{createdStr}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
