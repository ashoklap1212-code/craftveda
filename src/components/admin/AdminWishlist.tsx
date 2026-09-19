import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Heart, RefreshCw, AlertCircle, ShoppingBag, User as UserIcon, Mail, Calendar, Search } from 'lucide-react';

interface AdminWishlistItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productCount: number;
  productIds: string[];
  products: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    categoryName: string;
  }>;
  updatedAt: string;
}

export const AdminWishlist: React.FC = () => {
  const [wishlists, setWishlists] = useState<AdminWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWishlists = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getAdminWishlists();
      if (Array.isArray(data)) {
        setWishlists(data);
      }
    } catch (err: any) {
      console.error('❌ Failed to load admin wishlists:', err);
      setError(err.message || 'Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlists();
  }, []);

  const filteredWishlists = wishlists.filter(w => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      w.userName.toLowerCase().includes(q) ||
      w.userEmail.toLowerCase().includes(q) ||
      w.products.some(p => p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q))
    );
  });

  const totalSavedProducts = wishlists.reduce((sum, w) => sum + w.productCount, 0);

  return (
    <div className="space-y-6 animate-fade-in text-earth-100 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-earth-900 border border-earth-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
              <Heart className="w-5 h-5 fill-rose-500/30" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-white">Wishlist Management</h2>
          </div>
          <p className="text-xs text-earth-400 mt-1">
            Realtime customer wishlist analytics & saved handicraft items
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-earth-800 border border-earth-700 px-4 py-2 rounded-2xl text-xs flex items-center gap-2">
            <span className="text-earth-400">Total Saved Items:</span>
            <span className="font-bold text-terracotta-400 text-sm">{totalSavedProducts}</span>
          </div>

          <button
            onClick={fetchWishlists}
            disabled={loading}
            className="bg-earth-800 hover:bg-earth-700 text-earth-200 border border-earth-700 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by customer name, email, or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-earth-900 border border-earth-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-earth-500 focus:ring-2 focus:ring-terracotta-500 outline-none"
        />
        <Search className="w-4 h-4 text-earth-500 absolute left-3.5 top-3.5" />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-4 rounded-2xl text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-earth-900 border border-earth-800 p-6 rounded-3xl animate-pulse space-y-4">
              <div className="h-4 bg-earth-800 rounded w-1/4"></div>
              <div className="h-16 bg-earth-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredWishlists.length === 0 ? (
        /* Empty State */
        <div className="bg-earth-900 border border-earth-800 p-12 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 bg-earth-800 text-earth-400 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-white">No Wishlist Records Found</h3>
          <p className="text-xs text-earth-400 max-w-sm mx-auto">
            {searchTerm ? 'No wishlist items match your search term.' : 'Customers have not added any products to their wishlist yet.'}
          </p>
        </div>
      ) : (
        /* Wishlist Items List */
        <div className="space-y-4">
          {filteredWishlists.map((w) => (
            <div key={w.id} className="bg-earth-900 border border-earth-800 rounded-3xl p-6 space-y-4 hover:border-earth-700 transition-colors">
              {/* User Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-earth-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta-500/20 text-terracotta-400 font-bold flex items-center justify-center text-sm border border-terracotta-500/30">
                    {w.userName ? w.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{w.userName}</span>
                      <span className="text-[10px] bg-earth-800 text-earth-300 font-normal px-2 py-0.5 rounded-md">
                        {w.productCount} {w.productCount === 1 ? 'item' : 'items'}
                      </span>
                    </h4>
                    <span className="text-xs text-earth-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-earth-500" />
                      {w.userEmail}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-earth-400 flex items-center gap-1.5 self-end sm:self-center">
                  <Calendar className="w-3 h-3 text-earth-500" />
                  <span>Updated: {new Date(w.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Products Saved Grid */}
              {w.products && w.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {w.products.map((p) => (
                    <div key={p.id} className="bg-earth-950/60 border border-earth-800/80 p-3 rounded-2xl flex items-center gap-3">
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200&auto=format&fit=crop'}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl bg-earth-900 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase font-bold text-terracotta-400 block truncate">
                          {p.categoryName || 'Craft Item'}
                        </span>
                        <h5 className="text-xs font-bold text-white truncate" title={p.name}>
                          {p.name}
                        </h5>
                        <span className="text-xs font-extrabold text-earth-200 block mt-0.5">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-earth-500 italic">No products currently saved in wishlist.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
