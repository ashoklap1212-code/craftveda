import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const { orders } = useStore();

  return (
    <div className="space-y-6 animate-fade-in text-earth-100">
      <div>
        <h2 className="font-serif text-2xl font-extrabold text-white">UPI Payment Transactions Log</h2>
        <p className="text-xs text-earth-400">View real-time UPI transaction reference numbers, amounts, and settlement statuses</p>
      </div>

      <div className="bg-earth-900 border border-earth-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-300">
            <thead className="bg-earth-800/80 text-earth-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 text-right">Gateway Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-800">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-earth-800/40">
                  <td className="p-3 font-mono text-white font-bold">{o.payment.transactionId}</td>
                  <td className="p-3 text-terracotta-400 font-bold">{o.orderNumber}</td>
                  <td className="p-3 text-earth-200">{o.customerName}</td>
                  <td className="p-3"><span className="bg-earth-800 border border-earth-700 px-2 py-0.5 rounded text-[10px] text-white font-bold">{o.payment.paymentMethod}</span></td>
                  <td className="p-3 font-serif font-bold text-white text-sm">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-earth-400">{o.payment.timestamp}</td>
                  <td className="p-3 text-right">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> SUCCESS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
