import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';
import { 
  PackageCheck, Search, CheckCircle2, Clock, Truck, MapPin, ShieldCheck, ChevronRight 
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { orders, selectedOrderId, setSelectedOrderId, setActiveCustomerPage } = useStore();
  const [searchInput, setSearchInput] = useState('');

  const activeOrder = orders.find(o => o.id === selectedOrderId || o.orderNumber === searchInput.trim()) || orders[0];

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(o => o.orderNumber.toLowerCase() === searchInput.trim().toLowerCase() || o.id === searchInput.trim());
    if (found) {
      setSelectedOrderId(found.id);
    } else {
      alert('No order found matching ID: ' + searchInput);
    }
  };

  const steps: OrderStatus[] = [
    'Order Placed',
    'Payment Confirmed',
    'Order Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  if (!activeOrder) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h3 className="font-serif font-bold text-2xl text-earth-900">No Orders to Track</h3>
        <p className="text-xs text-earth-500 mt-1">Place an order to see live visual tracking updates.</p>
      </div>
    );
  }

  const getStepIndex = (status: OrderStatus) => steps.indexOf(status);
  const currentStepIndex = getStepIndex(activeOrder.currentStatus);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 animate-fade-in">
      {/* Header & Order Lookup Form */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-earth-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">
            Real-Time Logistics
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-earth-900 mt-0.5">
            Order Status & Live Tracking
          </h1>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearchOrder} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Order ID (e.g. CV-2026-8921)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-white border border-earth-200 rounded-full px-4 py-2 text-xs font-medium text-earth-800 focus:ring-2 focus:ring-terracotta-500 outline-none w-64"
          />
          <button
            type="submit"
            className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-4 py-2 rounded-full text-xs flex items-center gap-1 shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track</span>
          </button>
        </form>
      </div>

      {/* Select active order if user has multiple */}
      {orders.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {orders.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedOrderId(o.id)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                o.id === activeOrder.id 
                  ? 'bg-earth-900 text-white border-earth-900 shadow-sm' 
                  : 'bg-white text-earth-700 border-earth-200 hover:bg-cream-100'
              }`}
            >
              Order #{o.orderNumber} ({o.currentStatus})
            </button>
          ))}
        </div>
      )}

      {/* Order Status Timeline Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-earth-200 shadow-warm space-y-8">
        {/* Order Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-cream-50 border border-earth-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-earth-400 block">Tracking Order ID</span>
            <span className="font-serif font-extrabold text-xl text-earth-900">{activeOrder.orderNumber}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-earth-400 block">Current Status</span>
            <span className="bg-terracotta-500 text-white text-xs font-extrabold px-3 py-1 rounded-full inline-block mt-0.5">
              {activeOrder.currentStatus}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-earth-400 block">Estimated Delivery</span>
            <span className="font-bold text-emerald-700 text-sm">{activeOrder.estimatedDeliveryDate}</span>
          </div>
        </div>

        {/* Dynamic 7-Step Visual Timeline */}
        <div className="py-4">
          <div className="hidden md:flex items-center justify-between relative">
            {/* Connecting Bar */}
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-earth-200 -translate-y-1/2 z-0">
              <div 
                className="h-full bg-terracotta-500 transition-all duration-700" 
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>

            {/* Step Nodes */}
            {steps.map((stepName, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={stepName} className="relative z-10 flex flex-col items-center group">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                    isCurrent
                      ? 'bg-terracotta-500 text-white ring-4 ring-terracotta-100 scale-110'
                      : isCompleted
                      ? 'bg-terracotta-600 text-white'
                      : 'bg-earth-100 text-earth-400 border border-earth-200'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 max-w-[80px] text-center leading-tight ${
                    isCompleted ? 'text-earth-900' : 'text-earth-400'
                  }`}>
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical Timeline */}
          <div className="md:hidden space-y-4">
            {steps.map((stepName, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const stepInfo = activeOrder.statusTimeline.find(s => s.status === stepName);

              return (
                <div key={stepName} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCompleted ? 'bg-terracotta-500 text-white' : 'bg-earth-100 text-earth-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isCompleted ? 'text-earth-900' : 'text-earth-400'}`}>
                      {stepName}
                    </span>
                    {stepInfo && stepInfo.timestamp && (
                      <span className="text-[10px] text-earth-400">{stepInfo.timestamp}</span>
                    )}
                    {stepInfo && stepInfo.notes && (
                      <p className="text-[11px] text-earth-600 mt-0.5">{stepInfo.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Timeline Activity Log */}
        <div className="border-t border-earth-100 pt-6 space-y-3">
          <h4 className="font-serif font-bold text-base text-earth-900">Logistics Event History</h4>
          <div className="space-y-2">
            {activeOrder.statusTimeline.filter(s => s.completed).map((step, idx) => (
              <div key={idx} className="bg-cream-50 p-3 rounded-xl border border-earth-100 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-earth-900 block">{step.status}</span>
                  <span className="text-earth-500 text-[11px]">{step.notes || 'Status confirmed'}</span>
                </div>
                <span className="text-[10px] font-medium text-earth-400">{step.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Address & Items Preview */}
        <div className="border-t border-earth-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <h4 className="font-serif font-bold text-sm text-earth-900 mb-2">Delivery Destination</h4>
            <div className="bg-cream-50 p-3.5 rounded-2xl border border-earth-100 text-earth-700 space-y-1">
              <p className="font-bold text-earth-900">{activeOrder.shippingAddress.fullName}</p>
              <p>{activeOrder.shippingAddress.houseFlat}, {activeOrder.shippingAddress.street}</p>
              <p>{activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} - {activeOrder.shippingAddress.pincode}</p>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm text-earth-900 mb-2">Package Contents ({activeOrder.items.length})</h4>
            <div className="space-y-2">
              {activeOrder.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-cream-50 p-2 rounded-xl border border-earth-100">
                  <img src={item.productImage} alt="" className="w-10 h-10 object-cover rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-earth-900 line-clamp-1">{item.productName}</p>
                    <p className="text-[10px] text-earth-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
