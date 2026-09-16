import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';
import { ShoppingCart, Search, Eye, CheckCircle2, Truck, PackageCheck, Clock, ShieldAlert } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const [search, setSearch] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    if (selectedStatusFilter !== 'all' && o.currentStatus !== selectedStatusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q);
    }
    return true;
  });

  const statuses: OrderStatus[] = [
    'Order Placed',
    'Payment Confirmed',
    'Order Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  const activeOrder = orders.find(o => o.id === selectedOrderDetails);

  return (
    <div className="space-y-6 animate-fade-in text-earth-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-extrabold text-white">Order Management & Fulfillment</h2>
          <p className="text-xs text-earth-400">Update order status (Packed/Shipped/Delivered) — directly syncs customer tracking timeline</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Order ID / Customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-earth-900 border border-earth-700 rounded-full px-4 py-2 pl-9 text-xs text-white placeholder-earth-400 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-earth-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="bg-earth-900 border border-earth-700 rounded-full px-3 py-2 text-xs text-white focus:outline-none font-bold"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-earth-900 border border-earth-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-300">
            <thead className="bg-earth-800/80 text-earth-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Current Status</th>
                <th className="p-3">Update Order Status (Live Sync)</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-800">
              {filteredOrders.map(o => (
                <tr key={o.id} className="hover:bg-earth-800/40">
                  <td className="p-3 font-bold text-white">{o.orderNumber}</td>
                  <td className="p-3 text-earth-400">{o.createdAt}</td>
                  <td className="p-3">
                    <p className="font-bold text-white">{o.customerName}</p>
                    <p className="text-[10px] text-earth-400">{o.customerPhone}</p>
                  </td>
                  <td className="p-3 font-serif font-bold text-terracotta-400">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <span className="bg-terracotta-950 text-terracotta-300 border border-terracotta-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {o.currentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    {/* Status Changer Select */}
                    <select
                      value={o.currentStatus}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="bg-earth-800 border border-earth-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold focus:ring-1 focus:ring-terracotta-500 cursor-pointer"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedOrderDetails(o.id)}
                      className="p-1.5 bg-earth-800 hover:bg-earth-700 text-earth-200 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-earth-900 border border-earth-700 rounded-3xl max-w-xl w-full p-6 space-y-4 text-xs text-earth-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-earth-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Order Details — #{activeOrder.orderNumber}</h3>
                <p className="text-[11px] text-earth-400">Placed on {activeOrder.createdAt}</p>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-earth-400 hover:text-white font-bold text-sm">
                ✕ Close
              </button>
            </div>

            <div className="bg-earth-800 p-4 rounded-2xl space-y-1">
              <span className="font-bold text-white block text-sm">Customer Shipping Address</span>
              <p>{activeOrder.shippingAddress.fullName} ({activeOrder.shippingAddress.mobileNumber})</p>
              <p>{activeOrder.shippingAddress.houseFlat}, {activeOrder.shippingAddress.street}, {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} - {activeOrder.shippingAddress.pincode}</p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white block">Order Items</span>
              {activeOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-earth-800 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <img src={item.productImage} alt="" className="w-9 h-9 rounded object-cover" />
                    <div>
                      <p className="font-bold text-white">{item.productName}</p>
                      <p className="text-[10px] text-earth-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-terracotta-400">₹{item.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-earth-800 pt-3 flex justify-between font-bold text-white text-sm">
              <span>Total Paid ({activeOrder.payment.paymentMethod}):</span>
              <span className="text-terracotta-400">₹{activeOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
