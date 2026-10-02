import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Review } from '../../types';
import { apiService } from '../../services/api';
import {
  Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw,
  CheckCircle2, ArrowLeft, Send, Loader2, AlertCircle
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProductId, products, addToCart, toggleWishlist, isInWishlist,
    setActiveCustomerPage, currentUser, setIsAuthModalOpen, showToast
  } = useStore();

  const product = products.find(p => p.id === selectedProductId) || products[0];
  const [selectedImage, setSelectedImage] = useState(product?.images[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'care' | 'reviews'>('specs');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  // New review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch reviews for the current product
  const fetchReviews = useCallback(async () => {
    if (!product?.id) return;
    setReviewsLoading(true);
    setReviewsError('');
    try {
      const data = await apiService.getProductReviews(product.id);
      setReviews(data.reviews || []);
      setTotalReviews(data.totalReviews ?? 0);
      setAverageRating(data.averageRating ?? 0);
    } catch (err: any) {
      setReviewsError('Failed to load reviews. Please try again.');
      console.error('❌ Failed to fetch reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [product?.id]);

  // Fetch reviews when the reviews tab is opened or product changes
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab, fetchReviews]);

  if (!product) return null;

  const inWish = isInWishlist(product.id);
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Please login to submit your review', 'info');
      return;
    }

    if (!newComment.trim() || newComment.trim().length < 3) {
      setSubmitError('Please write at least a few words in your review.');
      return;
    }

    if (newRating < 1 || newRating > 5) {
      setSubmitError('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setSubmitLoading(true);
      await apiService.submitReview({
        productId: product.id,
        rating: newRating,
        comment: newComment.trim(),
      });

      setNewComment('');
      setNewRating(5);
      setSubmitSuccess(true);
      showToast('Thank you! Your review has been published. 🙏', 'success');

      // Refresh reviews list so the new review appears immediately
      await fetchReviews();

      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err: any) {
      const msg = err.message || 'Failed to submit review. Please try again.';
      setSubmitError(msg);
      // Don't show toast for expected duplicate errors
      if (!msg.toLowerCase().includes('already')) {
        showToast(msg, 'error');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-12">
      {/* Back Button */}
      <button
        onClick={() => {
          setActiveCustomerPage('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="text-xs text-earth-500 hover:text-earth-800 font-bold flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Shop Collection
      </button>

      {/* Main Product Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-cream-100 rounded-3xl p-6 border border-earth-200 shadow-sm flex items-center justify-center relative overflow-hidden h-80 sm:h-96">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="max-h-full w-auto object-contain shadow-warm rounded-xl"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-terracotta-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-cream-100 p-1 transition-all ${
                    (selectedImage || product.images[0]) === img ? 'border-terracotta-500 shadow-sm' : 'border-earth-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Buying Details */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600 bg-terracotta-50 px-3 py-1 rounded-md">
              {product.categoryName}
            </span>
            <h1 className="font-serif text-3xl font-extrabold text-earth-900 mt-2 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-earth-500 mt-1">{product.subtitle}</p>

            {/* Rating Stars */}
            <div className="flex items-center gap-3 mt-3 text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-earth-300'}`} />
                ))}
                <span className="font-bold text-earth-900 ml-1.5">{product.rating}</span>
              </div>
              <span className="text-earth-400">({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="p-4 rounded-2xl bg-cream-100/70 border border-earth-200 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-serif font-extrabold text-3xl text-terracotta-600">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-earth-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-earth-500">Inclusive of all local craft taxes & GST</span>
            </div>

            <div className="text-right">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                product.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {product.inStock ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-earth-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-earth-700">Quantity:</label>
              <div className="flex items-center border border-earth-200 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-earth-700 hover:bg-cream-100 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-earth-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="px-3 py-1.5 text-earth-700 hover:bg-cream-100 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={!product.inStock}
                className="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-warm transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Cart</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-2xl border transition-colors ${
                  inWish ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-earth-200 text-earth-700 hover:bg-cream-100'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWish ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Micro Trust Icons */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-earth-200 text-[11px] text-earth-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-terracotta-500" />
              <span>100% Authentic</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-terracotta-500" />
              <span>Safe Packaging</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-terracotta-500" />
              <span>7-Day Replacement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Specs, Care Instructions, Reviews */}
      <div className="bg-white rounded-3xl border border-earth-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex border-b border-earth-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 transition-all ${
              activeTab === 'specs' ? 'text-terracotta-600 border-b-2 border-terracotta-500' : 'text-earth-500 hover:text-earth-800'
            }`}
          >
            Product Specifications
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-3 transition-all ${
              activeTab === 'care' ? 'text-terracotta-600 border-b-2 border-terracotta-500' : 'text-earth-500 hover:text-earth-800'
            }`}
          >
            Usage & Care Guide
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-all flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'text-terracotta-600 border-b-2 border-terracotta-500' : 'text-earth-500 hover:text-earth-800'
            }`}
          >
            Customer Reviews ({totalReviews || product.reviewCount})
          </button>
        </div>

        {/* TAB 1: Specs */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-earth-700">
            <div className="bg-cream-50 p-4 rounded-2xl border border-earth-100 flex justify-between">
              <span className="text-earth-500">Material Component</span>
              <span className="font-bold text-earth-900">{product.material}</span>
            </div>
            <div className="bg-cream-50 p-4 rounded-2xl border border-earth-100 flex justify-between">
              <span className="text-earth-500">Dimensions</span>
              <span className="font-bold text-earth-900">{product.dimensions}</span>
            </div>
            <div className="bg-cream-50 p-4 rounded-2xl border border-earth-100 flex justify-between">
              <span className="text-earth-500">Net Weight</span>
              <span className="font-bold text-earth-900">{product.weight}</span>
            </div>
            <div className="bg-cream-50 p-4 rounded-2xl border border-earth-100 flex justify-between">
              <span className="text-earth-500">Craft Technique</span>
              <span className="font-bold text-earth-900">{product.manufacturingType}</span>
            </div>
            <div className="bg-cream-50 p-4 rounded-2xl border border-earth-100 flex justify-between">
              <span className="text-earth-500">Color / Finish</span>
              <span className="font-bold text-earth-900">{product.color}</span>
            </div>
            <div className="bg-cream-50 p-4 rounded-2xl border border-earth-100 flex justify-between">
              <span className="text-earth-500">Packaging Type</span>
              <span className="font-bold text-earth-900">{product.packagingInfo}</span>
            </div>
          </div>
        )}

        {/* TAB 2: Care */}
        {activeTab === 'care' && (
          <div className="space-y-4 text-xs text-earth-700">
            <div className="bg-cream-50 p-4 rounded-2xl border border-earth-100">
              <h4 className="font-serif font-bold text-sm text-earth-900 mb-1">Suitable Usage</h4>
              <p className="leading-relaxed text-earth-600">{product.suitableUsage}</p>
            </div>
            <div className="bg-cream-50 p-4 rounded-2xl border border-earth-100">
              <h4 className="font-serif font-bold text-sm text-earth-900 mb-1">Care & Cleaning Instructions</h4>
              <p className="leading-relaxed text-earth-600">{product.careInstructions}</p>
            </div>
          </div>
        )}

        {/* TAB 3: Reviews & Review Form */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Rating Summary Bar */}
            {totalReviews > 0 && (
              <div className="flex items-center gap-4 p-4 bg-cream-50 rounded-2xl border border-earth-100">
                <div className="text-center">
                  <p className="font-serif font-extrabold text-4xl text-earth-900">{averageRating.toFixed(1)}</p>
                  <div className="flex text-amber-500 mt-1 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-amber-400' : 'text-earth-300'}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-earth-500 mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-10 text-earth-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Loading reviews...</span>
                </div>
              ) : reviewsError ? (
                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-xs">{reviewsError}</span>
                  <button
                    onClick={fetchReviews}
                    className="ml-auto text-xs font-bold underline"
                  >
                    Retry
                  </button>
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-earth-500 text-center py-6">
                  No reviews yet for this product. Be the first to write one!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id || rev._id} className="bg-cream-50 p-4 rounded-2xl border border-earth-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-earth-900">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-earth-400 text-[11px]">{rev.date}</span>
                    </div>

                    <div className="flex items-center text-amber-500 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-earth-300'}`} />
                      ))}
                    </div>

                    <p className="text-xs text-earth-700 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Submit Review Form */}
            <form onSubmit={handleReviewSubmit} className="bg-cream-100 p-6 rounded-2xl border border-earth-200 space-y-4">
              <h4 className="font-serif font-bold text-base text-earth-900">Write a Customer Review</h4>

              {submitSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Your review has been published successfully! Thank you. 🙏</span>
                </div>
              )}

              {submitError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-earth-700 mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-500"
                    >
                      <Star className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400' : 'text-earth-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 mb-1">Review Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share your feedback on product finish, packaging, and traditional craft feel..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-white border border-earth-200 rounded-xl p-3 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-warm transition-colors disabled:opacity-60"
              >
                {submitLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{submitLoading ? 'Submitting...' : 'Submit Review'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-serif text-2xl font-bold text-earth-900">You Might Also Love</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
