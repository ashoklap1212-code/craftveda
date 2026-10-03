import React, { useState } from 'react';
import { useStore, CustomerPage } from '../../context/StoreContext';
import { 
  ShoppingBag, Heart, User, Search, Bell, Menu, X, 
  ChevronDown, LogOut, PackageCheck, LayoutDashboard, Store, CheckCircle, Trash2, CheckCheck,
  Home, Grid3X3
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    viewRole, setViewRole, 
    activeCustomerPage, setActiveCustomerPage, 
    cart, wishlist, notifications, currentUser,
    setIsCartDrawerOpen, setIsAuthModalOpen,
    searchQuery, setSearchQuery, setSelectedCategoryFilter,
    logoutUser, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification,
    navigateToWishlist, activeProfileTab
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleNavClick = (page: CustomerPage, category?: string) => {
    setActiveCustomerPage(page);
    if (category) {
      setSelectedCategoryFilter(category);
    }
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setIsNotificationsOpen(false);
    setIsProfileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveCustomerPage('shop');
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream-50/97 backdrop-blur-md border-b border-earth-100 shadow-sm">
        {/* Announcement Bar — hidden on very small screens to save space */}
        <div className="hidden xs:block bg-earth-800 text-cream-100 px-4 py-1 text-[11px] font-medium">
          <div className="container mx-auto flex items-center justify-center sm:justify-start gap-2">
            <span className="bg-terracotta-500 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider hidden sm:inline">
              Heritage Craft
            </span>
            <span className="hidden sm:inline text-cream-200">
              Authentic Traditional Pots, Handi &amp; Indian Home Decor Direct From Artisans
            </span>
            <span className="sm:hidden text-cream-200">Free shipping above ₹1,499 🚚</span>
          </div>
        </div>
        {/* Super-compact announcement for very small screens */}
        <div className="xs:hidden bg-earth-800 text-cream-200 px-3 py-1 text-[10px] text-center">
          Free shipping above ₹1,499 🚚
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          {/* Brand Logo — compact on mobile */}
          <div 
            onClick={() => handleNavClick('home')}
            className="cursor-pointer flex items-center gap-2 group shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-serif text-lg sm:text-2xl font-bold shadow-warm group-hover:bg-terracotta-600 transition-colors">
              🏺
            </div>
            <div>
              <span className="font-serif text-lg sm:text-2xl font-extrabold text-earth-800 tracking-tight block leading-none">
                Craft<span className="text-terracotta-500">Veda</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-earth-500 uppercase tracking-widest font-medium hidden sm:block mt-0.5">
                Traditional Indian Handicrafts
              </span>
            </div>
          </div>

          {/* Search Bar — Desktop only */}
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
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                setIsMobileMenuOpen(false);
              }}
              className="md:hidden p-2 rounded-full hover:bg-cream-200 text-earth-700 transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications — desktop + mobile */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileMenuOpen(false);
                }}
                className="p-2 rounded-full hover:bg-cream-200 text-earth-700 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-white shadow-sm">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-3xl shadow-warm-hover border border-earth-100 p-4 z-50 animate-fade-in max-h-[70vh] flex flex-col">
                  <div className="flex items-center justify-between border-b border-earth-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-terracotta-600" />
                      <h4 className="font-serif font-extrabold text-sm text-earth-900">Notifications</h4>
                      {unreadNotifCount > 0 && (
                        <span className="bg-terracotta-100 text-terracotta-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadNotifCount} unread
                        </span>
                      )}
                    </div>
                    {unreadNotifCount > 0 && (
                      <button 
                        onClick={markAllNotificationsAsRead} 
                        className="text-xs text-terracotta-600 hover:underline font-bold flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 space-y-2">
                        <div className="w-10 h-10 rounded-full bg-cream-100 text-earth-400 flex items-center justify-center mx-auto text-lg">🔔</div>
                        <p className="text-xs text-earth-500 font-medium">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id}
                          className={`p-3 rounded-2xl text-xs transition-all relative group ${
                            n.read ? 'bg-cream-50/80 border border-earth-100' : 'bg-terracotta-50/70 border border-terracotta-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-bold text-earth-900 leading-tight text-[11px]">{n.title}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {!n.read && (
                                <button onClick={() => markNotificationAsRead(n.id)} className="text-terracotta-600 p-0.5" title="Mark as read">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button onClick={() => deleteNotification(n.id)} className="text-earth-400 hover:text-rose-600 p-0.5" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-earth-600 leading-relaxed text-[10px] mb-1">{n.message}</p>
                          <span className="text-[9px] font-mono text-earth-400">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist — hidden on mobile (moved to bottom nav) */}
            <button
              onClick={navigateToWishlist}
              className="hidden sm:flex p-2 rounded-full hover:bg-cream-200 text-earth-700 transition-all relative group"
              title="View Wishlist"
            >
              <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500/20' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button — compact on mobile */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-1.5 bg-terracotta-500 hover:bg-terracotta-600 text-white px-2.5 sm:px-3.5 py-2 rounded-full transition-all shadow-sm hover:shadow-warm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Cart</span>
              <span className="bg-white/25 text-white text-[11px] px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                {cartCount}
              </span>
            </button>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-cream-200 border border-earth-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-terracotta-500 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                    {currentUser.profileImage ? (
                      <img src={currentUser.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : currentUser.name && currentUser.name.trim() ? (
                      currentUser.name.trim().charAt(0).toUpperCase()
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-earth-600 hidden sm:block" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-warm border border-earth-100 p-2 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-earth-100 mb-1">
                      <p className="font-bold text-sm text-earth-900 truncate">{currentUser.name || 'Craft Patron'}</p>
                      <p className="text-xs text-earth-500 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => { handleNavClick('profile'); setIsProfileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-earth-700 hover:bg-cream-100 rounded-lg flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-terracotta-500" /> My Account &amp; Profile
                    </button>
                    <button
                      onClick={() => { handleNavClick('track-order'); setIsProfileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-earth-700 hover:bg-cream-100 rounded-lg flex items-center gap-2"
                    >
                      <PackageCheck className="w-4 h-4 text-terracotta-500" /> Track Active Orders
                    </button>
                    <div className="border-t border-earth-100 mt-1 pt-1">
                      <button
                        onClick={() => { logoutUser(); setIsProfileMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 border border-earth-300 hover:border-terracotta-500 text-earth-800 hover:text-terracotta-600 px-2.5 sm:px-3.5 py-2 rounded-full text-xs font-semibold transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            {/* Mobile Hamburger — for secondary nav */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsMobileSearchOpen(false);
                setIsNotificationsOpen(false);
              }}
              className="md:hidden p-2 text-earth-800 hover:bg-cream-200 rounded-lg"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Bar Links — Desktop only */}
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
            <button onClick={() => handleNavClick('shop', 'ceramic-pots')} className="hover:text-terracotta-600 transition-colors">
              Ceramic Pots
            </button>
            <button onClick={() => handleNavClick('shop', 'jadi')} className="hover:text-terracotta-600 transition-colors">
              Jadi Jars
            </button>
            <button onClick={() => handleNavClick('shop', 'handi')} className="hover:text-terracotta-600 transition-colors">
              Clay Handi
            </button>
            <button onClick={() => handleNavClick('shop', 'traditional-decor')} className="hover:text-terracotta-600 transition-colors">
              Heritage Decor
            </button>
            <button 
              onClick={() => handleNavClick('about')}
              className={`hover:text-terracotta-600 transition-colors ${activeCustomerPage === 'about' ? 'text-terracotta-600 font-bold border-b-2 border-terracotta-500 pb-0.5' : ''}`}
            >
              Our Story &amp; Artisans
            </button>
            <button 
              onClick={() => handleNavClick('contact')}
              className={`hover:text-terracotta-600 transition-colors ${activeCustomerPage === 'contact' ? 'text-terracotta-600 font-bold border-b-2 border-terracotta-500 pb-0.5' : ''}`}
            >
              Contact &amp; Support
            </button>
          </div>
        </nav>

        {/* Mobile Expandable Search Bar */}
        {isMobileSearchOpen && (
          <div className="md:hidden border-t border-earth-100 bg-cream-50 px-3 py-3 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-white border border-earth-200 rounded-full py-2.5 pl-10 pr-10 text-sm text-earth-800 placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
              <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-earth-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        )}

        {/* Mobile Side Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-earth-100 bg-cream-50 shadow-xl animate-fade-in">
            <div className="px-4 py-3 space-y-0.5 text-sm font-semibold text-earth-800">
              <button onClick={() => handleNavClick('home')} className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-2.5 ${activeCustomerPage === 'home' ? 'bg-terracotta-50 text-terracotta-700' : 'hover:bg-cream-100'}`}>
                <Home className="w-4 h-4 text-terracotta-500" /> Home
              </button>
              <button onClick={() => handleNavClick('shop')} className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-2.5 ${activeCustomerPage === 'shop' ? 'bg-terracotta-50 text-terracotta-700' : 'hover:bg-cream-100'}`}>
                <Grid3X3 className="w-4 h-4 text-terracotta-500" /> Shop Collection
              </button>
              <button onClick={() => handleNavClick('shop', 'ceramic-pots')} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-cream-100 flex items-center gap-2.5 text-earth-700">
                <span className="text-sm">🏺</span> Ceramic Pots
              </button>
              <button onClick={() => handleNavClick('shop', 'jadi')} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-cream-100 flex items-center gap-2.5 text-earth-700">
                <span className="text-sm">🏛️</span> Jadi Pickling Jars
              </button>
              <button onClick={() => handleNavClick('shop', 'handi')} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-cream-100 flex items-center gap-2.5 text-earth-700">
                <span className="text-sm">🍲</span> Terracotta Handi
              </button>
              <button onClick={() => handleNavClick('about')} className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 ${activeCustomerPage === 'about' ? 'bg-terracotta-50 text-terracotta-700' : 'hover:bg-cream-100 text-earth-700'}`}>
                <span className="text-sm">🎨</span> Our Story
              </button>
              <button onClick={() => handleNavClick('track-order')} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-cream-100 flex items-center gap-2.5 text-terracotta-700 font-bold">
                <PackageCheck className="w-4 h-4" /> Track My Order
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          <button
            onClick={() => handleNavClick('home')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[52px] ${activeCustomerPage === 'home' ? 'text-terracotta-600' : 'text-earth-500'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Home</span>
          </button>
          <button
            onClick={() => handleNavClick('shop')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[52px] ${activeCustomerPage === 'shop' ? 'text-terracotta-600' : 'text-earth-500'}`}
          >
            <Grid3X3 className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Shop</span>
          </button>
          <button
            onClick={navigateToWishlist}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[52px] relative ${activeCustomerPage === 'profile' && activeProfileTab === 'wishlist' ? 'text-rose-500' : 'text-earth-500'}`}
          >
            <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-500' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
            <span className="text-[10px] font-semibold">Saved</span>
          </button>
          <button
            onClick={() => currentUser ? handleNavClick('profile') : setIsAuthModalOpen(true)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[52px] ${activeCustomerPage === 'profile' && activeProfileTab !== 'wishlist' ? 'text-terracotta-600' : 'text-earth-500'}`}
          >
            {currentUser?.profileImage ? (
              <img src={currentUser.profileImage} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
            <span className="text-[10px] font-semibold">{currentUser ? 'Account' : 'Login'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
