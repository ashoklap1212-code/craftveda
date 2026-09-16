import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck, Truck, Sparkles, CheckCircle2 
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartDrawerOpen, setIsCartDrawerOpen, 
    cart, removeFromCart, updateCartQuantity, 
    cartSubtotal, cartDiscount, cartTotal,
    setActiveCustomerPage, currentUser, setIsAuthModalOpen,
    showToast
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'CRAFT10') {
      const disc = Math.round(cartSubtotal * 0.10);
      setAppliedDiscount(disc);
      setCouponMessage('10% Heritage Discount Applied! 🎉');
      showToast('Coupon CRAFT10 applied successfully!', 'success');
    } else {
      setAppliedDiscount(0);
      setCouponMessage('Invalid coupon. Try "CRAFT10"');
      showToast('Invalid coupon code', 'error');
    }
  };

  const finalCartTotal = Math.max(0, cartTotal - appliedDiscount);
  const freeShippingThreshold = 1499;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    
    setIsCartDrawerOpen(false);

    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Please log in or sign up to complete checkout', 'info');
    } else {
      setActiveCustomerPage('checkout');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Overlay Backdrop */}
      <div 
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-earth-950/70 backdrop-blur-xs transition-opacity"
      ></div>

      {/* Slide Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-cream-50 shadow-2xl border-l border-earth-200 flex flex-col justify-between animate-slide-right">
          
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white border-b border-earth-100 flex items-center justify-between sticky top-0 z-10 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-lg text-earth-900 leading-none">
                  Your Cart
                </h3>
                <span className="text-[11px] text-earth-500 font-medium">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} Items Selected
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-cream-200 text-earth-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cart.length > 0 && (
            <div className="bg-terracotta-50/70 border-b border-terracotta-100 px-5 py-3 text-xs">
              {amountNeededForFreeShipping > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-earth-800">
                    <span>Add ₹{amountNeededForFreeShipping.toLocaleString('en-IN')} more for FREE Express Shipping!</span>
                    <span className="text-terracotta-600 font-extrabold">{freeShippingPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-terracotta-500 rounded-full transition-all duration-500" 
                      style={{ width: `${freeShippingPercent}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Congratulations! You qualify for FREE Delivery 🎉</span>
                </div>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-20 h-20 rounded-full bg-terracotta-50 text-terracotta-500 flex items-center justify-center mx-auto text-4xl shadow-inner">
                  🏺
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-earth-900">Your cart is currently empty</h4>
                  <p className="text-xs text-earth-500 mt-1 max-w-xs mx-auto">
                    Explore handcrafted ceramic pots, traditional handi, and artisanal Indian home decor.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setActiveCustomerPage('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-terracotta-gradient text-white font-bold px-8 py-3.5 rounded-2xl text-xs shadow-warm hover:shadow-warm-hover transition-all"
                >
                  Explore Craft Directory
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.product.id}
                  className="bg-white p-4 rounded-3xl border border-earth-200/80 shadow-xs flex gap-3.5 items-center hover:shadow-sm transition-all"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-2xl bg-cream-100 border border-earth-100 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-xs text-earth-900 line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-earth-500 mt-0.5">
                      ₹{item.product.price.toLocaleString('en-IN')} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-earth-200 rounded-xl bg-cream-50 overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-earth-700 hover:bg-cream-200 transition-colors font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-0.5 text-xs font-bold text-earth-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-earth-700 hover:bg-cream-200 transition-colors font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-earth-400 hover:text-rose-500 p-1.5 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Total price for item */}
                  <div className="text-right shrink-0">
                    <span className="font-serif font-extrabold text-sm text-earth-900 block">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 bg-white border-t border-earth-200 space-y-4 shadow-xl">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-earth-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. CRAFT10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-cream-50 border border-earth-200 rounded-xl py-2.5 pl-9 pr-3 text-xs uppercase font-extrabold text-earth-900 placeholder-earth-400 focus:border-terracotta-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-earth-900 hover:bg-earth-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs"
                >
                  Apply
                </button>
              </form>
              {couponMessage && (
                <p className={`text-[11px] font-extrabold ${appliedDiscount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {couponMessage}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-earth-600 pt-2 border-t border-earth-100">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-earth-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping & Packaging</span>
                  <span className="font-bold text-earth-900">
                    {cartSubtotal > 1499 ? <span className="text-emerald-600 font-extrabold">FREE</span> : '₹99'}
                  </span>
                </div>
                
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Heritage Discount (CRAFT10)</span>
                    <span>-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-base font-serif font-extrabold text-earth-900 pt-2.5 border-t border-earth-200">
                  <span>Total Payable</span>
                  <span className="text-terracotta-600 text-lg">₹{finalCartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-terracotta-gradient hover:opacity-95 text-white font-bold py-4 rounded-2xl text-xs flex items-center justify-center gap-2.5 shadow-warm hover:shadow-warm-hover transition-all glow-terracotta"
              >
                <span>Proceed to Safe Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[10px] text-earth-400 text-center flex items-center justify-center gap-2 pt-0.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Damage Replacement & Secure UPI Payment</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
