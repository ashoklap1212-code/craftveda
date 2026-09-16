import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Sparkles, ShieldCheck, Award, Heart, CheckCircle2, Flame, Star } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActiveCustomerPage, setSelectedCategoryFilter } = useStore();

  const handleShopNow = () => {
    setActiveCustomerPage('shop');
    setSelectedCategoryFilter('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-mandala-pattern pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-earth-200/60">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-terracotta-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-terracotta-500/10 border border-terracotta-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-terracotta-700 shadow-xs backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-terracotta-500 animate-spin-slow" />
              <span className="uppercase tracking-widest text-[11px]">Heritage Artisan Collection 2026</span>
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 animate-ping"></span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl xl:text-6xl font-extrabold text-earth-900 leading-[1.12] tracking-tight">
              Timeless <span className="text-gradient-terracotta italic font-normal">Handicrafts</span> Direct From Master Artisans
            </h1>

            {/* Subtitle */}
            <p className="text-earth-600 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Experience the soul of Indian pottery. Hand-thrown terracotta handis, blue pottery ceramic urns, authentic martaban pickling jars, and brass heritage decor—crafted with 100% natural earth clay.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <button
                onClick={handleShopNow}
                className="w-full sm:w-auto bg-terracotta-gradient hover:opacity-95 text-white font-bold px-9 py-4 rounded-2xl text-sm shadow-warm hover:shadow-warm-hover transition-all flex items-center justify-center gap-2.5 group glow-terracotta"
              >
                <span>Explore Full Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
              
              <button
                onClick={() => {
                  setActiveCustomerPage('shop');
                  setSelectedCategoryFilter('ceramic-pots');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-white/90 hover:bg-white border border-earth-200 text-earth-900 hover:text-terracotta-600 font-bold px-8 py-4 rounded-2xl text-sm transition-all shadow-sm hover:shadow-md text-center"
              >
                Ceramic Pots & Urns →
              </button>
            </div>

            {/* Micro Highlights Grid */}
            <div className="pt-8 border-t border-earth-200/80 grid grid-cols-3 gap-4 text-center lg:text-left text-xs text-earth-800 max-w-xl mx-auto lg:mx-0">
              <div className="space-y-1">
                <div className="flex items-center justify-center lg:justify-start gap-1 font-serif font-extrabold text-xl text-terracotta-600">
                  <span>100%</span>
                  <Flame className="w-4 h-4 text-amber-500 inline" />
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
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline" />
                </div>
                <span className="text-[11px] text-earth-500 font-medium block">From 10,000+ Reviews</span>
              </div>
            </div>

          </div>

          {/* Right Product Image Visual Stack */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Backing Glow Card */}
              <div className="absolute -inset-2 bg-gradient-to-r from-terracotta-400/20 to-amber-500/20 rounded-3xl blur-xl opacity-75"></div>

              {/* Main Featured Photo Frame */}
              <div className="rounded-3xl overflow-hidden shadow-warm-hover border-4 border-white bg-cream-100 relative group">
                <img
                  src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop"
                  alt="Traditional Indian Glazed Ceramic Pot"
                  className="w-full h-[400px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-earth-950/80 via-earth-950/20 to-transparent"></div>

                {/* Floating Top Badge */}
                <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-earth-900 shadow-md flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-terracotta-500" />
                  <span>GI Certified Heritage</span>
                </div>

                {/* Bottom Card Title Banner */}
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="bg-terracotta-500/90 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-md">
                    Artisan Masterpiece
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-cream-50 leading-tight">
                    Royal Jaipuri Blue Pottery Urn
                  </h3>
                  <p className="text-xs text-cream-200 font-normal">Hand-painted quartz earthenware with cobalt floral artwork</p>
                </div>
              </div>

              {/* Floating Live Craft Pill Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-warm border border-earth-200/80 flex items-center gap-3.5 hidden sm:flex animate-float">
                <div className="w-12 h-12 rounded-2xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center text-2xl shadow-inner">
                  🏺
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-earth-900 flex items-center gap-1">
                    <span>100% Lead-Free & Food Safe</span>
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
