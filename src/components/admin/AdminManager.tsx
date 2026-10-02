import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { apiService } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { 
  ShieldCheck, UserPlus, Edit2, Trash2, CheckCircle, XCircle, 
  KeyRound, RefreshCw, ShieldAlert, Lock, Check, User as UserIcon, Mail, Sparkles, X
} from 'lucide-react';

interface ModuleOption {
  id: string;
  label: string;
  description: string;
}

const AVAILABLE_MODULES: ModuleOption[] = [
  { id: 'dashboard', label: 'Dashboard Overview', description: 'View sales analytics & overview metrics' },
  { id: 'orders', label: 'Order Management', description: 'View and update customer order fulfillment statuses' },
  { id: 'products', label: 'Product Catalog', description: 'Add, edit, and remove products' },
  { id: 'inventory', label: 'Stock & Inventory', description: 'Adjust product stock levels & low stock alerts' },
  { id: 'users', label: 'Customer Management', description: 'View registered customer accounts & profiles' },
  { id: 'payments', label: 'UPI Payments Log', description: 'View payment transaction history' },
  { id: 'categories', label: 'Category Manager', description: 'Add and edit product categories' },
  { id: 'wishlist', label: 'Wishlist Analytics', description: 'Inspect customer wishlist insights' },
  { id: 'coupons', label: 'Discount Coupons', description: 'Manage promo codes & vouchers' },
  { id: 'admins', label: 'Admin User Management', description: 'Create and manage admin users & access permissions' },
];

export const AdminManager: React.FC = () => {
  const { showToast } = useStore();
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'dashboard', 'orders', 'products', 'inventory', 'users', 'payments', 'categories', 'wishlist', 'coupons'
  ]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAdmins();
      setAdmins(data);
    } catch (err: any) {
      showToast(`Failed to load admin list: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAdmin(null);
    setName('');
    setEmail('');
    setPassword('');
    setSelectedPermissions([
      'dashboard', 'orders', 'products', 'inventory', 'users', 'payments', 'categories', 'wishlist', 'coupons'
    ]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin: User) => {
    setEditingAdmin(admin);
    setName(admin.name || '');
    setEmail(admin.email || '');
    setPassword(''); // Leave blank unless updating
    setSelectedPermissions(admin.adminPermissions || ['dashboard']);
    setIsActive(admin.isActive !== false);
    setIsModalOpen(true);
  };

  const handlePermissionToggle = (moduleId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissions(AVAILABLE_MODULES.map(m => m.id));
  };

  const handleClearPermissions = () => {
    setSelectedPermissions(['dashboard']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter admin email address', 'error');
      return;
    }

    if (!editingAdmin && !password.trim()) {
      showToast('Please set a password for the new admin', 'error');
      return;
    }

    if (password && password.trim().length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (editingAdmin) {
        const payload: any = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          adminPermissions: selectedPermissions,
          isActive,
        };
        if (password.trim()) {
          payload.password = password.trim();
        }
        const updated = await apiService.updateAdmin(editingAdmin.id, payload);
        setAdmins(prev => prev.map(a => a.id === updated.id ? updated : a));
        showToast(`Admin account "${updated.email}" updated successfully!`, 'success');
      } else {
        const payload = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          adminPermissions: selectedPermissions,
          isActive,
        };
        const created = await apiService.createAdmin(payload);
        setAdmins(prev => [created, ...prev]);
        showToast(`New admin account "${created.email}" created! 🎉`, 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(`Operation failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (admin: User) => {
    if (admin.isMainAdmin) {
      showToast('The Main Admin account cannot be deleted', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete admin account "${admin.email}"?`)) {
      return;
    }

    try {
      await apiService.deleteAdmin(admin.id);
      setAdmins(prev => prev.filter(a => a.id !== admin.id));
      showToast(`Admin account "${admin.email}" deleted`, 'info');
    } catch (err: any) {
      showToast(`Failed to delete admin: ${err.message}`, 'error');
    }
  };

  const handleToggleActive = async (admin: User) => {
    if (admin.isMainAdmin) {
      showToast('The Main Admin account cannot be disabled', 'error');
      return;
    }

    try {
      const updated = await apiService.toggleAdminActive(admin.id);
      setAdmins(prev => prev.map(a => a.id === updated.id ? updated : a));
      showToast(`Admin "${updated.email}" is now ${updated.isActive ? 'Active' : 'Disabled'}`, 'info');
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-earth-100">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-earth-900 border border-earth-800 p-6 rounded-3xl shadow-sm">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-terracotta-400" />
            <span>Admin User Management & Access Control</span>
          </h2>
          <p className="text-xs text-earth-400 mt-1">
            Control which admin users can log in, set passwords, and manage granular module access permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdmins}
            className="px-3.5 py-2.5 bg-earth-800 hover:bg-earth-700 border border-earth-700 text-earth-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-terracotta-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-warm flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Admin</span>
          </button>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-earth-900 border border-earth-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-earth-400 text-xs">Loading admin accounts...</div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-earth-400 space-y-3">
            <ShieldAlert className="w-10 h-10 mx-auto text-earth-600" />
            <p className="text-sm font-bold text-white">No admin users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-earth-300">
              <thead className="bg-earth-800/80 text-earth-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Admin User</th>
                  <th className="p-4">Email & Role</th>
                  <th className="p-4">Module Access Permissions</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-800">
                {admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-earth-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-terracotta-950 border border-terracotta-800 flex items-center justify-center font-bold text-terracotta-300 text-sm">
                          {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{admin.name || 'Admin User'}</span>
                            {admin.isMainAdmin && (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase">
                                ★ Main Admin
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-earth-400">Created: {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-mono text-white font-semibold text-xs">{admin.email}</p>
                      <span className="text-[10px] text-terracotta-400 uppercase font-bold">
                        {admin.isMainAdmin ? 'Super Administrator' : 'Staff Admin'}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {admin.isMainAdmin ? (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            All Modules Access (Full Control)
                          </span>
                        ) : admin.adminPermissions && admin.adminPermissions.length > 0 ? (
                          admin.adminPermissions.map(p => (
                            <span key={p} className="bg-earth-800 text-earth-200 border border-earth-700 px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-earth-500 text-[10px]">No modules assigned</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(admin)}
                        disabled={admin.isMainAdmin}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          admin.isMainAdmin
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800 cursor-default'
                            : admin.isActive !== false
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 cursor-pointer hover:bg-emerald-900'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-800/80 cursor-pointer hover:bg-rose-900'
                        }`}
                      >
                        {admin.isActive !== false ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{admin.isActive !== false ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(admin)}
                          className="p-2 bg-earth-800 hover:bg-earth-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-earth-700"
                          title="Edit Admin & Permissions"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!admin.isMainAdmin && (
                          <button
                            onClick={() => handleDelete(admin)}
                            className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-800/80"
                            title="Delete Admin Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-start sm:items-center justify-center animate-fade-in">
          <div className="bg-earth-900 border-2 border-earth-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-xs text-white shadow-2xl my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-earth-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-terracotta-500/20 text-terracotta-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-xl text-white">
                    {editingAdmin ? `Edit Admin Account` : 'Create New Admin User'}
                  </h3>
                  <p className="text-xs text-earth-400 mt-0.5">
                    {editingAdmin ? editingAdmin.email : 'Set credentials & module access permissions for staff admin'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-earth-800 text-earth-300 hover:text-white hover:bg-earth-700 flex items-center justify-center font-bold transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-earth-200 mb-1.5 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-terracotta-400" />
                    <span>Admin Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-earth-950 border border-earth-600 rounded-xl px-4 py-3 text-xs text-white placeholder-earth-500 focus:outline-none focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-500/20 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-earth-200 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-terracotta-400" />
                    <span>Admin Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@craftveda.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-earth-950 border border-earth-600 rounded-xl px-4 py-3 text-xs text-white placeholder-earth-500 focus:outline-none focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-500/20 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Password Row */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-earth-200 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-terracotta-400" />
                  <span>{editingAdmin ? 'New Password (leave blank to keep existing)' : 'Set Admin Password *'}</span>
                </label>
                <input
                  type="password"
                  required={!editingAdmin}
                  minLength={6}
                  placeholder={editingAdmin ? '••••••••' : 'Minimum 6 characters'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-earth-950 border border-earth-600 rounded-xl px-4 py-3 text-xs text-white placeholder-earth-500 focus:outline-none focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-500/20 font-medium transition-all"
                />
              </div>

              {/* Module Permissions Checklist */}
              <div className="space-y-3 pt-3 border-t border-earth-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-terracotta-400" />
                    <span>Module Access & Control Permissions ({selectedPermissions.length}/{AVAILABLE_MODULES.length})</span>
                  </label>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="text-terracotta-400 hover:text-terracotta-300 hover:underline cursor-pointer"
                    >
                      ✓ Select All
                    </button>
                    <span className="text-earth-600">•</span>
                    <button
                      type="button"
                      onClick={handleClearPermissions}
                      className="text-earth-400 hover:text-earth-200 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-earth-950/80 p-4 rounded-2xl border border-earth-800 max-h-60 overflow-y-auto">
                  {AVAILABLE_MODULES.map(mod => {
                    const isChecked = selectedPermissions.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handlePermissionToggle(mod.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-all ${
                          isChecked
                            ? 'bg-terracotta-950/80 border-2 border-terracotta-500 text-white font-bold shadow-md'
                            : 'bg-earth-900 border border-earth-700/80 text-earth-300 hover:border-earth-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 accent-terracotta-500 cursor-pointer"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{mod.label}</p>
                          <p className="text-[10px] text-earth-400 leading-tight mt-0.5">{mod.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Account Status Toggle */}
              <div className="flex items-center gap-3 pt-3 border-t border-earth-800">
                <input
                  type="checkbox"
                  id="adminActive"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  disabled={editingAdmin?.isMainAdmin}
                  className="w-4 h-4 accent-terracotta-500 cursor-pointer"
                />
                <label htmlFor="adminActive" className="text-xs text-white font-bold cursor-pointer">
                  Account is Active & allowed to sign in to Admin Website
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-earth-800 flex items-center justify-end gap-3 sticky bottom-0 bg-earth-900 py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 bg-earth-800 hover:bg-earth-700 border border-earth-700 text-earth-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold rounded-xl text-xs shadow-warm flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Saving Account...' : editingAdmin ? 'Update Admin Account' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
