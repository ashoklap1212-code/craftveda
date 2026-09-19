import React from 'react';
import { useStore, AdminTab } from '../../context/StoreContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminInventory } from './AdminInventory';
import { AdminOrders } from './AdminOrders';
import { AdminUsers } from './AdminUsers';
import { AdminPayments } from './AdminPayments';
import { AdminCategories } from './AdminCategories';
import { AdminWishlist } from './AdminWishlist';
import { 
  LayoutDashboard, Package, Warehouse, ShoppingCart, Users, CreditCard, 
  Layers, Store, Bell, Search, LogOut, Sparkles, ShieldAlert, Heart
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { 
    activeAdminTab, setActiveAdminTab, setViewRole, 
    products, orders, notifications 
  } = useStore();

  const lowStockCount = products.filter(p => p.stockQuantity < 10).length;
  const pendingOrdersCount = orders.filter(o => o.currentStatus !== 'Delivered' && o.currentStatus !== 'Cancelled').length;

  return (
    <div className="min-h-screen bg-earth-950 text-earth-100 flex flex-col md:flex-row font-sans">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-earth-900 border-r border-earth-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header Branding */}
          <div className="p-6 border-b border-earth-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-serif text-xl font-bold shadow-md">
                🏺
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-white tracking-tight block leading-none">
                  Craft<span className="text-terracotta-400">Veda</span>
                </span>
                <span className="text-[10px] text-terracotta-300 font-extrabold uppercase tracking-widest block mt-0.5">
                  Store Admin Console
                </span>
              </div>
            </div>
          </div>

          {/* Role Switch Back Banner */}
          <div className="p-3 bg-earth-800/80 border-b border-earth-800 flex items-center justify-between">
            <span className="text-[11px] text-earth-300">Testing Storefront?</span>
            <button
              onClick={() => setViewRole('customer')}
              className="bg-terracotta-600 hover:bg-terracotta-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveAdminTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                activeAdminTab === 'dashboard' ? 'bg-terracotta-500 text-white shadow-sm font-bold' : 'text-earth-300 hover:bg-earth-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </div>
            </button>

            <button
              onClick={() => setActiveAdminTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                activeAdminTab === 'orders' ? 'bg-terracotta-500 text-white shadow-sm font-bold' : 'text-earth-300 hover:bg-earth-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4" />
                <span>Order Management</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="bg-terracotta-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveAdminTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                activeAdminTab === 'products' ? 'bg-terracotta-500 text-white shadow-sm font-bold' : 'text-earth-300 hover:bg-earth-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Product Catalog</span>
              </div>
              <span className="text-[10px] text-earth-400 font-normal">({products.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('inventory')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                activeAdminTab === 'inventory' ? 'bg-terracotta-500 text-white shadow-sm font-bold' : 'text-earth-300 hover:bg-earth-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Warehouse className="w-4 h-4" />
                <span>Stock & Inventory</span>
              </div>
              {lowStockCount > 0 && (
                <span className="bg-amber-500 text-earth-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {lowStockCount} Low
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveAdminTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                activeAdminTab === 'users' ? 'bg-terracotta-500 text-white shadow-sm font-bold' : 'text-earth-300 hover:bg-earth-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </div>
            </button>

            <button
              onClick={() => setActiveAdminTab('payments')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                activeAdminTab === 'payments' ? 'bg-terracotta-500 text-white shadow-sm font-bold' : 'text-earth-300 hover:bg-earth-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4" />
                <span>UPI Payments Log</span>
              </div>
            </button>

            <button
              onClick={() => setActiveAdminTab('categories')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                activeAdminTab === 'categories' ? 'bg-terracotta-500 text-white shadow-sm font-bold' : 'text-earth-300 hover:bg-earth-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>Category Manager</span>
              </div>
            </button>

            <button
              onClick={() => setActiveAdminTab('wishlist')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                activeAdminTab === 'wishlist' ? 'bg-terracotta-500 text-white shadow-sm font-bold' : 'text-earth-300 hover:bg-earth-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4" />
                <span>Wishlist Analytics</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-earth-800 text-[11px] text-earth-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Realtime Sync Active</span>
          </div>
          <p className="mt-1 text-[10px] text-earth-500">Changes immediately sync with customer shop.</p>
        </div>
      </aside>

      {/* Main Admin Body Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-earth-900 border-b border-earth-800 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-lg text-white capitalize">
              Admin / {activeAdminTab}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-earth-800 border border-earth-700 text-earth-300 px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Admin: Store Manager</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <main className="p-6 space-y-6">
          {activeAdminTab === 'dashboard' && <AdminDashboard />}
          {activeAdminTab === 'products' && <AdminProducts />}
          {activeAdminTab === 'inventory' && <AdminInventory />}
          {activeAdminTab === 'orders' && <AdminOrders />}
          {activeAdminTab === 'users' && <AdminUsers />}
          {activeAdminTab === 'payments' && <AdminPayments />}
          {activeAdminTab === 'categories' && <AdminCategories />}
          {activeAdminTab === 'wishlist' && <AdminWishlist />}
        </main>
      </div>
    </div>
  );
};
