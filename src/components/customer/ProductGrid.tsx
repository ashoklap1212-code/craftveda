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

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (showWishlistOnly && !wishlist.includes(p.id)) return false;
      if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.categoryName.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchDesc) return false;
      }
      if (p.price < minPrice || p.price > maxPrice) return false;
      if (p.rating < minRating) return false;
      if (inStockOnly && (!p.inStock || p.stockQuantity < 1)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
    <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-8">
      {/* Top Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-earth-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">Handcraft Catalogue</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-earth-900 mt-0.5">
            Traditional Indian Collection
          </h1>
          <p className="text-xs text-earth-500 mt-0.5">{filteredProducts.length} handcrafted items</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 bg-cream-100 border border-earth-200 text-earth-800 px-3 py-2 rounded-full text-xs font-bold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-earth-200 rounded-full px-3 py-2 shadow-sm text-xs font-bold text-earth-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs max-w-[120px] sm:max-w-none"
            >
              <option value="popularity">Popularity</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(selectedCategoryFilter !== 'all' || searchQuery || minRating > 0 || inStockOnly || maxPrice < 3000) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-earth-500 hidden sm:inline">Active Filters:</span>
          {selectedCategoryFilter !== 'all' && (
            <span className="bg-terracotta-50 text-terracotta-700 border border-terracotta-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              {categories.find(c => c.id === selectedCategoryFilter)?.name}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategoryFilter('all')} />
            </span>
          )}
          {searchQuery && (
            <span className="bg-terracotta-50 text-terracotta-700 border border-terracotta-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              "{searchQuery.slice(0, 15)}{searchQuery.length > 15 ? '…' : ''}"
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}
          {minRating > 0 && (
            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              {minRating}+ ★
              <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating(0)} />
            </span>
          )}
          {inStockOnly && (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              In Stock
              <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
            </span>
          )}
          <button onClick={resetFilters} className="text-terracotta-600 font-bold hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-start">
        
        {/* Mobile Filter Drawer Backdrop */}
        {isMobileFilterOpen && (
          <div 
            onClick={() => setIsMobileFilterOpen(false)}
            className="md:hidden fixed inset-0 bg-earth-950/60 z-50 backdrop-blur-sm transition-opacity"
          />
        )}

        {/* Filter Sidebar (Desktop sidebar + Mobile slide-over drawer) */}
        <aside className={`
          bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-earth-200 shadow-sm
          md:col-span-3 md:block md:static md:z-auto md:w-auto md:max-h-none md:overflow-visible
          ${isMobileFilterOpen 
            ? 'fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] shadow-2xl overflow-y-auto animate-slide-right flex flex-col justify-between rounded-none rounded-l-3xl space-y-4' 
            : 'hidden space-y-5'
          }
        `}>
          <div className="flex items-center justify-between border-b border-earth-100 pb-3">
            <h3 className="font-serif font-bold text-sm text-earth-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-terracotta-500" /> Filter Catalogue
            </h3>
            <div className="flex items-center gap-3">
              <button onClick={resetFilters} className="text-[11px] font-bold text-terracotta-600 hover:underline">Reset</button>
              <button onClick={() => setIsMobileFilterOpen(false)} className="md:hidden text-earth-500 hover:text-earth-900 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-bold text-earth-800 block">Categories</label>
            <div className="space-y-1 text-xs text-earth-700 max-h-48 md:max-h-none overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all ${
                  selectedCategoryFilter === 'all' ? 'bg-terracotta-50 text-terracotta-700 font-bold' : 'hover:bg-cream-100'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter(p => {
                  if (!p.category) return false;
                  const pCat = p.category.toLowerCase().trim();
                  const cId = cat.id.toLowerCase().trim();
                  const cName = cat.name.toLowerCase().trim();
                  return pCat === cId || pCat === cName || pCat.replace(/[^a-z0-9]/g, '') === cId.replace(/[^a-z0-9]/g, '');
                }).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between ${
                      selectedCategoryFilter === cat.id ? 'bg-terracotta-50 text-terracotta-700 font-bold' : 'hover:bg-cream-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-earth-400 font-bold">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2 pt-3 border-t border-earth-100">
            <div className="flex justify-between text-xs font-bold text-earth-800">
              <span>Max Price</span>
              <span className="text-terracotta-600">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range" min="500" max="3000" step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-terracotta-500 cursor-pointer"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2 pt-3 border-t border-earth-100">
            <label className="text-xs font-bold text-earth-800 block">Minimum Rating</label>
            <div className="flex gap-1.5 flex-wrap">
              {[0, 4, 4.5].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(stars)}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    minRating === stars ? 'bg-amber-500 text-white border-amber-500' : 'bg-cream-50 border-earth-200 text-earth-700'
                  }`}
                >
                  {stars === 0 ? 'All' : `${stars}★+`}
                </button>
              ))}
            </div>
          </div>

          {/* Stock */}
          <div className="pt-3 border-t border-earth-100 flex items-center justify-between text-xs font-bold text-earth-800">
            <span>In Stock Only</span>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-terracotta-500 cursor-pointer"
            />
          </div>

          {/* Mobile close */}
          <div className="pt-2 md:hidden">
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3 rounded-xl text-xs shadow-warm transition-all"
            >
              Apply Filters ({filteredProducts.length} items)
            </button>
          </div>
        </aside>

        {/* Product Grid — 2-column on mobile */}
        <main className="md:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-earth-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-terracotta-50 text-terracotta-500 flex items-center justify-center mx-auto text-3xl">🏺</div>
              <h3 className="font-serif font-bold text-lg text-earth-900">No products match your criteria</h3>
              <p className="text-xs text-earth-500">Try adjusting your filters or search term.</p>
              <button onClick={resetFilters} className="bg-terracotta-500 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-warm">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
