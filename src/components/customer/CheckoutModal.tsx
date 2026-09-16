import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShippingAddress } from '../../types';
import { UpiPaymentModal } from './UpiPaymentModal';
import { 
  MapPin, ShoppingBag, CreditCard, ShieldCheck, ArrowLeft, ArrowRight, Check 
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const { 
    cart, cartSubtotal, cartDiscount, cartTotal, 
    currentUser, setActiveCustomerPage, showToast 
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  // Address Form State
  const [address, setAddress] = useState<ShippingAddress>(() => {
    if (currentUser && currentUser.savedAddresses.length > 0) {
      return currentUser.savedAddresses[0];
    }
    return {
      fullName: currentUser?.name || '',
      mobileNumber: currentUser?.phone || '',
      email: currentUser?.email || '',
      houseFlat: '',
      street: '',
      area: '',
      city: 'Jaipur',
      district: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      landmark: '',
    };
  });

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="font-serif font-bold text-2xl text-earth-900">Your Cart is Empty</h3>
        <p className="text-xs text-earth-500">Please add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => setActiveCustomerPage('shop')}
          className="bg-terracotta-500 text-white font-bold px-6 py-2.5 rounded-full text-xs"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const handleSelectSavedAddress = (saved: ShippingAddress) => {
    setAddress(saved);
    showToast('Saved address loaded!', 'info');
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.mobileNumber || !address.houseFlat || !address.street || !address.pincode) {
      showToast('Please fill all required address fields', 'error');
      return;
    }
    setStep(2);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header breadcrumb & step indicator */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-earth-200">
        <div>
          <button
            onClick={() => setActiveCustomerPage('home')}
            className="text-xs text-earth-500 hover:text-earth-800 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </button>
          <h1 className="font-serif text-3xl font-extrabold text-earth-900">Checkout & Order Placement</h1>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-terracotta-600' : 'text-earth-400'}`}>
            <span className="w-6 h-6 rounded-full bg-terracotta-100 text-terracotta-600 flex items-center justify-center text-xs">1</span>
            <span className="hidden sm:inline">Address</span>
          </div>
          <span className="text-earth-300">→</span>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-terracotta-600' : 'text-earth-400'}`}>
            <span className="w-6 h-6 rounded-full bg-terracotta-100 text-terracotta-600 flex items-center justify-center text-xs">2</span>
            <span className="hidden sm:inline">Order Summary</span>
          </div>
          <span className="text-earth-300">→</span>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-terracotta-600' : 'text-earth-400'}`}>
            <span className="w-6 h-6 rounded-full bg-terracotta-100 text-terracotta-600 flex items-center justify-center text-xs">3</span>
            <span className="hidden sm:inline">UPI Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Interactive Flow Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Address Details */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-earth-100 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-terracotta-500" />
                  <h3 className="font-serif font-bold text-lg text-earth-900">Step 1 — Shipping & Customer Details</h3>
                </div>
              </div>

              {/* Saved Addresses selector */}
              {currentUser && currentUser.savedAddresses.length > 0 && (
                <div className="bg-cream-50 p-4 rounded-2xl border border-earth-200 space-y-2">
                  <span className="text-xs font-bold text-earth-700 block">Use Saved Address:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentUser.savedAddresses.map((sa, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSavedAddress(sa)}
                        className="p-3 bg-white rounded-xl border border-earth-200 hover:border-terracotta-500 cursor-pointer text-xs space-y-1"
                      >
                        <p className="font-bold text-earth-900">{sa.fullName}</p>
                        <p className="text-earth-600 line-clamp-2">{sa.houseFlat}, {sa.street}, {sa.city} - {sa.pincode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="e.g. Aarav Patel"
                      className="w-full bg-cream-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={address.mobileNumber}
                      onChange={(e) => setAddress({ ...address, mobileNumber: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full bg-cream-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-cream-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">House / Flat / Door No. *</label>
                    <input
                      type="text"
                      required
                      value={address.houseFlat}
                      onChange={(e) => setAddress({ ...address, houseFlat: e.target.value })}
                      placeholder="Flat 402, Royal Palms"
                      className="w-full bg-cream-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">Street / Colony *</label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="MG Road, 4th Block"
                      className="w-full bg-cream-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full bg-cream-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full bg-cream-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      placeholder="6 digits"
                      className="w-full bg-cream-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={address.landmark}
                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                    placeholder="Near Forum Mall"
                    className="w-full bg-cream-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-warm transition-all"
                >
                  <span>Proceed to Order Summary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Order Summary & Payment Choice */}
          {step >= 2 && (
            <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-earth-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-terracotta-500" />
                  <h3 className="font-serif font-bold text-lg text-earth-900">Step 2 — Order Verification & Payment</h3>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-terracotta-600 hover:underline font-bold"
                >
                  Edit Address
                </button>
              </div>

              {/* Delivery Address Review */}
              <div className="bg-cream-50 p-4 rounded-2xl border border-earth-200 text-xs text-earth-800 space-y-1">
                <p className="font-bold text-earth-900">Deliver To: {address.fullName} ({address.mobileNumber})</p>
                <p className="text-earth-600">{address.houseFlat}, {address.street}, {address.city}, {address.state} - {address.pincode}</p>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-earth-700 uppercase tracking-wider">Cart Items ({cart.length})</h4>
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between gap-3 text-xs border-b border-earth-100 pb-3">
                    <div className="flex items-center gap-3">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover bg-cream-100" />
                      <div>
                        <p className="font-bold text-earth-900 line-clamp-1">{item.product.name}</p>
                        <p className="text-earth-500 text-[11px]">Qty: {item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <span className="font-bold text-earth-900 font-serif">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Pay Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setIsUpiModalOpen(true)}
                  className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-warm transition-all text-sm"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Pay ₹{cartTotal.toLocaleString('en-IN')} via UPI Gateway (Instant)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Order Summary Sticky Card */}
        <div className="lg:col-span-5">
          <div className="bg-earthy-card p-6 rounded-3xl border border-earth-200 shadow-sm sticky top-24 space-y-4">
            <h3 className="font-serif font-bold text-lg text-earth-900 border-b border-earth-200 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-earth-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-earth-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Safe Fragile Shipping</span>
                <span className="font-bold text-earth-900">
                  {cartSubtotal > 1499 ? <span className="text-emerald-600 font-bold">FREE</span> : '₹99'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-serif font-extrabold text-earth-900 pt-3 border-t border-earth-200">
                <span>Total Amount Payable</span>
                <span className="text-terracotta-600">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-earth-200 text-[11px] text-earth-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-earth-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>CraftVeda Protection Guarantee</span>
              </div>
              <p className="text-earth-500 leading-relaxed">
                If any pottery item suffers breakage during shipping, we provide instant 100% replacement within 7 days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive UPI Payment Modal */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        shippingAddress={address}
        totalAmount={cartTotal}
      />
    </div>
  );
};
