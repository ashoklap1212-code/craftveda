import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Star, Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';

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
    <div className="group bg-white rounded-3xl border border-earth-200/80 overflow-hidden shadow-sm hover:shadow-warm-hover transition-all duration-500 flex flex-col justify-between relative">
      {/* Image Container */}
      <div 
        className="relative bg-cream-100 h-64 sm:h-72 overflow-hidden cursor-pointer"
        onClick={() => navigateToProductDetail(product.id)}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discountPercentage > 0 && (
            <span className="bg-terracotta-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
              BEST SELLER
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-sage-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
              NEW ARRIVAL
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full border transition-all z-10 shadow-md ${
            inWish 
              ? 'bg-rose-500 border-rose-500 text-white scale-110' 
              : 'bg-white/90 backdrop-blur-xs border-earth-200 text-earth-600 hover:bg-white hover:text-rose-500'
          }`}
          title={inWish ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`w-4 h-4 ${inWish ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Button Hover Layer */}
        <div className="absolute inset-x-0 bottom-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProductId(product.id);
            }}
            className="w-full bg-white/95 backdrop-blur-md hover:bg-terracotta-500 text-earth-900 hover:text-white font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-warm transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-terracotta-600 font-extrabold uppercase tracking-wider bg-terracotta-50 px-2 py-0.5 rounded">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold text-earth-900">{product.rating}</span>
              <span className="text-earth-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          <h3 
            onClick={() => navigateToProductDetail(product.id)}
            className="font-serif font-bold text-base text-earth-900 line-clamp-1 hover:text-terracotta-600 cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h3>
          <p className="text-xs text-earth-500 line-clamp-1 mt-0.5 font-normal">
            {product.subtitle}
          </p>
        </div>

        {/* Card Footer: Price & Add Button */}
        <div className="pt-3 border-t border-earth-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-extrabold text-lg text-earth-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-earth-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 block">
              {product.inStock ? `In Stock (${product.stockQuantity} left)` : 'Out of Stock'}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold p-2.5 sm:px-4 sm:py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow-warm transition-all disabled:opacity-40"
            title="Add to Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
