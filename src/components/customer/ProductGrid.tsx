import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { 
  Filter, Search, SlidersHorizontal, ArrowUpDown, X, RotateCcw 
} from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { 
    products, categories, selectedCategoryFilter, setSelectedCategoryFilter, 
    searchQuery, setSearchQuery, wishlist 
  } = useStore();

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(3500);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('popularity');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Wishlist Only Filter
      if (showWishlistOnly && !wishlist.includes(p.id)) {
        return false;
      }
      // Category Filter
      if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.categoryName.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchDesc) return false;
      }
      // Price
      if (p.price < minPrice || p.price > maxPrice) return false;
      // Rating
      if (p.rating < minRating) return false;
      // Stock
      if (inStockOnly && (!p.inStock || p.stockQuantity < 1)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      // default popularity
      return b.reviewCount - a.reviewCount;
    });
  }, [products, selectedCategoryFilter, searchQuery, minPrice, maxPrice, minRating, inStockOnly, showWishlistOnly, sortBy, wishlist]);

  const resetFilters = () => {
    setSelectedCategoryFilter('all');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(3500);
    setMinRating(0);
    setInStockOnly(false);
    setShowWishlistOnly(false);
    setSortBy('popularity');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Top Title & Search Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-earth-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">
            Handcraft Catalogue
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-earth-900 mt-0.5">
            Traditional Indian Collection
          </h1>
          <p className="text-xs text-earth-500 mt-1">
            Showing {filteredProducts.length} handcrafted items
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 bg-cream-100 border border-earth-200 text-earth-800 px-3.5 py-2 rounded-full text-xs font-bold"
          >
            <SlidersHorizontal className="w-4 h-4 text-terracotta-500" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-earth-200 rounded-full px-3.5 py-2 shadow-sm text-xs font-bold text-earth-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-terracotta-500" />
            <span className="hidden sm:inline text-earth-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="popularity">Popularity & Reviews</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(selectedCategoryFilter !== 'all' || searchQuery || minRating > 0 || inStockOnly || maxPrice < 3000) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-earth-500">Active Filters:</span>
          {selectedCategoryFilter !== 'all' && (
            <span className="bg-terracotta-50 text-terracotta-700 border border-terracotta-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              Category: {categories.find(c => c.id === selectedCategoryFilter)?.name}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategoryFilter('all')} />
            </span>
          )}
          {searchQuery && (
            <span className="bg-terracotta-50 text-terracotta-700 border border-terracotta-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              Search: "{searchQuery}"
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}
          {minRating > 0 && (
            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              {minRating}+ Stars
              <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating(0)} />
            </span>
          )}
          {inStockOnly && (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              In Stock Only
              <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-terracotta-600 font-bold hover:underline flex items-center gap-1 ml-2"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar - Desktop & Mobile */}
        <aside className={`md:col-span-3 space-y-6 bg-white p-5 rounded-3xl border border-earth-200 shadow-sm ${
          isMobileFilterOpen ? 'block' : 'hidden md:block'
        }`}>
          <div className="flex items-center justify-between border-b border-earth-100 pb-3">
            <h3 className="font-serif font-bold text-base text-earth-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-terracotta-500" /> Filter Catalog
            </h3>
            <button onClick={resetFilters} className="text-[11px] font-bold text-terracotta-600 hover:underline">
              Reset
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-earth-800 block">Categories</label>
            <div className="space-y-1.5 text-xs text-earth-700">
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all font-medium ${
                  selectedCategoryFilter === 'all' ? 'bg-terracotta-50 text-terracotta-700 font-bold' : 'hover:bg-cream-100'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between ${
                    selectedCategoryFilter === cat.id ? 'bg-terracotta-50 text-terracotta-700 font-bold' : 'hover:bg-cream-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-earth-400">({cat.itemCount})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Slider */}
          <div className="space-y-2 pt-3 border-t border-earth-100">
            <div className="flex justify-between text-xs font-bold text-earth-800">
              <span>Max Price</span>
              <span className="text-terracotta-600">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-terracotta-500 cursor-pointer"
            />
          </div>

          {/* Rating Filter */}
          <div className="space-y-2 pt-3 border-t border-earth-100">
            <label className="text-xs font-bold text-earth-800 block">Minimum Rating</label>
            <div className="flex gap-2">
              {[0, 4, 4.5].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(stars)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    minRating === stars ? 'bg-amber-500 text-white border-amber-500' : 'bg-cream-50 border-earth-200 text-earth-700'
                  }`}
                >
                  {stars === 0 ? 'All Ratings' : `${stars}★ & above`}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-3 border-t border-earth-100 flex items-center justify-between text-xs font-bold text-earth-800">
            <span>In Stock Only</span>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-terracotta-500 cursor-pointer"
            />
          </div>
        </aside>

        {/* Right Products Grid */}
        <main className="md:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-earth-200 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-terracotta-50 text-terracotta-500 flex items-center justify-center mx-auto text-3xl">
                🏺
              </div>
              <h3 className="font-serif font-bold text-xl text-earth-900">No products match your criteria</h3>
              <p className="text-xs text-earth-500">Try adjusting your category filter, price slider, or search term.</p>
              <button
                onClick={resetFilters}
                className="bg-terracotta-500 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-warm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
