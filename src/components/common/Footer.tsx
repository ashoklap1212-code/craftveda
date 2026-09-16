import React from 'react';
import { useStore, CustomerPage } from '../../context/StoreContext';
import { 
  Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, 
  Award, Heart, Share2, Globe, MessageCircle 
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveCustomerPage, setSelectedCategoryFilter } = useStore();

  const handleNav = (page: CustomerPage, cat?: string) => {
    setActiveCustomerPage(page);
    if (cat) setSelectedCategoryFilter(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-earth-900 text-cream-100 pt-16 pb-8 border-t-4 border-terracotta-500 mt-20">
      {/* Trust Highlights Bar */}
      <div className="container mx-auto px-4 pb-12 border-b border-earth-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-earth-800/60 border border-earth-700/50">
            <ShieldCheck className="w-8 h-8 text-terracotta-400 mb-2" />
            <h4 className="font-serif font-bold text-sm text-cream-50">100% Authentic Handcraft</h4>
            <p className="text-xs text-earth-300 mt-1">Sourced directly from rural Indian artisan cooperatives</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-earth-800/60 border border-earth-700/50">
            <Truck className="w-8 h-8 text-terracotta-400 mb-2" />
            <h4 className="font-serif font-bold text-sm text-cream-50">Safe Transit Packaging</h4>
            <p className="text-xs text-earth-300 mt-1">Triple-layer shock absorbent honeycomb cushioning</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-earth-800/60 border border-earth-700/50">
            <RefreshCw className="w-8 h-8 text-terracotta-400 mb-2" />
            <h4 className="font-serif font-bold text-sm text-cream-50">7-Day Easy Replacement</h4>
            <p className="text-xs text-earth-300 mt-1">Hassle-free replacement for any transit damage</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-earth-800/60 border border-earth-700/50">
            <Award className="w-8 h-8 text-terracotta-400 mb-2" />
            <h4 className="font-serif font-bold text-sm text-cream-50">Secure UPI & Cards</h4>
            <p className="text-xs text-earth-300 mt-1">Encrypted checkout via Razorpay & UPI Gateway</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-serif text-xl font-bold">
              🏺
            </div>
            <span className="font-serif text-2xl font-extrabold text-white">
              Craft<span className="text-terracotta-400">Veda</span>
            </span>
          </div>
          <p className="text-xs text-earth-300 leading-relaxed">
            CraftVeda brings timeless Indian heritage, hand-thrown pottery, traditional clay handis, and artisan home decor to modern homes around the globe.
          </p>
          <div className="pt-2 flex items-center gap-3 text-terracotta-400">
            <a href="#" className="p-2 bg-earth-800 rounded-full hover:bg-terracotta-500 hover:text-white transition-colors" title="Instagram">
              <Share2 className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-earth-800 rounded-full hover:bg-terracotta-500 hover:text-white transition-colors" title="Community">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-earth-800 rounded-full hover:bg-terracotta-500 hover:text-white transition-colors" title="WhatsApp Support">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">Explore Collections</h4>
          <ul className="space-y-2 text-xs text-earth-300">
            <li><button onClick={() => handleNav('shop', 'ceramic-pots')} className="hover:text-terracotta-400 transition-colors">Ceramic Pots & Planters</button></li>
            <li><button onClick={() => handleNav('shop', 'jadi')} className="hover:text-terracotta-400 transition-colors">Martaban Pickle Jars (Jadi)</button></li>
            <li><button onClick={() => handleNav('shop', 'handi')} className="hover:text-terracotta-400 transition-colors">Terracotta Dum Cooking Handi</button></li>
            <li><button onClick={() => handleNav('shop', 'clay-pots')} className="hover:text-terracotta-400 transition-colors">Alkaline Clay Matka Water Pots</button></li>
            <li><button onClick={() => handleNav('shop', 'traditional-decor')} className="hover:text-terracotta-400 transition-colors">Heritage Home & Wall Decor</button></li>
            <li><button onClick={() => handleNav('shop', 'kitchen-home')} className="hover:text-terracotta-400 transition-colors">Artisanal Chai Kulhads & Cups</button></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">Customer Support</h4>
          <ul className="space-y-2 text-xs text-earth-300">
            <li><button onClick={() => handleNav('track-order')} className="hover:text-terracotta-400 transition-colors">Track Order Status</button></li>
            <li><button onClick={() => handleNav('contact')} className="hover:text-terracotta-400 transition-colors">Shipping & Delivery Policy</button></li>
            <li><button onClick={() => handleNav('contact')} className="hover:text-terracotta-400 transition-colors">Returns & Damage Replacement</button></li>
            <li><button onClick={() => handleNav('about')} className="hover:text-terracotta-400 transition-colors">Artisan Sourcing & Care Guide</button></li>
            <li><button onClick={() => handleNav('contact')} className="hover:text-terracotta-400 transition-colors">Privacy Policy & Terms</button></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">Visit Experience Store</h4>
          <div className="space-y-2.5 text-xs text-earth-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
              <span>CraftVeda Heritage Studio, 42 Artisan Street, Sangeet Nagar, Jaipur, Rajasthan 302001</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-terracotta-400 shrink-0" />
              <span>+91 98765 43210 / 0141-284792</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-terracotta-400 shrink-0" />
              <span>support@craftveda.in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-earth-800 pt-6 text-center text-xs text-earth-400 container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 CraftVeda Handicrafts & Home Decor. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Heritage & Craft Artisans
        </p>
      </div>
    </footer>
  );
};
