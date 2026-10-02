import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, Mail, Phone, CheckCircle2, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

export const PersonalDetailsView: React.FC = () => {
  const { currentUser, updateUserProfile, addSavedAddress, setActiveCustomerPage, showToast } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    try {
      setLoading(true);

      // Save user profile details
      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
      });

      // Optional default address if provided
      if (houseFlat && street && city && state && pincode) {
        addSavedAddress({
          fullName: name.trim(),
          mobileNumber: phone || '+91 98765 43210',
          email: currentUser?.email || '',
          houseFlat,
          street,
          area: street,
          city,
          district: city,
          state,
          pincode,
        });
      }

      showToast('Personal details saved successfully! Welcome to CraftVeda.', 'success');
      setActiveCustomerPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to save personal details:', err);
      setErrorMsg(err.message || 'Failed to save personal details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-cream py-12 px-4 flex items-center justify-center animate-fade-in">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-warm-hover border border-earth-100 overflow-hidden">
        {/* Banner Header */}
        <div className="bg-earth-900 text-cream p-8 text-center relative">
          <div className="w-16 h-16 rounded-3xl bg-terracotta-500 text-white flex items-center justify-center text-3xl mx-auto mb-3 shadow-warm">
            🏺
          </div>
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Account Verified
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">Complete Personal Details</h1>
          <p className="text-xs text-earth-300 mt-1 max-w-md mx-auto leading-relaxed">
            Please fill in your name and profile details to complete your CraftVeda account setup.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs flex items-center gap-2">
              <span className="font-bold">⚠️ Error:</span> {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-earth-800 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-cream-50/60 border border-earth-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 focus:bg-white outline-none font-medium"
              />
              <User className="w-4 h-4 text-earth-400 absolute left-4 top-3.5" />
            </div>
            <p className="text-[10px] text-earth-400 mt-1">This will be used for order invoices and deliveries.</p>
          </div>

          {/* Verified Email (Read-Only) */}
          <div>
            <label className="block text-xs font-bold text-earth-800 mb-1.5">
              Email Address <span className="text-emerald-600 text-[10px] font-semibold">(Verified & Read-Only)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={currentUser?.email || ''}
                readOnly
                className="w-full bg-cream-100/80 border border-earth-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-earth-600 font-semibold cursor-not-allowed outline-none select-none"
              />
              <Mail className="w-4 h-4 text-emerald-600 absolute left-4 top-3.5" />
            </div>
          </div>

          {/* Phone Number (Profile Only) */}
          <div>
            <label className="block text-xs font-bold text-earth-800 mb-1.5">
              Phone Number <span className="text-earth-400 font-normal">(Profile info only)</span>
            </label>
            <div className="flex gap-2">
              <span className="bg-earth-100 border border-earth-200 rounded-2xl px-4 py-3 text-xs font-bold text-earth-700 flex items-center shrink-0">
                +91
              </span>
              <div className="relative w-full">
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-cream-50/60 border border-earth-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 focus:bg-white outline-none font-medium"
                />
                <Phone className="w-4 h-4 text-earth-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
            <p className="text-[10px] text-earth-400 mt-1">Used strictly for delivery updates. Not used for login.</p>
          </div>

          {/* Default Shipping Address (Optional) */}
          <div className="pt-3 border-t border-earth-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-earth-900">
              <MapPin className="w-4 h-4 text-terracotta-500" />
              <span>Default Delivery Address (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="House / Flat / Door No"
                value={houseFlat}
                onChange={(e) => setHouseFlat(e.target.value)}
                className="bg-cream-50/50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 outline-none focus:ring-2 focus:ring-terracotta-400"
              />
              <input
                type="text"
                placeholder="Street / Colony / Landmark"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="bg-cream-50/50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 outline-none focus:ring-2 focus:ring-terracotta-400"
              />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-cream-50/50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 outline-none focus:ring-2 focus:ring-terracotta-400"
              />
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="bg-cream-50/50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>
            <input
              type="text"
              placeholder="Pincode (e.g. 302001)"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-cream-50/50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 outline-none focus:ring-2 focus:ring-terracotta-400"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-4 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 shadow-warm disabled:opacity-50"
            >
              {loading ? (
                <span>Saving Details...</span>
              ) : (
                <>
                  <span>Save & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
