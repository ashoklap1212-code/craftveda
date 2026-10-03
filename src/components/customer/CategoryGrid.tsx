import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { categories, products, setActiveCustomerPage, setSelectedCategoryFilter } = useStore();

  const handleCategoryClick = (catId: string) => {
    setSelectedCategoryFilter(catId);
    setActiveCustomerPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-8 sm:py-20 bg-cream-100/60 border-b border-earth-200/60 relative">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-row items-end justify-between mb-5 sm:mb-10 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-terracotta-500/10 text-terracotta-700 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 rounded-md border border-terracotta-500/20">
                Heritage Collections
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-3xl sm:text-4xl font-extrabold text-earth-900">
              Craft Categories
            </h2>
            <p className="text-xs sm:text-sm text-earth-600 mt-0.5 sm:mt-1 max-w-xl hidden sm:block">
              From hand-thrown clay water matkas to royal blue pottery urns and solid brass urlis.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCategoryFilter('all');
              setActiveCustomerPage('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs font-bold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 group shrink-0 pb-1"
          >
            <span>All Categories</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat) => {
            const count = products.filter(p => {
              if (!p.category) return false;
              const pCat = p.category.toLowerCase().trim();
              const cId = cat.id.toLowerCase().trim();
              const cName = cat.name.toLowerCase().trim();
              return pCat === cId || pCat === cName || pCat.replace(/[^a-z0-9]/g, '') === cId.replace(/[^a-z0-9]/g, '');
            }).length;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="group cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-earth-200/80 shadow-sm hover:shadow-warm-hover transition-all duration-500 flex flex-col relative"
              >
                <div className="h-40 sm:h-60 overflow-hidden relative bg-cream-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-earth-950/85 via-earth-950/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity"></div>
                  
                  {/* Top Item Count Badge */}
                  <span className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 bg-white/95 backdrop-blur-md text-earth-900 text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
                    {count} Crafts
                  </span>

                  {/* Content Banner at Bottom */}
                  <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 sm:left-4 right-2.5 sm:right-4 text-white space-y-0.5 sm:space-y-1">
                    <h3 className="font-serif text-sm sm:text-lg font-bold text-cream-50 group-hover:text-terracotta-300 transition-colors leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-cream-200 line-clamp-1 sm:line-clamp-2 leading-tight font-normal opacity-90 hidden xs:block">
                      {cat.description}
                    </p>
                    <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-terracotta-300 pt-0.5 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span> →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
