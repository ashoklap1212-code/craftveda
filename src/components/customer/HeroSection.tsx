import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Sparkles, Award, CheckCircle2, Flame, Star } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActiveCustomerPage, setSelectedCategoryFilter } = useStore();

  const handleShopNow = () => {
    setActiveCustomerPage('shop');
    setSelectedCategoryFilter('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-mandala-pattern pt-6 pb-10 sm:pt-10 sm:pb-20 lg:pt-16 lg:pb-28 border-b border-earth-200/60">
      {/* Background Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-terracotta-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-center">

          {/* Left Content */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">

            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-terracotta-500/10 border border-terracotta-500/30 px-3 py-1 rounded-full text-xs font-bold text-terracotta-700">
              <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
              <span className="uppercase tracking-widest text-[10px]">Heritage Artisan Collection 2026</span>
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 animate-ping" />
            </div>

            {/* Main Headline — smaller on mobile */}
            <h1 className="font-serif text-3xl sm:text-5xl xl:text-6xl font-extrabold text-earth-900 leading-[1.12] tracking-tight">
              Timeless <span className="text-gradient-terracotta italic font-normal">Handicrafts</span>{' '}
              <span className="hidden sm:inline">Direct From Master Artisans</span>
              <span className="sm:hidden">From Master Artisans</span>
            </h1>

            {/* Subtitle */}
            <p className="text-earth-600 text-sm leading-relaxed font-normal">
              <span className="hidden sm:inline">
                Experience the soul of Indian pottery. Hand-thrown terracotta handis, blue pottery ceramic urns, authentic martaban pickling jars, and brass heritage decor—crafted with 100% natural earth clay.
              </span>
              <span className="sm:hidden">
                Hand-thrown terracotta handis, blue pottery urns &amp; authentic Indian home decor—crafted with 100% natural earth clay.
              </span>
            </p>

            {/* Action Buttons — side by side on mobile */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                onClick={handleShopNow}
                className="flex-1 sm:flex-none bg-terracotta-gradient hover:opacity-95 text-white font-bold px-5 sm:px-9 py-3 sm:py-4 rounded-2xl text-sm shadow-warm hover:shadow-warm-hover transition-all flex items-center justify-center gap-2 group glow-terracotta"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setActiveCustomerPage('shop');
                  setSelectedCategoryFilter('ceramic-pots');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 sm:flex-none bg-white/90 hover:bg-white border border-earth-200 text-earth-900 hover:text-terracotta-600 font-bold px-4 sm:px-8 py-3 sm:py-4 rounded-2xl text-sm transition-all shadow-sm hover:shadow-md text-center"
              >
                <span className="hidden sm:inline">Ceramic Pots &amp; Urns →</span>
                <span className="sm:hidden">Pots &amp; Urns</span>
              </button>
            </div>

            {/* Stats — hidden on mobile, visible sm+ */}
            <div className="hidden sm:grid pt-6 border-t border-earth-200/80 grid-cols-3 gap-4 text-center lg:text-left text-xs text-earth-800 max-w-xl mx-auto lg:mx-0">
              <div className="space-y-1">
                <div className="flex items-center justify-center lg:justify-start gap-1 font-serif font-extrabold text-xl text-terracotta-600">
                  <span>100%</span>
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-[11px] text-earth-500 font-medium block">Eco Kiln-Fired Clay</span>
              </div>
              <div className="space-y-1">
                <div className="font-serif font-extrabold text-xl text-terracotta-600">500+</div>
                <span className="text-[11px] text-earth-500 font-medium block">Artisan Craft Families</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center lg:justify-start gap-1 font-serif font-extrabold text-xl text-terracotta-600">
                  <span>4.9</span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <span className="text-[11px] text-earth-500 font-medium block">From 10,000+ Reviews</span>
              </div>
            </div>

            {/* Compact trust strip — mobile only */}
            <div className="sm:hidden flex items-center justify-center gap-5 pt-3 border-t border-earth-200/60 text-[11px] text-earth-600">
              <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-500" />100% Eco Clay</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />4.9★</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Food Safe</span>
            </div>
          </div>

          {/* Right Product Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-xs sm:max-w-md lg:max-w-none">
              <div className="absolute -inset-2 bg-gradient-to-r from-terracotta-400/20 to-amber-500/20 rounded-3xl blur-xl opacity-75" />
              <div className="rounded-3xl overflow-hidden shadow-warm-hover border-4 border-white bg-cream-100 relative group">
                <img
                  src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop"
                  alt="Traditional Indian Glazed Ceramic Pot"
                  className="w-full h-48 sm:h-[400px] lg:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-950/80 via-earth-950/20 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-white/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-earth-900 shadow-md flex items-center gap-1">
                  <Award className="w-3 sm:w-4 h-3 sm:h-4 text-terracotta-500" />
                  <span>GI Certified</span>
                </div>

                {/* Bottom Text */}
                <div className="absolute bottom-3 sm:bottom-6 left-4 right-4 text-white space-y-1">
                  <span className="bg-terracotta-500/90 text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                    Artisan Masterpiece
                  </span>
                  <h3 className="font-serif text-sm sm:text-2xl font-bold text-cream-50 leading-tight">
                    Royal Jaipuri Blue Pottery Urn
                  </h3>
                  <p className="text-[10px] sm:text-xs text-cream-200 font-normal hidden sm:block">
                    Hand-painted quartz earthenware with cobalt floral artwork
                  </p>
                </div>
              </div>

              {/* Floating badge — hidden on mobile */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-warm border border-earth-200/80 hidden sm:flex items-center gap-3 animate-float">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center text-xl shadow-inner">🏺</div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-earth-900 flex items-center gap-1">
                    <span>100% Lead-Free &amp; Food Safe</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </h4>
                  <p className="text-[11px] text-earth-500">Tested non-toxic mineral glazes</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
