import React, { useState, useEffect } from 'react';
import { Coupon } from '../../types';
import { apiService } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { Tag, Plus, Edit2, Trash2, CheckCircle, XCircle, Percent, DollarSign, RefreshCw } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { showToast } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [usageLimit, setUsageLimit] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCoupons();
      setCoupons(data);
    } catch (err: any) {
      showToast(`Failed to load coupons: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrderAmount(0);
    setUsageLimit(0);
    setExpiryDate('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDescription(coupon.description || '');
    setDiscountType(coupon.discountType || 'percentage');
    setDiscountValue(coupon.discountValue || 0);
    setMinOrderAmount(coupon.minOrderAmount || 0);
    setUsageLimit(coupon.usageLimit || 0);
    setExpiryDate(coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '');
    setIsActive(coupon.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('Please enter a coupon code', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      usageLimit: Number(usageLimit),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      isActive,
    };

    try {
      if (editingCoupon) {
        const updated = await apiService.updateCoupon(editingCoupon.id, payload);
        setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
        showToast(`Coupon "${updated.code}" updated successfully! 🎉`, 'success');
      } else {
        const created = await apiService.createCoupon(payload);
        setCoupons(prev => [created, ...prev]);
        showToast(`New coupon "${created.code}" created! 🎉`, 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(`Coupon operation failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${couponCode}"?`)) {
      return;
    }

    try {
      await apiService.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      showToast(`Coupon "${couponCode}" deleted`, 'info');
    } catch (err: any) {
      showToast(`Failed to delete coupon: ${err.message}`, 'error');
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const updated = await apiService.updateCoupon(coupon.id, { isActive: !coupon.isActive });
      setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
      showToast(`Coupon ${updated.code} status set to ${updated.isActive ? 'Active' : 'Inactive'}`, 'info');
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-earth-100">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-earth-900 border border-earth-800 p-6 rounded-3xl">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-terracotta-400" />
            <span>Discount Coupon Management</span>
          </h2>
          <p className="text-xs text-earth-400">
            Create, activate, and manage promo codes & discount vouchers for customer checkout
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCoupons}
            className="p-2.5 bg-earth-800 hover:bg-earth-700 text-earth-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="Refresh coupons"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-warm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-earth-900 border border-earth-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-earth-400 text-xs">Loading coupons from database...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-earth-400 space-y-3">
            <Tag className="w-10 h-10 mx-auto text-earth-600" />
            <p className="text-sm font-bold text-white">No discount coupons found</p>
            <p className="text-xs">Click "Create New Coupon" above to add your first promotional voucher code.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-earth-300">
              <thead className="bg-earth-800/80 text-earth-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min Order Amount</th>
                  <th className="p-4">Usage Count</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-800">
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-earth-800/40">
                    <td className="p-4">
                      <span className="font-mono font-extrabold text-white text-xs bg-terracotta-950 text-terracotta-300 border border-terracotta-800/80 px-2.5 py-1 rounded-lg">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="p-4 text-earth-200 font-medium">{coupon.description || '—'}</td>
                    <td className="p-4 font-bold text-white">
                      {coupon.discountType === 'percentage' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <Percent className="w-3.5 h-3.5" /> {coupon.discountValue}% OFF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-terracotta-400">
                          ₹{coupon.discountValue} OFF
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-earth-300">
                      {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : 'No minimum'}
                    </td>
                    <td className="p-4 text-earth-400">
                      {coupon.usageCount || 0} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'used'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          coupon.isActive
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                        }`}
                      >
                        {coupon.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{coupon.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(coupon)}
                          className="p-1.5 bg-earth-800 hover:bg-earth-700 text-earth-200 rounded-lg text-xs font-bold"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          className="p-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 rounded-lg text-xs font-bold"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-start sm:items-center justify-center animate-fade-in">
          <div className="bg-earth-900 border-2 border-earth-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 text-xs text-white shadow-2xl my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-earth-800 pb-3">
              <h3 className="font-serif font-extrabold text-xl text-white">
                {editingCoupon ? `Edit Coupon #${editingCoupon.code}` : 'Create New Discount Coupon'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-earth-800 text-earth-300 hover:text-white hover:bg-earth-700 flex items-center justify-center font-bold transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-earth-200 mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CRAFT10, FESTIVE200"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-earth-950 border border-earth-600 rounded-xl px-4 py-3 text-xs text-white uppercase tracking-wider font-mono focus:outline-none focus:border-terracotta-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-earth-200 mb-1.5">
                  Description / Promotion Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10% OFF on all pottery items"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-earth-950 border border-earth-600 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-terracotta-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-earth-200 mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-earth-950 border border-earth-600 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-terracotta-400 font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-earth-200 mb-1.5">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={discountType === 'percentage' ? '10' : '150'}
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-earth-950 border border-earth-600 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-terracotta-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-earth-200 mb-1.5">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minOrderAmount}
                    onChange={e => setMinOrderAmount(Number(e.target.value))}
                    className="w-full bg-earth-950 border border-earth-600 rounded-xl px-4 py-3 text-xs text-white font-medium focus:outline-none focus:border-terracotta-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-earth-200 mb-1.5">
                    Usage Limit (0 = Unlimited)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={usageLimit}
                    onChange={e => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-earth-950 border border-earth-600 rounded-xl px-4 py-3 text-xs text-white font-medium focus:outline-none focus:border-terracotta-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-earth-800">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-terracotta-500 cursor-pointer"
                />
                <label htmlFor="couponActive" className="text-xs text-white font-bold cursor-pointer">
                  Coupon is Active & ready for customer use
                </label>
              </div>

              <div className="pt-4 border-t border-earth-800 flex justify-end gap-3 sticky bottom-0 bg-earth-900 py-2">
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
                  className="px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold rounded-xl text-xs shadow-warm cursor-pointer disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
