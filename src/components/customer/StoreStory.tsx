import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, HeartHandshake, ShieldCheck } from 'lucide-react';

export const StoreStory: React.FC = () => {
  const { setActiveCustomerPage } = useStore();

  return (
    <section className="py-20 bg-earthy-card border-b border-earth-100 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-warm border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1000&auto=format&fit=crop"
                alt="Artisan shaping traditional clay pot"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-earth-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="bg-terracotta-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-md">
                  Preserving Heritage
                </span>
                <h4 className="font-serif text-xl font-bold mt-1 text-cream-50">
                  Crafted by Rural Master Potters
                </h4>
                <p className="text-xs text-cream-200 mt-1">
                  Empowering over 500 traditional artisan families across Rajasthan, Uttar Pradesh & Bengal.
                </p>
              </div>
            </div>
          </div>

          {/* Text Story Column */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600 bg-terracotta-50 px-3 py-1 rounded-md">
              Our Craft Heritage
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-earth-900 leading-tight">
              Rooted in Indian Culture, Fired for Modern Homes
            </h2>

            <p className="text-xs sm:text-sm text-earth-600 leading-relaxed">
              CraftVeda was born out of a deep reverence for India's 5,000-year pottery lineage. From the famous blue glazed quartz of Jaipur to the slow-cooking unglazed terracotta handis of West Bengal, we curate products that bring natural wellness, soul, and timeless beauty back to your kitchen and living space.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-earth-200/80 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-earth-900">Direct Fair-Trade</h4>
                  <p className="text-xs text-earth-500 mt-0.5">Fair wages directly transferred to artisan bank accounts</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-earth-200/80 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-earth-900">Lead-Free & Food-Safe</h4>
                  <p className="text-xs text-earth-500 mt-0.5">Strictly tested non-toxic natural glazes & clays</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveCustomerPage('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-earth-800 hover:bg-earth-900 text-cream-50 font-bold px-6 py-3 rounded-full text-xs transition-colors"
            >
              Read Full Artisan Story →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
