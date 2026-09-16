import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  CheckCircle2, PackageCheck, MapPin, Truck, ArrowRight, ShoppingBag, Clock 
} from 'lucide-react';

export const OrderConfirmationView: React.FC = () => {
  const { currentCheckoutOrder, orders, selectedOrderId, setActiveCustomerPage, navigateToOrderTracking } = useStore();

  const order = currentCheckoutOrder || orders.find(o => o.id === selectedOrderId) || orders[0];

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h3 className="font-serif font-bold text-2xl text-earth-900">No recent order found</h3>
        <button 
          onClick={() => setActiveCustomerPage('home')} 
          className="mt-4 bg-terracotta-500 text-white font-bold px-6 py-2.5 rounded-full text-xs"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl animate-fade-in space-y-8">
      {/* Banner */}
      <div className="bg-white p-8 rounded-3xl border border-earth-200 shadow-warm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Payment Received via {order.payment.paymentMethod}
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-earth-900 mt-2">Order Confirmed!</h1>
          <p className="text-xs text-earth-500 mt-1">
            Thank you for shopping with CraftVeda. We have notified our artisan team to inspect and package your order.
          </p>
        </div>

        {/* Key Attributes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-earth-100 text-xs text-earth-700">
          <div className="bg-cream-50 p-3 rounded-xl">
            <span className="text-earth-400 block text-[10px]">Order ID</span>
            <span className="font-bold text-earth-900">{order.orderNumber}</span>
          </div>
          <div className="bg-cream-50 p-3 rounded-xl">
            <span className="text-earth-400 block text-[10px]">Order Date</span>
            <span className="font-bold text-earth-900">{order.createdAt}</span>
          </div>
          <div className="bg-cream-50 p-3 rounded-xl">
            <span className="text-earth-400 block text-[10px]">Total Paid</span>
            <span className="font-bold text-terracotta-600">₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-cream-50 p-3 rounded-xl">
            <span className="text-earth-400 block text-[10px]">Est. Delivery</span>
            <span className="font-bold text-emerald-700">{order.estimatedDeliveryDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
          <button
            onClick={() => navigateToOrderTracking(order.id)}
            className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-8 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-warm"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Track Order Timeline</span>
          </button>

          <button
            onClick={() => setActiveCustomerPage('shop')}
            className="bg-cream-100 hover:bg-cream-200 border border-earth-200 text-earth-800 font-bold px-8 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>

      {/* Order Details Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-earth-200 space-y-6">
        <h3 className="font-serif font-bold text-lg text-earth-900 border-b border-earth-100 pb-3">
          Order Items & Shipping Address
        </h3>

        {/* Shipping Address */}
        <div className="bg-cream-50 p-4 rounded-2xl border border-earth-100 text-xs text-earth-800 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-earth-900">
            <MapPin className="w-4 h-4 text-terracotta-500" />
            <span>Delivery Destination: {order.shippingAddress.fullName}</span>
          </div>
          <p className="text-earth-600">
            {order.shippingAddress.houseFlat}, {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
          <p className="text-earth-500 text-[11px]">Phone: {order.shippingAddress.mobileNumber}</p>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 text-xs border-b border-earth-100 pb-3">
              <div className="flex items-center gap-3">
                <img src={item.productImage} alt={item.productName} className="w-14 h-14 rounded-xl object-cover bg-cream-100" />
                <div>
                  <h4 className="font-bold text-earth-900">{item.productName}</h4>
                  <p className="text-earth-500 text-[11px]">Quantity: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <span className="font-serif font-bold text-sm text-earth-900">₹{item.totalPrice.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
