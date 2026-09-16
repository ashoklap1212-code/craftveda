import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShippingAddress } from '../../types';
import { 
  QrCode, Smartphone, ShieldCheck, CheckCircle2, ArrowRight, X, Lock, RefreshCw
} from 'lucide-react';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shippingAddress: ShippingAddress;
  couponCode?: string;
  totalAmount: number;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen, onClose, shippingAddress, couponCode, totalAmount
}) => {
  const { createOrder } = useStore();
  const [upiId, setUpiId] = useState('');
  const [selectedApp, setSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'qr'>('qr');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate backend UPI verification delay
    setTimeout(() => {
      setIsProcessing(false);
      createOrder(shippingAddress, 'UPI', couponCode);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-warm-hover border border-earth-100 max-w-md w-full overflow-hidden relative">
        {/* Header */}
        <div className="bg-earth-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-terracotta-500 text-white flex items-center justify-center text-sm font-bold">
              ⚡
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-cream-50">CraftVeda UPI Gateway</h3>
              <p className="text-[10px] text-earth-300">Secure Instant Payment • Powered by Razorpay UPI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-earth-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-terracotta-50 p-4 border-b border-terracotta-100 flex items-center justify-between">
          <span className="text-xs text-earth-700 font-medium">Total Amount Payable:</span>
          <span className="font-serif font-extrabold text-xl text-terracotta-600">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-6 space-y-5">
          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedApp('qr')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                selectedApp === 'qr' 
                  ? 'bg-earth-900 text-white border-earth-900 shadow-sm' 
                  : 'bg-cream-50 border-earth-200 text-earth-700 hover:bg-cream-100'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Code</span>
            </button>

            <button
              onClick={() => setSelectedApp('gpay')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                selectedApp !== 'qr' 
                  ? 'bg-earth-900 text-white border-earth-900 shadow-sm' 
                  : 'bg-cream-50 border-earth-200 text-earth-700 hover:bg-cream-100'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>UPI Apps / ID</span>
            </button>
          </div>

          {/* QR Code Option */}
          {selectedApp === 'qr' ? (
            <div className="text-center py-2 space-y-3 bg-cream-50 p-4 rounded-2xl border border-earth-200">
              <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-earth-200">
                {/* SVG Mock QR Code */}
                <svg className="w-36 h-36 mx-auto text-earth-900" viewBox="0 0 100 100">
                  <path fill="currentColor" d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M20,40 h20 v10 h-20 z M50,30 h10 v30 h-10 z M70,40 h30 v10 h-30 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,70 h30 v10 h-30 z M80,70 h20 v30 h-20 z" />
                </svg>
              </div>
              <p className="text-xs text-earth-600 font-medium">
                Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
              </p>
              <span className="text-[10px] text-terracotta-600 font-bold bg-terracotta-50 px-2.5 py-1 rounded-full border border-terracotta-200">
                UPI ID: craftveda@okicici
              </span>
            </div>
          ) : (
            /* UPI ID or App Selector */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => setUpiId('customer@okgpay')}
                  className="p-2.5 rounded-xl border border-earth-200 hover:border-terracotta-500 bg-white font-bold text-earth-800"
                >
                  GPay
                </button>
                <button
                  type="button"
                  onClick={() => setUpiId('customer@ybl')}
                  className="p-2.5 rounded-xl border border-earth-200 hover:border-terracotta-500 bg-white font-bold text-earth-800"
                >
                  PhonePe
                </button>
                <button
                  type="button"
                  onClick={() => setUpiId('customer@paytm')}
                  className="p-2.5 rounded-xl border border-earth-200 hover:border-terracotta-500 bg-white font-bold text-earth-800"
                >
                  Paytm
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 mb-1">Enter your Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  placeholder="e.g. mobile@upi or username@okicici"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-cream-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Verification & Pay CTA */}
          <form onSubmit={handlePayNow} className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-warm transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying UPI Transaction...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Approve & Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-earth-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit SSL encrypted transaction. No payment info stored.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
