import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Settings, Save, RefreshCw, Package, Truck, Tag, ToggleLeft, ToggleRight, IndianRupee } from 'lucide-react';

export const AdminOrderCharges: React.FC = () => {
  const { orderCharges, updateOrderCharges, fetchOrderCharges } = useStore();

  const [shippingFee, setShippingFee] = useState<string>(String(orderCharges.shippingFee));
  const [packagingFee, setPackagingFee] = useState<string>(String(orderCharges.packagingFee));
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<string>(String(orderCharges.freeShippingThreshold));
  const [shippingLabel, setShippingLabel] = useState<string>(orderCharges.safeFragileShippingLabel);
  const [isFreeShippingEnabled, setIsFreeShippingEnabled] = useState<boolean>(orderCharges.isFreeShippingEnabled);
  const [saving, setSaving] = useState(false);

  // Sync local form when orderCharges changes from context
  React.useEffect(() => {
    setShippingFee(String(orderCharges.shippingFee));
    setPackagingFee(String(orderCharges.packagingFee));
    setFreeShippingThreshold(String(orderCharges.freeShippingThreshold));
    setShippingLabel(orderCharges.safeFragileShippingLabel);
    setIsFreeShippingEnabled(orderCharges.isFreeShippingEnabled);
  }, [orderCharges]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateOrderCharges({
        shippingFee: Number(shippingFee),
        packagingFee: Number(packagingFee),
        freeShippingThreshold: Number(freeShippingThreshold),
        safeFragileShippingLabel: shippingLabel.trim() || 'Safe Fragile Shipping',
        isFreeShippingEnabled,
      });
    } finally {
      setSaving(false);
    }
  };

  const totalCharge = Number(shippingFee) + Number(packagingFee);

  return (
    <div className="space-y-6 animate-fade-in text-earth-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-earth-900 border border-earth-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-terracotta-500/20 text-terracotta-400 border border-terracotta-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
              Store Configuration
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">Order Charges Manager</h2>
          <p className="text-xs text-earth-400 mt-1">
            Configure shipping fees, packaging charges, and free shipping thresholds stored in MongoDB Atlas.
          </p>
        </div>
        <button
          onClick={fetchOrderCharges}
          className="bg-earth-800 hover:bg-earth-700 text-earth-200 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh from DB</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <form onSubmit={handleSave} className="bg-earth-900 border border-earth-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-earth-800">
            <Settings className="w-5 h-5 text-terracotta-400" />
            <h3 className="font-serif font-bold text-lg text-white">Configure Order Charges</h3>
          </div>

          {/* Shipping Fee */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-earth-300">
              <Truck className="w-3.5 h-3.5 text-terracotta-400" />
              Shipping Fee (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-earth-400 text-xs font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={shippingFee}
                onChange={e => setShippingFee(e.target.value)}
                className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3 py-2.5 pl-7 text-white text-xs font-bold focus:border-terracotta-500 outline-none"
                placeholder="e.g. 99"
              />
            </div>
            <p className="text-[11px] text-earth-500">Standard shipping charge per order</p>
          </div>

          {/* Packaging Fee */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-earth-300">
              <Package className="w-3.5 h-3.5 text-terracotta-400" />
              Packaging / Fragile Handling Fee (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-earth-400 text-xs font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={packagingFee}
                onChange={e => setPackagingFee(e.target.value)}
                className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3 py-2.5 pl-7 text-white text-xs font-bold focus:border-terracotta-500 outline-none"
                placeholder="e.g. 0"
              />
            </div>
            <p className="text-[11px] text-earth-500">Extra handling for fragile clay/ceramic items (set 0 to disable)</p>
          </div>

          {/* Shipping Label */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-earth-300">
              <Tag className="w-3.5 h-3.5 text-terracotta-400" />
              Shipping Line Label (displayed in cart)
            </label>
            <input
              type="text"
              value={shippingLabel}
              onChange={e => setShippingLabel(e.target.value)}
              className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3 py-2.5 text-white text-xs focus:border-terracotta-500 outline-none"
              placeholder="e.g. Safe Fragile Shipping"
            />
          </div>

          {/* Free Shipping Toggle */}
          <div className="flex items-center justify-between bg-earth-800 rounded-2xl p-4">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white">Enable Free Shipping (Cart Threshold)</p>
              <p className="text-[11px] text-earth-400">When enabled, orders above the threshold get free shipping</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFreeShippingEnabled(!isFreeShippingEnabled)}
              className="shrink-0 ml-4"
            >
              {isFreeShippingEnabled
                ? <ToggleRight className="w-10 h-10 text-emerald-400" />
                : <ToggleLeft className="w-10 h-10 text-earth-500" />
              }
            </button>
          </div>

          {/* Free Shipping Threshold */}
          {isFreeShippingEnabled && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold text-earth-300">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                Free Shipping Threshold (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-earth-400 text-xs font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={freeShippingThreshold}
                  onChange={e => setFreeShippingThreshold(e.target.value)}
                  className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3 py-2.5 pl-7 text-white text-xs font-bold focus:border-terracotta-500 outline-none"
                  placeholder="e.g. 1499"
                />
              </div>
              <p className="text-[11px] text-earth-500">Orders above this amount qualify for free delivery</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-warm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving to MongoDB...' : 'Save Order Charges to MongoDB'}</span>
          </button>
        </form>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <div className="bg-earth-900 border border-earth-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-white border-b border-earth-800 pb-3">
              Live Cart Preview
            </h3>
            <p className="text-[11px] text-earth-400">This is how charges will appear to customers in the cart:</p>

            {/* Order Summary Preview */}
            <div className="bg-[#f9f6f2] rounded-2xl p-4 text-earth-800 space-y-3">
              <h4 className="font-serif font-bold text-base text-earth-900">Order Summary</h4>
              <div className="border-t border-earth-200 pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold">₹500</span>
                </div>
                <div className="flex justify-between">
                  <span>{shippingLabel || 'Safe Fragile Shipping'}</span>
                  <span className="font-bold">
                    {isFreeShippingEnabled && 500 >= Number(freeShippingThreshold)
                      ? <span className="text-emerald-600">FREE</span>
                      : `₹${totalCharge}`
                    }
                  </span>
                </div>
              </div>

              {/* Coupon Area */}
              <div className="border-t border-earth-200 pt-3">
                <p className="text-[11px] font-bold uppercase text-earth-500 tracking-wider mb-2">Have a Discount Coupon?</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value=""
                    placeholder="Enter code (e.g. CRAFT10)"
                    className="flex-1 border border-earth-200 rounded-lg px-3 py-1.5 text-xs text-earth-500 bg-white"
                  />
                  <button type="button" className="bg-earth-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    Apply
                  </button>
                </div>
              </div>

              <div className="flex justify-between font-bold text-sm border-t border-earth-200 pt-3">
                <span>Total Payable</span>
                <span className="text-[#c0533e] font-extrabold font-serif">
                  ₹{(500 + (isFreeShippingEnabled && 500 >= Number(freeShippingThreshold) ? 0 : totalCharge)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Current DB Config */}
          <div className="bg-earth-900 border border-earth-800 rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-earth-300 uppercase tracking-wider">Current MongoDB Configuration</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-earth-400">
                <span>Shipping Fee</span>
                <span className="text-white font-bold">₹{orderCharges.shippingFee}</span>
              </div>
              <div className="flex justify-between text-earth-400">
                <span>Packaging Fee</span>
                <span className="text-white font-bold">₹{orderCharges.packagingFee}</span>
              </div>
              <div className="flex justify-between text-earth-400">
                <span>Total Order Charge</span>
                <span className="text-terracotta-400 font-bold">₹{orderCharges.shippingFee + orderCharges.packagingFee}</span>
              </div>
              <div className="flex justify-between text-earth-400">
                <span>Free Shipping Above</span>
                <span className="text-emerald-400 font-bold">
                  {orderCharges.isFreeShippingEnabled ? `₹${orderCharges.freeShippingThreshold}` : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between text-earth-400">
                <span>Shipping Label</span>
                <span className="text-white font-bold text-right max-w-[160px] truncate">{orderCharges.safeFragileShippingLabel}</span>
              </div>
              {orderCharges.updatedBy && (
                <div className="flex justify-between text-earth-400 pt-2 border-t border-earth-800">
                  <span>Last updated by</span>
                  <span className="text-earth-300 font-medium">{orderCharges.updatedBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
