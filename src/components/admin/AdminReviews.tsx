import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { AdminReview } from '../../types';
import {
  Star, Trash2, Eye, EyeOff, RefreshCw, Loader2, AlertCircle,
  CheckCircle2, MessageSquare, Search
} from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getAdminReviews();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews from MongoDB Atlas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleHide = async (id: string) => {
    if (!window.confirm('Hide this review? It will no longer be visible to customers.')) return;
    setActionLoading(id);
    try {
      await apiService.hideReview(id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isHidden: true } : r));
    } catch (err: any) {
      alert(err.message || 'Failed to hide review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnhide = async (id: string) => {
    setActionLoading(id);
    try {
      await apiService.unhideReview(id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isHidden: false } : r));
    } catch (err: any) {
      alert(err.message || 'Failed to restore review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this review? This action cannot be undone.')) return;
    setActionLoading(id);
    try {
      await apiService.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter and search
  const filteredReviews = reviews.filter(r => {
    const matchesSearch =
      !searchQuery ||
      r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'visible' && !r.isHidden) ||
      (filterStatus === 'hidden' && r.isHidden);

    return matchesSearch && matchesFilter;
  });

  const visibleCount = reviews.filter(r => !r.isHidden).length;
  const hiddenCount = reviews.filter(r => r.isHidden).length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-bold text-xl text-white">Customer Reviews</h2>
          <p className="text-xs text-earth-400 mt-0.5">
            Manage all product reviews from MongoDB Atlas
          </p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="flex items-center gap-2 bg-earth-800 hover:bg-earth-700 text-earth-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors border border-earth-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-earth-900 border border-earth-800 p-4 rounded-2xl space-y-1">
          <p className="text-[10px] text-earth-400 uppercase font-bold tracking-widest">Total Reviews</p>
          <p className="font-serif font-extrabold text-2xl text-white">{reviews.length}</p>
        </div>
        <div className="bg-earth-900 border border-earth-800 p-4 rounded-2xl space-y-1">
          <p className="text-[10px] text-earth-400 uppercase font-bold tracking-widest">Average Rating</p>
          <div className="flex items-center gap-1.5">
            <p className="font-serif font-extrabold text-2xl text-amber-400">{avgRating}</p>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        </div>
        <div className="bg-earth-900 border border-earth-800 p-4 rounded-2xl space-y-1">
          <p className="text-[10px] text-earth-400 uppercase font-bold tracking-widest">Visible</p>
          <p className="font-serif font-extrabold text-2xl text-emerald-400">{visibleCount}</p>
        </div>
        <div className="bg-earth-900 border border-earth-800 p-4 rounded-2xl space-y-1">
          <p className="text-[10px] text-earth-400 uppercase font-bold tracking-widest">Hidden</p>
          <p className="font-serif font-extrabold text-2xl text-amber-400">{hiddenCount}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-earth-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer, product, or comment..."
            className="w-full bg-earth-800 border border-earth-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-earth-500 focus:border-terracotta-500 focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'all' | 'visible' | 'hidden')}
          className="bg-earth-800 border border-earth-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-terracotta-500 focus:outline-none cursor-pointer"
        >
          <option value="all">All Reviews</option>
          <option value="visible">Visible Only</option>
          <option value="hidden">Hidden Only</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-800 text-rose-300 p-4 rounded-2xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchReviews} className="ml-auto underline font-bold">Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-earth-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Loading reviews from MongoDB Atlas...</span>
        </div>
      )}

      {/* Reviews Table */}
      {!loading && !error && (
        <div className="bg-earth-900 border border-earth-800 rounded-3xl overflow-hidden">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16 text-earth-500 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-bold text-earth-400">
                {reviews.length === 0 ? 'No reviews found in MongoDB Atlas yet.' : 'No reviews match your search.'}
              </p>
              <p className="text-xs">Customer reviews submitted on the storefront will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-earth-300">
                <thead className="bg-earth-800/60 text-earth-400 uppercase text-[10px] font-bold border-b border-earth-800">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Review</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-800">
                  {filteredReviews.map(review => (
                    <tr
                      key={review.id}
                      className={`hover:bg-earth-800/40 transition-colors ${review.isHidden ? 'opacity-50' : ''}`}
                    >
                      {/* Customer */}
                      <td className="p-4">
                        <p className="font-bold text-white">{review.customerName || review.userName}</p>
                        {review.customerEmail && (
                          <p className="text-earth-500 text-[10px] mt-0.5">{review.customerEmail}</p>
                        )}
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded mt-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </span>
                        )}
                      </td>

                      {/* Product */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {review.productImage && (
                            <img
                              src={review.productImage}
                              alt={review.productName}
                              className="w-8 h-8 rounded-lg object-cover bg-earth-800 shrink-0"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-earth-200 leading-tight max-w-[140px] truncate">
                              {review.productName}
                            </p>
                            <p className="text-earth-500 text-[10px] mt-0.5 font-mono">
                              {review.productId?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-earth-700'}`}
                            />
                          ))}
                          <span className="ml-1 font-bold text-white">{review.rating}</span>
                        </div>
                      </td>

                      {/* Review Comment */}
                      <td className="p-4 max-w-[200px]">
                        <p className="text-earth-300 leading-relaxed line-clamp-3 text-[11px]">
                          {review.comment}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-earth-400">{review.date}</span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {review.isHidden ? (
                          <span className="bg-amber-950/60 border border-amber-800 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Hidden
                          </span>
                        ) : (
                          <span className="bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Visible
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Hide / Unhide */}
                          {review.isHidden ? (
                            <button
                              onClick={() => handleUnhide(review.id)}
                              disabled={actionLoading === review.id}
                              title="Restore Review"
                              className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === review.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleHide(review.id)}
                              disabled={actionLoading === review.id}
                              title="Hide Review"
                              className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-400 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === review.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(review.id)}
                            disabled={actionLoading === review.id}
                            title="Delete Review"
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === review.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Footer Note */}
      {!loading && !error && reviews.length > 0 && (
        <p className="text-[11px] text-earth-500 text-center">
          Showing {filteredReviews.length} of {reviews.length} total reviews from MongoDB Atlas (craftdev.reviews)
        </p>
      )}
    </div>
  );
};
