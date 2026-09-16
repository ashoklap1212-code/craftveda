import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/common/AuthModal';
import { QuickViewModal } from './components/common/QuickViewModal';
import { HeroSection } from './components/customer/HeroSection';
import { CategoryGrid } from './components/customer/CategoryGrid';
import { ProductCard } from './components/customer/ProductCard';
import { StoreStory } from './components/customer/StoreStory';
import { WhyChooseUs } from './components/customer/WhyChooseUs';
import { ProductGrid } from './components/customer/ProductGrid';
import { ProductDetailView } from './components/customer/ProductDetailView';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutView } from './components/customer/CheckoutModal';
import { OrderConfirmationView } from './components/customer/OrderConfirmationView';
import { OrderTrackingView } from './components/customer/OrderTrackingView';
import { UserProfileView } from './components/customer/UserProfileView';
import { AdminLayout } from './components/admin/AdminLayout';
import { ArrowRight, Phone, Mail, MapPin, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    viewRole, activeCustomerPage, setActiveCustomerPage, 
    products, setSelectedCategoryFilter 
  } = useStore();

  if (viewRole === 'admin') {
    return (
      <>
        <AdminLayout />
        <Toast />
      </>
    );
  }

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival || p.isFeatured).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-cream font-sans text-earth-800">
      <Navbar />

      <main className="flex-1">
        {/* HOME PAGE VIEW */}
        {activeCustomerPage === 'home' && (
          <div className="space-y-12">
            <HeroSection />
            <CategoryGrid />

            {/* Featured Products Section */}
            <section className="py-12 bg-cream">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">
                      Curated Selection
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-earth-900 mt-1">
                      Featured Traditional Crafts
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setActiveCustomerPage('shop');
                      setSelectedCategoryFilter('all');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="mt-2 md:mt-0 text-xs font-bold text-terracotta-600 hover:underline flex items-center gap-1"
                  >
                    <span>View All Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </section>

            {/* Cultural Spotlight Banner */}
            <section className="bg-earth-900 text-cream-100 py-16">
              <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <span className="bg-terracotta-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-md">
                    Heritage Spotlight
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
                    Unfired Clay & High-Density Stoneware Urns
                  </h2>
                  <p className="text-xs sm:text-sm text-earth-300 max-w-2xl leading-relaxed">
                    Used for generations across North and South India to keep food fresh, preserve home pickles, and maintain natural mineral water. Hand-turned on traditional potters wheels with pure river bed clay.
                  </p>
                </div>
                <div className="lg:col-span-4 flex justify-start lg:justify-end">
                  <button
                    onClick={() => {
                      setActiveCustomerPage('shop');
                      setSelectedCategoryFilter('clay-pots');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-8 py-3.5 rounded-full text-xs shadow-warm transition-all"
                  >
                    Explore Clay Collection →
                  </button>
                </div>
              </div>
            </section>

            {/* Best Sellers Section */}
            <section className="py-12 bg-cream">
              <div className="container mx-auto px-4">
                <div className="mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">
                    Customer Favorites
                  </span>
                  <h2 className="font-serif text-3xl font-extrabold text-earth-900 mt-1">
                    Best Selling Handicraft Products
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {bestSellers.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </section>

            <StoreStory />
            <WhyChooseUs />
          </div>
        )}

        {/* SHOP CATALOG PAGE */}
        {activeCustomerPage === 'shop' && <ProductGrid />}

        {/* PRODUCT DETAIL PAGE */}
        {activeCustomerPage === 'product-detail' && <ProductDetailView />}

        {/* CHECKOUT PAGE */}
        {activeCustomerPage === 'checkout' && <CheckoutView />}

        {/* ORDER CONFIRMATION PAGE */}
        {activeCustomerPage === 'order-confirmation' && <OrderConfirmationView />}

        {/* ORDER TRACKING PAGE */}
        {activeCustomerPage === 'track-order' && <OrderTrackingView />}

        {/* USER PROFILE PAGE */}
        {activeCustomerPage === 'profile' && <UserProfileView />}

        {/* OUR STORY PAGE */}
        {activeCustomerPage === 'about' && (
          <div className="container mx-auto px-4 py-12 space-y-12 max-w-4xl">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">
                Craftsmanship Lineage
              </span>
              <h1 className="font-serif text-4xl font-extrabold text-earth-900">
                The CraftVeda Story
              </h1>
              <p className="text-xs sm:text-sm text-earth-600 max-w-2xl mx-auto leading-relaxed">
                Empowering Indian artisan families and bringing authentic earthy pottery, glazed jars, and handis back into modern homes.
              </p>
            </div>
            <StoreStory />
            <WhyChooseUs />
          </div>
        )}

        {/* CONTACT PAGE */}
        {activeCustomerPage === 'contact' && (
          <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">
                We Are Here For You
              </span>
              <h1 className="font-serif text-4xl font-extrabold text-earth-900">
                Contact & Customer Support
              </h1>
              <p className="text-xs text-earth-600">Have a question about packaging, bulk ordering, or custom pottery?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-sm space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-terracotta-50 text-terracotta-500 flex items-center justify-center mx-auto">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-earth-900">Phone Support</h4>
                <p className="text-earth-600">+91 98765 43210</p>
                <p className="text-earth-400 text-[10px]">Mon - Sat: 9:00 AM - 7:00 PM</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-sm space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-terracotta-50 text-terracotta-500 flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-earth-900">Email Enquiries</h4>
                <p className="text-earth-600">support@craftveda.in</p>
                <p className="text-earth-400 text-[10px]">Replies within 2 hours</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-sm space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-terracotta-50 text-terracotta-500 flex items-center justify-center mx-auto">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-earth-900">Experience Store</h4>
                <p className="text-earth-600">42 Artisan Street, Sangeet Nagar, Jaipur, RJ 302001</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <AuthModal />
      <QuickViewModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
