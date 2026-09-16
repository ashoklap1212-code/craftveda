import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Warehouse, Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { products, updateProductStock } = useStore();

  const lowStockItems = products.filter(p => p.stockQuantity < 10);

  return (
    <div className="space-y-6 animate-fade-in text-earth-100">
      <div>
        <h2 className="font-serif text-2xl font-extrabold text-white">Inventory & Stock Control</h2>
        <p className="text-xs text-earth-400">Monitor stock levels, increase inventory, or flag out-of-stock traditional items</p>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-950/60 border border-amber-800 p-4 rounded-2xl flex items-center gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Attention Required:</span> {lowStockItems.length} products have low stock count (under 10 pcs). Restock soon to prevent customer stockout.
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-earth-900 border border-earth-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-300">
            <thead className="bg-earth-800/80 text-earth-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Status Badge</th>
                <th className="p-3 text-right">Adjust Stock Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-800">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-earth-800/40">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <img src={p.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover bg-earth-800" />
                    <span>{p.name}</span>
                  </td>
                  <td className="p-3 text-earth-400">{p.categoryName}</td>
                  <td className="p-3 font-serif font-extrabold text-white text-sm">
                    {p.stockQuantity} units
                  </td>
                  <td className="p-3">
                    {p.stockQuantity === 0 ? (
                      <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        Out of Stock
                      </span>
                    ) : p.stockQuantity < 10 ? (
                      <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        Low Stock ({p.stockQuantity})
                      </span>
                    ) : (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        Sufficient Stock
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => updateProductStock(p.id, p.stockQuantity - 5)}
                        className="px-2.5 py-1 bg-earth-800 hover:bg-earth-700 text-earth-200 rounded-lg text-xs font-bold"
                        title="Reduce 5 pcs"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => updateProductStock(p.id, Math.max(0, p.stockQuantity - 1))}
                        className="p-1 bg-earth-800 hover:bg-earth-700 text-earth-200 rounded-lg"
                        title="Reduce 1 pc"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-white">{p.stockQuantity}</span>
                      <button
                        onClick={() => updateProductStock(p.id, p.stockQuantity + 1)}
                        className="p-1 bg-earth-800 hover:bg-earth-700 text-earth-200 rounded-lg"
                        title="Add 1 pc"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateProductStock(p.id, p.stockQuantity + 5)}
                        className="px-2.5 py-1 bg-terracotta-600 hover:bg-terracotta-500 text-white rounded-lg text-xs font-bold"
                        title="Add 5 pcs"
                      >
                        +5
                      </button>
                    </div>
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
