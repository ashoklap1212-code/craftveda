import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Review, ShippingAddress } from '../../types';
import { apiService } from '../../services/api';
import {
  Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw,
  CheckCircle2, ArrowLeft, Send, Loader2, AlertCircle, Share2,
  MapPin, ChevronRight, ChevronDown, ChevronUp, Tag, Clock,
  RotateCcw, Banknote, Sparkles, HelpCircle, Check, Plus, X
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProductId, products, addToCart, toggleWishlist, isInWishlist,
    setActiveCustomerPage, currentUser, setIsAuthModalOpen, showToast,
    selectedShippingAddress, setSelectedShippingAddress, addSavedAddress,
    buyNowDirect
  } = useStore();

  const product = products.find(p => p.id === selectedProductId) || products[0];
  const [selectedImage, setSelectedImage] = useState(product?.images[0] || '');
  const [quantity, setQuantity] = useState(1);

  // Address Selection Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newHouse, setNewHouse] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Jaipur');
  const [newState, setNewState] = useState('Rajasthan');
  const [newPincode, setNewPincode] = useState('302001');
  const [newPhone, setNewPhone] = useState(currentUser?.phone || '');
  const [newName, setNewName] = useState(currentUser?.name || '');

  // Active delivery address
  const currentDeliveryAddress = selectedShippingAddress || (currentUser?.savedAddresses?.length ? currentUser.savedAddresses[0] : null);
  const displayPincode = currentDeliveryAddress ? currentDeliveryAddress.pincode : '600062';

  // Reference UI state toggles & subtabs
  const [highlightsOpen, setHighlightsOpen] = useState(true);
  const [allDetailsOpen, setAllDetailsOpen] = useState(true);
  const [detailSubTab, setDetailSubTab] = useState<'specifications' | 'manufacturer'>('specifications');
  const [ratingsOpen, setRatingsOpen] = useState(true);
  const [faqOpen, setFaqOpen] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  // New review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Update selectedImage when product changes
  useEffect(() => {
    if (product?.images?.length) {
      setSelectedImage(product.images[0]);
    }
  }, [product?.id]);

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
      setReviewsError('Failed to load reviews.');
      console.error('❌ Failed to fetch reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [product?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (!product) return null;

  const inWish = isInWishlist(product.id);
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);


  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on CraftVeda`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

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

      await fetchReviews();
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowReviewForm(false);
      }, 3000);
    } catch (err: any) {
      const msg = err.message || 'Failed to submit review. Please try again.';
      setSubmitError(msg);
      if (!msg.toLowerCase().includes('already')) {
        showToast(msg, 'error');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Safe fallback values matching reference layout
  const packOfVal = product.packOf || '1';
  const capacityVal = product.capacity || '1000 ml';
  const brandVal = product.brand || 'VsCeramics';
  const modelNumberVal = product.modelNumber || product.name || 'New Elegant Ceramic Black Colour Cutting Jar 1000ML (Pack Of 1, Black)';
  const colorVal = product.color || 'Black';
  const shapeVal = product.shape || 'Round';
  const idealUsageVal = product.idealUsage || product.suitableUsage || 'Pickle Jar';
  const isAirtightVal = product.isAirtight || 'Yes';
  const isFragileVal = product.isFragile || 'Yes';
  const isDisposableVal = product.isDisposable || 'No';
  const materialVal = product.material || 'Ceramic';
  const sellerNameVal = product.sellerName || 'VsCeramics';
  const sellerRatingVal = product.sellerRating !== undefined ? product.sellerRating : 2.7;
  const sellerYearsVal = product.sellerYears || '2 years with CraftVeda';
  const manufacturerInfoVal = product.manufacturerInfo || 'Crafted with premium high-density ceramic clay by traditional artisans. Marketed and distributed by CraftVeda Handicrafts Pvt. Ltd.';
  const importantNoteVal = product.importantNote || 'Product information provided by the seller on the Website is not exhaustive, please read the label on the physical product carefully for complete information provided by the manufacturer. For additional information, please contact the manufacturer.';

  const discountPercent = product.discountPercentage > 0 
    ? product.discountPercentage 
    : (product.originalPrice > product.price 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
        : 83);

  const displayRating = averageRating > 0 ? averageRating.toFixed(1) : (product.rating ? product.rating.toFixed(1) : '3.8');
  const displayReviewCount = totalReviews > 0 ? totalReviews : (product.reviewCount || 4);

  const [showDesktopSticky, setShowDesktopSticky] = useState(false);

  // Monitor scroll position to display sleek floating desktop purchase bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowDesktopSticky(true);
      } else {
        setShowDesktopSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 max-w-6xl space-y-6">
      {/* Back to Shop breadcrumb */}
      <button
        onClick={() => {
          setActiveCustomerPage('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="text-xs text-earth-500 hover:text-earth-900 font-bold flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Shop Collection
      </button>

      {/* Desktop Floating Sticky Purchase Bar (Shown smoothly on scroll) */}
      <div 
        className={`hidden md:block fixed top-16 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-earth-200/80 shadow-sm transition-all duration-300 transform ${
          showDesktopSticky ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-6 py-3 max-w-6xl flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={selectedImage || product.images[0]} 
              alt={product.name} 
              className="w-11 h-11 rounded-lg object-contain border border-earth-200 bg-cream-50 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-serif font-bold text-sm text-earth-900 truncate">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-serif font-extrabold text-base text-earth-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className={`text-[10px] font-bold ${product.inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Quantity Selector */}
            <div className="flex items-center border border-earth-300 rounded-xl bg-white overflow-hidden shadow-2xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2.5 py-1.5 text-earth-700 hover:bg-cream-100 font-bold text-xs transition-colors"
                title="Decrease"
              >
                -
              </button>
              <span className="px-2.5 py-1.5 text-xs font-bold text-earth-900 min-w-[24px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity || 99, quantity + 1))}
                className="px-2.5 py-1.5 text-earth-700 hover:bg-cream-100 font-bold text-xs transition-colors"
                title="Increase"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(product, quantity)}
              disabled={!product.inStock}
              className="bg-cream-50 hover:bg-cream-100 text-earth-900 font-bold px-4 py-2.5 rounded-xl text-xs border border-earth-300 shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50 hover:border-earth-400"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Add to cart</span>
            </button>

            <button
              onClick={() => buyNowDirect(product, quantity)}
              disabled={!product.inStock}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-warm transition-all disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Reference Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Product Image Gallery */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="bg-[#f6f6f6] rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-sm relative overflow-hidden flex items-center justify-center min-h-[360px] sm:min-h-[460px]">
            {/* Top Right Floating Action Icons: Wishlist & Share */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 ${
                  inWish ? 'text-rose-500' : 'text-gray-600 hover:text-rose-500'
                }`}
                title={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-earth-900 transition-transform hover:scale-110"
                title="Share product"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* In-Image Tag badge (like "Capacity - 1000 mL" in reference image) */}
            {capacityVal && (
              <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-sm text-gray-800 text-xs sm:text-sm font-bold px-3 py-1 rounded-md shadow-sm border border-gray-200/60">
                Capacity - {capacityVal}
              </div>
            )}

            {/* Main Product Image */}
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="max-h-[340px] sm:max-h-[420px] w-auto object-contain rounded-xl drop-shadow-sm transition-all duration-300"
            />
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-cream-50 p-1 transition-all shrink-0 ${
                    (selectedImage || product.images[0]) === img ? 'border-terracotta-500 shadow-sm scale-105' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Reference Layout Details */}
        <div className="lg:col-span-7 space-y-5">
          {/* Selected Pack of Section */}
          <div>
            <div className="text-xs font-semibold text-gray-800 mb-2">
              Selected Pack of: <span className="font-bold text-gray-900">{packOfVal}</span>
            </div>
            <div className="inline-flex items-center justify-center min-w-[42px] px-3.5 py-2 bg-[#171717] text-white text-xs font-bold rounded-lg shadow-sm">
              {packOfVal}
            </div>
          </div>

          {/* Selected Capacity Section */}
          <div>
            <div className="text-xs font-semibold text-gray-800 mb-2">
              Selected Capacity: <span className="font-bold text-gray-900">{capacityVal}</span>
            </div>
            <div className="inline-flex items-center justify-center px-4 py-2 bg-[#171717] text-white text-xs font-bold rounded-lg shadow-sm">
              {capacityVal}
            </div>
          </div>

          {/* Product Title */}
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>
            {product.subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{product.subtitle}</p>
            )}

            {/* Rating Pill Badge: "3.8 ★ | 4" */}
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-[#f4f4f5] text-gray-800 text-xs font-bold px-2 py-0.5 rounded border border-gray-300">
                <span>{displayRating}</span>
                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600 inline" />
                <span className="text-gray-400 mx-0.5">|</span>
                <span className="text-gray-600">{displayReviewCount}</span>
              </span>
              <span className="text-xs text-gray-400">• Verified Craft Listing</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2.5">
              <span className="text-emerald-700 font-extrabold text-xl sm:text-2xl flex items-center">
                ↓{discountPercent}%
              </span>
              <span className="text-sm sm:text-base text-gray-400 line-through font-medium">
                ₹{product.originalPrice ? product.originalPrice.toLocaleString('en-IN') : (product.price * 2).toLocaleString('en-IN')}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Applied Offer Banner */}
            <div className="bg-[#eaf8ee] text-[#1e8338] px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border border-emerald-200/50">
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span>₹26 off applied for you with instant craft savings</span>
            </div>
          </div>

          {/* Delivery Details Card */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Delivery details</h3>
              {currentUser && (
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-xs font-bold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Select Delivery Address</span>
                </button>
              )}
            </div>

            {/* Selected Address Display or Pincode selector */}
            <div className="bg-[#fdfaf7] rounded-xl border border-earth-200/80 p-3.5 space-y-1 text-xs">
              {currentDeliveryAddress ? (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-earth-900">
                      <MapPin className="w-4 h-4 text-terracotta-500 shrink-0" />
                      <span>Deliver to: {currentDeliveryAddress.fullName}</span>
                      <span className="text-[10px] bg-terracotta-100 text-terracotta-700 font-extrabold px-1.5 py-0.2 rounded">
                        Selected
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-terracotta-600 font-bold text-xs hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-earth-700 text-xs mt-1 pl-5">
                    {currentDeliveryAddress.houseFlat}, {currentDeliveryAddress.street}, {currentDeliveryAddress.city}, {currentDeliveryAddress.state} - <strong className="text-earth-900 font-bold">{currentDeliveryAddress.pincode}</strong>
                  </p>
                  <p className="text-earth-500 text-[11px] pl-5">
                    Phone: {currentDeliveryAddress.mobileNumber}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-earth-800">
                    <MapPin className="w-4 h-4 text-terracotta-500" />
                    <span>Pincode: <strong>{displayPincode}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        setIsAuthModalOpen(true);
                        showToast('Please sign in to select or save delivery addresses', 'info');
                      } else {
                        setIsAddressModalOpen(true);
                      }
                    }}
                    className="font-bold text-terracotta-600 hover:underline flex items-center gap-0.5 text-xs"
                  >
                    <span>Select Delivery Address</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>


            {/* 3 Value Badges: Cancellation, 7-Day Return, Cash on Delivery */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50/70">
                <Clock className="w-4 h-4 text-terracotta-600 mb-1" />
                <span className="text-[10px] font-semibold text-gray-700 leading-tight">Cancellation upto 24hrs</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50/70">
                <RotateCcw className="w-4 h-4 text-terracotta-600 mb-1" />
                <span className="text-[10px] font-semibold text-gray-700 leading-tight">7-Day Return</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50/70">
                <Banknote className="w-4 h-4 text-terracotta-600 mb-1" />
                <span className="text-[10px] font-semibold text-gray-700 leading-tight">Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Inline Add to Cart & Buy Now CTA Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {/* Quantity Selector */}
            <div className="flex items-center border border-earth-300 rounded-xl bg-white overflow-hidden shadow-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2.5 text-earth-700 hover:bg-cream-100 font-bold text-xs transition-colors"
                title="Decrease quantity"
              >
                -
              </button>
              <span className="px-3 py-2.5 text-xs font-bold text-earth-900 min-w-[28px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity || 99, quantity + 1))}
                className="px-3 py-2.5 text-earth-700 hover:bg-cream-100 font-bold text-xs transition-colors"
                title="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(product, quantity)}
              disabled={!product.inStock}
              className="flex-1 bg-cream-50 hover:bg-cream-100 text-earth-900 font-bold py-3 px-4 rounded-xl text-xs border border-earth-300 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:border-earth-400"
            >
              <ShoppingBag className="w-4 h-4 text-terracotta-600" />
              <span>Add to cart</span>
            </button>

            <button
              onClick={() => buyNowDirect(product, quantity)}
              disabled={!product.inStock}
              className="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-warm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>Buy Now</span>
            </button>
          </div>

          {/* Accordion 1: Product Highlights (2-Column Grid as in Reference) */}
          <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setHighlightsOpen(!highlightsOpen)}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-gray-900 hover:bg-gray-50/50"
            >
              <span>Product highlights</span>
              {highlightsOpen ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
            </button>

            {highlightsOpen && (
              <div className="p-4 pt-0 border-t border-gray-100 text-xs">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 py-2">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Brand</span>
                    <span className="font-medium text-gray-900">{brandVal}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Model Number</span>
                    <span className="font-medium text-gray-900 break-words">{modelNumberVal}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Color</span>
                    <span className="font-medium text-gray-900">{colorVal}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Disposable</span>
                    <span className="font-medium text-gray-900">{isDisposableVal}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Shape</span>
                    <span className="font-medium text-gray-900">{shapeVal}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Capacity</span>
                    <span className="font-medium text-gray-900">{capacityVal}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Ideal Usage</span>
                    <span className="font-medium text-gray-900">{idealUsageVal}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Airtight</span>
                    <span className="font-medium text-gray-900">{isAirtightVal}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2: All details (Specifications & Manufacturer info Tabs) */}
          <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setAllDetailsOpen(!allDetailsOpen)}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-gray-900 hover:bg-gray-50/50"
            >
              <span>All details</span>
              {allDetailsOpen ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
            </button>

            {allDetailsOpen && (
              <div className="p-4 pt-1 border-t border-gray-100 text-xs space-y-4">
                {/* Reference Pill Buttons: [Specifications] [Manufacturer info] */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailSubTab('specifications')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      detailSubTab === 'specifications'
                        ? 'bg-[#171717] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Specifications
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailSubTab('manufacturer')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      detailSubTab === 'manufacturer'
                        ? 'bg-[#171717] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Manufacturer info
                  </button>
                </div>

                {detailSubTab === 'specifications' ? (
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs text-gray-900">General</h4>
                    <div className="space-y-3">
                      <div className="pb-2 border-b border-gray-100">
                        <span className="text-gray-500 block text-[11px]">Brand</span>
                        <span className="font-medium text-gray-900">{brandVal}</span>
                      </div>
                      <div className="pb-2 border-b border-gray-100">
                        <span className="text-gray-500 block text-[11px]">Model Number</span>
                        <span className="font-medium text-gray-900">{modelNumberVal}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pb-2 border-b border-gray-100">
                        <div>
                          <span className="text-gray-500 block text-[11px]">Color</span>
                          <span className="font-medium text-gray-900">{colorVal}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">Disposable</span>
                          <span className="font-medium text-gray-900">{isDisposableVal}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pb-2 border-b border-gray-100">
                        <div>
                          <span className="text-gray-500 block text-[11px]">Shape</span>
                          <span className="font-medium text-gray-900">{shapeVal}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">Capacity</span>
                          <span className="font-medium text-gray-900">{capacityVal}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pb-2 border-b border-gray-100">
                        <div>
                          <span className="text-gray-500 block text-[11px]">Ideal Usage</span>
                          <span className="font-medium text-gray-900">{idealUsageVal}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">Airtight</span>
                          <span className="font-medium text-gray-900">{isAirtightVal}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pb-2 border-b border-gray-100">
                        <div>
                          <span className="text-gray-500 block text-[11px]">Is Fragile</span>
                          <span className="font-medium text-gray-900">{isFragileVal}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">Material</span>
                          <span className="font-medium text-gray-900">{materialVal}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pb-2 border-b border-gray-100">
                        <div>
                          <span className="text-gray-500 block text-[11px]">Dimensions</span>
                          <span className="font-medium text-gray-900">{product.dimensions || 'Standard craft size'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">Weight</span>
                          <span className="font-medium text-gray-900">{product.weight || '1.5 kg'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-xs">
                    <h4 className="font-bold text-gray-900">Craft Heritage &amp; Manufacturer</h4>
                    <p className="text-gray-700 leading-relaxed">{manufacturerInfoVal}</p>
                    <div className="pt-2 text-[11px] text-gray-500">
                      Craft Origin: Jaipur / Khurja traditional pottery cluster
                    </div>
                  </div>
                )}

                {/* Important Note Disclaimer Box from Reference */}
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="font-bold text-xs text-gray-900 mb-1">Important Note</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    {importantNoteVal}
                  </p>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAllDetailsOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1 bg-white hover:bg-gray-50"
                  >
                    <span>See less</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: Ratings and reviews (Reference Badge & Quality tags) */}
          <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setRatingsOpen(!ratingsOpen)}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-gray-900 hover:bg-gray-50/50"
            >
              <span>Ratings and reviews</span>
              {ratingsOpen ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
            </button>

            {ratingsOpen && (
              <div className="p-4 pt-0 border-t border-gray-100 text-xs space-y-4">
                {/* Rating score + badge */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex items-center gap-1 text-base font-extrabold text-gray-900">
                    <span>{displayRating}</span>
                    <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">
                    Good
                  </span>
                  <span className="text-gray-500 text-xs">
                    based on {displayReviewCount} ratings by Verified Buyers
                  </span>
                </div>

                {/* Rating Aspect Pills (Quality, Design & Finish, Size, Air Tight, Value for Money, Leak Proof) */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#f0f9ff] text-[#0369a1] border border-blue-100 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
                    Quality <span className="font-bold">5 ★</span>
                  </span>
                  <span className="bg-[#f0f9ff] text-[#0369a1] border border-blue-100 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
                    Design &amp; Finish <span className="font-bold">5 ★</span>
                  </span>
                  <span className="bg-[#f0f9ff] text-[#0369a1] border border-blue-100 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
                    Size <span className="font-bold">5 ★</span>
                  </span>
                  <span className="bg-[#f0f9ff] text-[#0369a1] border border-blue-100 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
                    Air Tight <span className="font-bold">5 ★</span>
                  </span>
                  <span className="bg-[#f0f9ff] text-[#0369a1] border border-blue-100 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
                    Value for Money <span className="font-bold">5 ★</span>
                  </span>
                  <span className="bg-[#f0f9ff] text-[#0369a1] border border-blue-100 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
                    Leak Proof <span className="font-bold">5 ★</span>
                  </span>
                </div>

                {/* Customer Reviews List */}
                <div className="space-y-3 pt-2">
                  {reviewsLoading ? (
                    <div className="flex items-center justify-center py-6 text-gray-500 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading verified reviews...</span>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-xl p-4">
                      <p>Be the first to share your experience with this handcrafted piece!</p>
                    </div>
                  ) : (
                    reviews.map(rev => (
                      <div key={rev.id || rev._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 text-[10px]">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-gray-700 text-xs leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Write a Review Toggle */}
                <div className="pt-2">
                  {!showReviewForm ? (
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(true)}
                      className="text-xs font-bold text-terracotta-600 hover:text-terracotta-700 underline"
                    >
                      + Write a review for this product
                    </button>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="p-4 bg-cream-50 rounded-xl border border-earth-200 space-y-3">
                      <h4 className="font-bold text-xs text-gray-900">Your Review</h4>
                      {submitError && (
                        <p className="text-xs text-rose-600">{submitError}</p>
                      )}
                      {submitSuccess && (
                        <p className="text-xs text-emerald-600">Review published!</p>
                      )}
                      <div className="flex gap-1.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewRating(s)}
                            className="p-0.5"
                          >
                            <Star className={`w-5 h-5 ${s <= newRating ? 'fill-amber-400' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Write your honest review on quality, packaging, and design..."
                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 outline-none focus:border-terracotta-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitLoading}
                          className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
                        >
                          {submitLoading ? 'Submitting...' : 'Post Review'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Accordion 4: Questions and Answers (from Reference image) */}
          <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setFaqOpen(!faqOpen)}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-gray-900 hover:bg-gray-50/50"
            >
              <span>Questions and Answers</span>
              {faqOpen ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
            </button>

            {faqOpen && (
              <div className="p-4 pt-0 border-t border-gray-100 text-xs text-gray-500">
                <p className="py-2">No questions and answers available yet for this craft item. Have a question? Reach out to support@craftveda.com.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 sm:space-y-6 pt-8 border-t border-gray-200 pb-20 md:pb-0">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-earth-900">Similar Handicraft Products</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div className="mobile-sticky-purchase md:hidden bg-white/95 backdrop-blur-md border-t border-earth-200 shadow-warm px-3.5 py-2.5 fixed bottom-0 inset-x-0 z-40 animate-fade-in">
        <div className="flex items-center justify-between gap-2.5 max-w-lg mx-auto">
          {/* Product Thumbnail & Price */}
          <div className="flex items-center gap-2 min-w-0">
            <img 
              src={selectedImage || product.images[0]} 
              alt={product.name} 
              className="w-10 h-10 rounded-lg object-contain border border-earth-200 shrink-0 bg-cream-50"
            />
            <div className="min-w-0">
              <span className="font-serif font-extrabold text-sm text-earth-900 block leading-tight">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className={`text-[10px] font-bold truncate block ${product.inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Compact Quantity selector on mobile */}
          <div className="flex items-center border border-earth-300 rounded-lg bg-white overflow-hidden shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2 py-1 text-earth-700 hover:bg-cream-100 font-bold text-xs"
              title="Decrease"
            >
              -
            </button>
            <span className="px-2 py-1 text-xs font-bold text-earth-900 min-w-[18px] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stockQuantity || 99, quantity + 1))}
              className="px-2 py-1 text-earth-700 hover:bg-cream-100 font-bold text-xs"
              title="Increase"
            >
              +
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => addToCart(product, quantity)}
              disabled={!product.inStock}
              className="bg-cream-50 hover:bg-cream-100 text-earth-900 font-bold px-2.5 py-2 rounded-xl text-xs border border-earth-300 shadow-2xs transition-all disabled:opacity-50"
              title="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-terracotta-600" />
            </button>

            <button
              onClick={() => buyNowDirect(product, quantity)}
              disabled={!product.inStock}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-warm transition-all disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* SAVED DELIVERY ADDRESSES MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-earth-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-earth-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-earth-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-terracotta-500" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-earth-900">
                  Select Delivery Address
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setIsAddingNewAddress(false);
                }}
                className="text-earth-400 hover:text-earth-800 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Saved Addresses */}
            {currentUser?.savedAddresses && currentUser.savedAddresses.length > 0 && !isAddingNewAddress && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-earth-700 block">Saved Addresses ({currentUser.savedAddresses.length})</span>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {currentUser.savedAddresses.map((addr, idx) => {
                    const isSelected = currentDeliveryAddress && (
                      currentDeliveryAddress.houseFlat === addr.houseFlat &&
                      currentDeliveryAddress.street === addr.street &&
                      currentDeliveryAddress.pincode === addr.pincode
                    );

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedShippingAddress(addr);
                          showToast(`Delivering to ${addr.fullName} (${addr.pincode})`, 'info');
                          setIsAddressModalOpen(false);
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-xs relative ${
                          isSelected
                            ? 'bg-terracotta-50/60 border-terracotta-500 ring-2 ring-terracotta-500/20'
                            : 'bg-cream-50 hover:bg-white border-earth-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-earth-900">{addr.fullName}</span>
                          {isSelected && (
                            <span className="text-[10px] font-extrabold bg-terracotta-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>
                        <p className="text-earth-700 mt-1">
                          {addr.houseFlat}, {addr.street}, {addr.city}, {addr.state} - <strong className="text-earth-900">{addr.pincode}</strong>
                        </p>
                        <p className="text-earth-500 text-[11px] mt-0.5">Mobile: {addr.mobileNumber}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add New Address Toggle / Form */}
            {!isAddingNewAddress ? (
              <button
                type="button"
                onClick={() => setIsAddingNewAddress(true)}
                className="w-full py-3 px-4 border-2 border-dashed border-terracotta-400 hover:border-terracotta-600 rounded-2xl text-xs font-bold text-terracotta-600 hover:bg-terracotta-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add New Delivery Address
              </button>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newHouse || !newStreet || !newCity || !newPincode || !newPhone) {
                    showToast('Please fill all required address fields', 'error');
                    return;
                  }

                  const newAddrObj: ShippingAddress = {
                    fullName: newName || currentUser?.name || 'Customer',
                    mobileNumber: newPhone || currentUser?.phone || '',
                    email: currentUser?.email || '',
                    houseFlat: newHouse,
                    street: newStreet,
                    area: newStreet,
                    city: newCity,
                    district: newCity,
                    state: newState,
                    pincode: newPincode,
                  };

                  await addSavedAddress(newAddrObj);
                  setSelectedShippingAddress(newAddrObj);
                  showToast('New address saved and selected!', 'success');
                  setIsAddingNewAddress(false);
                  setIsAddressModalOpen(false);
                  setNewHouse(''); setNewStreet('');
                }}
                className="bg-cream-50 p-4 rounded-2xl border border-earth-200 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-earth-200 pb-2">
                  <h4 className="font-bold text-xs text-earth-900 uppercase">New Address Details</h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(false)}
                    className="text-earth-500 hover:text-earth-800 text-[11px] font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-earth-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="Receiver name"
                      className="w-full bg-white border border-earth-200 rounded-xl p-2 outline-none focus:border-terracotta-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-earth-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      placeholder="10-digit phone"
                      className="w-full bg-white border border-earth-200 rounded-xl p-2 outline-none focus:border-terracotta-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-earth-700 mb-1">House / Flat No. *</label>
                    <input
                      type="text"
                      required
                      value={newHouse}
                      onChange={e => setNewHouse(e.target.value)}
                      placeholder="Door no / apartment"
                      className="w-full bg-white border border-earth-200 rounded-xl p-2 outline-none focus:border-terracotta-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-earth-700 mb-1">Street / Colony *</label>
                    <input
                      type="text"
                      required
                      value={newStreet}
                      onChange={e => setNewStreet(e.target.value)}
                      placeholder="Street, locality"
                      className="w-full bg-white border border-earth-200 rounded-xl p-2 outline-none focus:border-terracotta-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-earth-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      className="w-full bg-white border border-earth-200 rounded-xl p-2 outline-none focus:border-terracotta-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-earth-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newState}
                      onChange={e => setNewState(e.target.value)}
                      className="w-full bg-white border border-earth-200 rounded-xl p-2 outline-none focus:border-terracotta-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-earth-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={newPincode}
                      onChange={e => setNewPincode(e.target.value)}
                      className="w-full bg-white border border-earth-200 rounded-xl p-2 outline-none focus:border-terracotta-500 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-warm transition-all"
                >
                  Save and Use This Address
                </button>
              </form>
            )}

            {/* Manage in profile link */}
            <div className="pt-2 border-t border-earth-100 flex items-center justify-between text-xs">
              <span className="text-earth-500">Need to view full address book?</span>
              <button
                type="button"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setActiveCustomerPage('profile');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-terracotta-600 font-bold hover:underline"
              >
                Manage Addresses in Profile →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


