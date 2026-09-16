import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Check, Sparkles } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { 
    quickViewProductId, setQuickViewProductId, 
    products, addToCart, toggleWishlist, isInWishlist,
    navigateToProductDetail 
  } = useStore();

  if (!quickViewProductId) return null;

  const product = products.find(p => p.id === quickViewProductId);
  if (!product) return null;

  const inWish = isInWishlist(product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-warm-hover border border-earth-100 max-w-3xl w-full overflow-hidden relative max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProductId(null)}
          className="absolute right-4 top-4 text-earth-500 hover:text-earth-800 bg-cream-100 p-2 rounded-full border border-earth-200 z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="md:w-1/2 bg-cream-100 p-6 flex items-center justify-center relative">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="max-h-80 w-auto object-contain rounded-2xl shadow-warm"
          />
          {product.discountPercentage > 0 && (
            <span className="absolute top-4 left-4 bg-terracotta-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Product Information */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta-600 bg-terracotta-50 px-2.5 py-1 rounded-md">
              {product.categoryName}
            </span>
            <h3 className="font-serif text-xl font-bold text-earth-900 mt-2 leading-tight">
              {product.name}
            </h3>
            <p className="text-xs text-earth-500 mt-1">{product.subtitle}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3 text-xs">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-earth-800 ml-1">{product.rating}</span>
              </div>
              <span className="text-earth-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-2xl font-serif font-extrabold text-terracotta-600">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-earth-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-earth-600 mt-3 leading-relaxed">
              {product.description}
            </p>

            {/* Specifications summary */}
            <div className="mt-4 pt-3 border-t border-earth-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-earth-400 block text-[10px]">Material</span>
                <span className="font-bold text-earth-800">{product.material}</span>
              </div>
              <div>
                <span className="text-earth-400 block text-[10px]">Dimensions</span>
                <span className="font-bold text-earth-800">{product.dimensions}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-earth-100">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  addToCart(product);
                  setQuickViewProductId(null);
                }}
                disabled={!product.inStock}
                className="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-warm transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  inWish 
                    ? 'bg-rose-50 border-rose-200 text-rose-600' 
                    : 'bg-white border-earth-200 text-earth-700 hover:bg-cream-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWish ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => {
                setQuickViewProductId(null);
                navigateToProductDetail(product.id);
              }}
              className="w-full text-center text-xs font-semibold text-terracotta-600 hover:underline py-1.5"
            >
              View Full Product Details & Specifications →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
