import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Star, Heart, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    addToCart, toggleWishlist, isInWishlist, 
    setQuickViewProductId, navigateToProductDetail 
  } = useStore();

  const inWish = isInWishlist(product.id);

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl border border-earth-200/80 overflow-hidden shadow-sm hover:shadow-warm-hover transition-all duration-500 flex flex-col justify-between relative">
      {/* Image Container */}
      <div 
        className="relative bg-cream-100 h-44 sm:h-64 md:h-72 overflow-hidden cursor-pointer"
        onClick={() => navigateToProductDetail(product.id)}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Top Floating Badges — compact on mobile */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.discountPercentage > 0 && (
            <span className="bg-terracotta-500 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
              BEST SELLER
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="bg-sage-700 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 w-8 h-8 sm:w-8 sm:h-8 rounded-full border transition-all z-10 shadow-md flex items-center justify-center ${
            inWish 
              ? 'bg-rose-500 border-rose-500 text-white' 
              : 'bg-white/90 backdrop-blur-sm border-earth-200 text-earth-600 hover:bg-white hover:text-rose-500'
          }`}
          title={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${inWish ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View — desktop hover only */}
        <div className="absolute inset-x-0 bottom-3 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProductId(product.id);
            }}
            className="w-full bg-white/95 backdrop-blur-md hover:bg-terracotta-500 text-earth-900 hover:text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-warm transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          {/* Category + Rating row */}
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-terracotta-600 font-extrabold uppercase tracking-wide bg-terracotta-50 px-1.5 py-0.5 rounded truncate max-w-[55%]">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="font-bold text-earth-900 text-[10px]">{product.rating}</span>
              <span className="text-earth-400 text-[9px] hidden sm:inline">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name — 2 lines max */}
          <h3 
            onClick={() => navigateToProductDetail(product.id)}
            className="font-serif font-bold text-sm sm:text-base text-earth-900 line-clamp-2 hover:text-terracotta-600 cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h3>
        </div>

        {/* Card Footer: Price & Add Button */}
        <div className="pt-2 border-t border-earth-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif font-extrabold text-sm sm:text-lg text-earth-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-earth-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold ${product.inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold min-w-[36px] min-h-[36px] p-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-warm transition-all disabled:opacity-40 shrink-0"
            title="Add to Cart"
            aria-label="Add to Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline font-bold">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
