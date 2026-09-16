import React, { useState } from 'react';
import { useStore, CustomerPage } from '../../context/StoreContext';
import { 
  ShoppingBag, Heart, User, Search, Bell, Menu, X, 
  Sparkles, ShieldCheck, ChevronDown, LogOut, PackageCheck, LayoutDashboard, Store
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    viewRole, setViewRole, 
    activeCustomerPage, setActiveCustomerPage, 
    cart, wishlist, notifications, currentUser,
    setIsCartDrawerOpen, setIsAuthModalOpen,
    searchQuery, setSearchQuery, setSelectedCategoryFilter,
    logoutUser, markAllNotificationsAsRead,
    navigateToWishlist, setActiveProfileTab
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  const handleNavClick = (page: CustomerPage, category?: string) => {
    setActiveCustomerPage(page);
    if (category) {
      setSelectedCategoryFilter(category);
    }
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveCustomerPage('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-earth-100 shadow-sm">
      {/* Top Banner: Role Switcher & Announcement */}
      <div className="bg-earth-800 text-cream-100 px-4 py-1.5 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 container mx-auto">
          <span className="bg-terracotta-500 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
            Heritage Craft
          </span>
          <span className="hidden sm:inline text-cream-200">
            Authentic Traditional Pots, Handi & Indian Home Decor Direct From Artisans
          </span>
          <span className="sm:hidden text-cream-200">Free shipping on orders above ₹1,499</span>
        </div>

        {/* Global Demo Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewRole(viewRole === 'customer' ? 'admin' : 'customer')}
            className="flex items-center gap-1.5 bg-terracotta-600 hover:bg-terracotta-700 text-white px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-sm"
          >
            {viewRole === 'customer' ? (
              <>
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Switch to Admin Panel</span>
              </>
            ) : (
              <>
                <Store className="w-3.5 h-3.5" />
                <span>Switch to Customer Shop</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-warm group-hover:bg-terracotta-600 transition-colors">
            🏺
          </div>
          <div>
            <span className="font-serif text-2xl font-extrabold text-earth-800 tracking-tight block leading-none">
              Craft<span className="text-terracotta-500">Veda</span>
            </span>
            <span className="text-[10px] text-earth-500 uppercase tracking-widest font-medium block mt-0.5">
              Traditional Indian Handicrafts
            </span>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            placeholder="Search ceramic pots, handi, jadi, clay items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cream-100 border border-earth-200 rounded-full py-2 pl-10 pr-10 text-sm text-earth-800 placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-earth-400 hover:text-earth-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-full hover:bg-cream-200 text-earth-700 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-warm border border-earth-100 p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between border-b border-earth-100 pb-3 mb-3">
                  <h4 className="font-serif font-bold text-base text-earth-800">Notifications</h4>
                  {unreadNotifCount > 0 && (
                    <button 
                      onClick={markAllNotificationsAsRead} 
                      className="text-xs text-terracotta-600 hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-earth-400 text-center py-6">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => {
                          if (n.relatedOrderId) {
                            handleNavClick('track-order');
                          }
                          setIsNotificationsOpen(false);
                        }}
                        className={`p-3 rounded-xl text-xs cursor-pointer transition-colors ${
                          n.isRead ? 'bg-cream-50 hover:bg-cream-100' : 'bg-terracotta-50/60 border border-terracotta-100 hover:bg-terracotta-50'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-earth-800 mb-1">
                          <span>{n.title}</span>
                          <span className="text-[10px] font-normal text-earth-400">{n.timestamp}</span>
                        </div>
                        <p className="text-earth-600 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <button
            onClick={navigateToWishlist}
            className="p-2 rounded-full hover:bg-cream-200 text-earth-700 transition-all relative group"
            title="View Wishlist"
          >
            <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500/20' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white px-3.5 py-2 rounded-full transition-all shadow-sm hover:shadow-warm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Cart</span>
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {cartCount}
            </span>
          </button>

          {/* User Profile / Auth */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-cream-200 border border-earth-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-terracotta-500 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                  {currentUser.name && currentUser.name.trim() ? currentUser.name.trim().charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-earth-600 hidden sm:block pr-1" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-warm border border-earth-100 p-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-earth-100 mb-1">
                    <p className="font-bold text-sm text-earth-900">{currentUser.name || 'Craft Patron'}</p>
                    <p className="text-xs text-earth-500 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleNavClick('profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-earth-700 hover:bg-cream-100 rounded-lg flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-terracotta-500" />
                    My Account & Orders
                  </button>
                  <button
                    onClick={() => {
                      handleNavClick('track-order');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-earth-700 hover:bg-cream-100 rounded-lg flex items-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4 text-terracotta-500" />
                    Track Active Orders
                  </button>
                  <div className="border-t border-earth-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logoutUser();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 border border-earth-300 hover:border-terracotta-500 text-earth-800 hover:text-terracotta-600 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-earth-800 hover:bg-cream-200 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Bar Links - Desktop */}
      <nav className="hidden md:block border-t border-earth-100 bg-cream-100/60">
        <div className="container mx-auto px-4 flex items-center gap-8 text-xs font-semibold tracking-wide text-earth-700 py-2.5">
          <button 
            onClick={() => handleNavClick('home')}
            className={`hover:text-terracotta-600 transition-colors ${activeCustomerPage === 'home' ? 'text-terracotta-600 font-bold border-b-2 border-terracotta-500 pb-0.5' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => handleNavClick('shop')}
            className={`hover:text-terracotta-600 transition-colors ${activeCustomerPage === 'shop' ? 'text-terracotta-600 font-bold border-b-2 border-terracotta-500 pb-0.5' : ''}`}
          >
            Shop All Collections
          </button>
          <button 
            onClick={() => handleNavClick('shop', 'ceramic-pots')}
            className="hover:text-terracotta-600 transition-colors"
          >
            Ceramic Pots
          </button>
          <button 
            onClick={() => handleNavClick('shop', 'jadi')}
            className="hover:text-terracotta-600 transition-colors"
          >
            Jadi Jars
          </button>
          <button 
            onClick={() => handleNavClick('shop', 'handi')}
            className="hover:text-terracotta-600 transition-colors"
          >
            Clay Handi
          </button>
          <button 
            onClick={() => handleNavClick('shop', 'traditional-decor')}
            className="hover:text-terracotta-600 transition-colors"
          >
            Heritage Decor
          </button>
          <button 
            onClick={() => handleNavClick('about')}
            className={`hover:text-terracotta-600 transition-colors ${activeCustomerPage === 'about' ? 'text-terracotta-600 font-bold border-b-2 border-terracotta-500 pb-0.5' : ''}`}
          >
            Our Story & Artisans
          </button>
          <button 
            onClick={() => handleNavClick('contact')}
            className={`hover:text-terracotta-600 transition-colors ${activeCustomerPage === 'contact' ? 'text-terracotta-600 font-bold border-b-2 border-terracotta-500 pb-0.5' : ''}`}
          >
            Contact & Support
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-earth-100 bg-cream-50 p-4 space-y-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-earth-200 rounded-full py-2 pl-10 pr-4 text-xs"
            />
            <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-2.5" />
          </form>

          <div className="flex flex-col space-y-2 text-sm font-semibold text-earth-800">
            <button onClick={() => handleNavClick('home')} className="text-left py-2 border-b border-earth-100">Home</button>
            <button onClick={() => handleNavClick('shop')} className="text-left py-2 border-b border-earth-100">Shop Collection</button>
            <button onClick={() => handleNavClick('shop', 'ceramic-pots')} className="text-left py-2 border-b border-earth-100">Ceramic Pots</button>
            <button onClick={() => handleNavClick('shop', 'jadi')} className="text-left py-2 border-b border-earth-100">Jadi Pickling Jars</button>
            <button onClick={() => handleNavClick('shop', 'handi')} className="text-left py-2 border-b border-earth-100">Terracotta Handi</button>
            <button onClick={() => handleNavClick('about')} className="text-left py-2 border-b border-earth-100">Our Story</button>
            <button onClick={() => handleNavClick('track-order')} className="text-left py-2 border-b border-earth-100 text-terracotta-600 font-bold flex items-center gap-2">
              <PackageCheck className="w-4 h-4" /> Track My Order
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
