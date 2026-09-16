import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { 
  User as UserIcon, PackageCheck, Heart, MapPin, Bell, LogOut, Edit3, Plus, Trash2, CheckCircle2, Shield 
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { 
    currentUser, updateUserProfile, addSavedAddress, orders, wishlist, products,
    notifications, markNotificationAsRead, markAllNotificationsAsRead,
    navigateToOrderTracking, logoutUser, setIsAuthModalOpen,
    activeProfileTab, setActiveProfileTab
  } = useStore();

  const activeTab = activeProfileTab;
  const setActiveTab = setActiveProfileTab;

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // Add Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newHouse, setNewHouse] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-cream-200 text-earth-700 flex items-center justify-center mx-auto text-2xl">
          👤
        </div>
        <h3 className="font-serif font-bold text-2xl text-earth-900">Please Sign In</h3>
        <p className="text-xs text-earth-500">Sign in to view your orders, saved addresses, wishlist & account settings.</p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-terracotta-500 text-white font-bold px-8 py-3 rounded-full text-xs shadow-warm"
        >
          Sign In / Register Now
        </button>
      </div>
    );
  }

  const userWishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone });
    setIsEditing(false);
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSavedAddress({
      fullName: currentUser.name,
      mobileNumber: currentUser.phone,
      email: currentUser.email,
      houseFlat: newHouse,
      street: newStreet,
      area: newStreet,
      city: newCity,
      district: newCity,
      state: newState,
      pincode: newPincode,
    });
    setIsAddingAddress(false);
    setNewHouse(''); setNewStreet(''); setNewCity(''); setNewState(''); setNewPincode('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8 animate-fade-in">
      {/* Profile Header Banner */}
      <div className="bg-earthy-card p-6 sm:p-8 rounded-3xl border border-earth-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-terracotta-500 text-white font-serif font-extrabold text-3xl flex items-center justify-center border-4 border-white shadow-warm shrink-0">
            {currentUser.name && currentUser.name.trim() ? currentUser.name.trim().charAt(0).toUpperCase() : <UserIcon className="w-10 h-10" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-terracotta-100 text-terracotta-700 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
                Verified Craft Patron
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {currentUser.authProvider === 'google' ? 'Google Authenticated' : 'Email OTP Verified'}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-extrabold text-earth-900 mt-1">{currentUser.name || 'Craft Patron'}</h1>
            <p className="text-xs text-earth-500">{currentUser.email}{currentUser.phone ? ` • ${currentUser.phone}` : ''}</p>
          </div>
        </div>

        <button
          onClick={logoutUser}
          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-earth-200 gap-4 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'profile' ? 'text-terracotta-600 border-b-2 border-terracotta-500' : 'text-earth-500 hover:text-earth-800'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Account Settings
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'orders' ? 'text-terracotta-600 border-b-2 border-terracotta-500' : 'text-earth-500 hover:text-earth-800'
          }`}
        >
          <PackageCheck className="w-4 h-4" /> Order History ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'addresses' ? 'text-terracotta-600 border-b-2 border-terracotta-500' : 'text-earth-500 hover:text-earth-800'
          }`}
        >
          <MapPin className="w-4 h-4" /> Saved Addresses ({currentUser.savedAddresses.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'wishlist' ? 'text-terracotta-600 border-b-2 border-terracotta-500' : 'text-earth-500 hover:text-earth-800'
          }`}
        >
          <Heart className="w-4 h-4" /> Wishlist ({userWishlistProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 whitespace-nowrap flex items-center gap-2 transition-all ${
            activeTab === 'notifications' ? 'text-terracotta-600 border-b-2 border-terracotta-500' : 'text-earth-500 hover:text-earth-800'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications ({notifications.length})
        </button>
      </div>

      {/* TAB 1: Profile Edit */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-earth-200 space-y-6 shadow-sm max-w-xl">
          <div className="flex items-center justify-between border-b border-earth-100 pb-3">
            <h3 className="font-serif font-bold text-lg text-earth-900">Personal Details</h3>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setName(currentUser.name || '');
                  setEmail(currentUser.email || '');
                  setPhone(currentUser.phone || '');
                  setIsEditing(true);
                }}
                className="text-xs font-bold text-terracotta-600 hover:underline flex items-center gap-1 bg-cream-100 px-3 py-1.5 rounded-xl border border-earth-200"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-earth-500 hover:text-earth-800 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-earth-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-cream-50 disabled:bg-cream-100/60 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-earth-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled={!isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-cream-50 disabled:bg-cream-100/60 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-earth-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                disabled={!isEditing}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-cream-50 disabled:bg-cream-100/60 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none font-medium"
              />
            </div>

            {isEditing && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-warm transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-earth-500 hover:text-earth-800"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* TAB 2: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-xs text-earth-500 text-center py-12">No orders placed yet.</p>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="bg-white p-6 rounded-3xl border border-earth-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-earth-100 pb-3 gap-2">
                  <div>
                    <span className="font-serif font-bold text-base text-earth-900">Order #{o.orderNumber}</span>
                    <span className="text-[11px] text-earth-400 block">{o.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-terracotta-50 text-terracotta-700 border border-terracotta-200 text-xs font-bold px-3 py-1 rounded-full">
                      {o.currentStatus}
                    </span>
                    <button
                      onClick={() => navigateToOrderTracking(o.id)}
                      className="bg-earth-800 hover:bg-earth-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Track Order
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {o.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={item.productImage} alt="" className="w-12 h-12 rounded-xl object-cover bg-cream-100" />
                        <div>
                          <p className="font-bold text-earth-900 line-clamp-1">{item.productName}</p>
                          <p className="text-earth-500 text-[11px]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-earth-900 font-serif">₹{item.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-earth-100 flex justify-between items-center text-xs">
                  <span className="text-earth-500">Paid via {o.payment.paymentMethod}</span>
                  <span className="font-serif font-extrabold text-base text-terracotta-600">Total: ₹{o.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg text-earth-900">Manage Saved Delivery Addresses</h3>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          {isAddingAddress && (
            <form onSubmit={handleAddAddressSubmit} className="bg-cream-100 p-6 rounded-3xl border border-earth-200 space-y-4">
              <h4 className="font-bold text-xs text-earth-900 uppercase">New Address Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Flat / Door No" required value={newHouse} onChange={e => setNewHouse(e.target.value)} className="bg-white p-2.5 rounded-xl border text-xs" />
                <input type="text" placeholder="Street / Colony" required value={newStreet} onChange={e => setNewStreet(e.target.value)} className="bg-white p-2.5 rounded-xl border text-xs" />
                <input type="text" placeholder="City" required value={newCity} onChange={e => setNewCity(e.target.value)} className="bg-white p-2.5 rounded-xl border text-xs" />
                <input type="text" placeholder="State" required value={newState} onChange={e => setNewState(e.target.value)} className="bg-white p-2.5 rounded-xl border text-xs" />
                <input type="text" placeholder="Pincode" required value={newPincode} onChange={e => setNewPincode(e.target.value)} className="bg-white p-2.5 rounded-xl border text-xs" />
              </div>
              <button type="submit" className="bg-earth-800 text-white font-bold px-6 py-2 rounded-xl text-xs">Save Address</button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentUser.savedAddresses.map((addr, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-earth-200 space-y-2 text-xs text-earth-800 shadow-sm relative">
                <span className="font-bold text-earth-900 block">{addr.fullName}</span>
                <p className="text-earth-600">{addr.houseFlat}, {addr.street}</p>
                <p className="text-earth-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-earth-500 text-[11px]">Phone: {addr.mobileNumber}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {userWishlistProducts.length === 0 ? (
            <p className="text-xs text-earth-500 text-center py-12">Your wishlist is empty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userWishlistProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-3xl border border-earth-200 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-earth-100 pb-3">
            <h3 className="font-serif font-bold text-lg text-earth-900">Notification Center</h3>
            <button onClick={markAllNotificationsAsRead} className="text-xs text-terracotta-600 hover:underline font-bold">
              Mark All Read
            </button>
          </div>
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} onClick={() => markNotificationAsRead(n.id)} className={`p-4 rounded-2xl border text-xs cursor-pointer ${n.isRead ? 'bg-cream-50 border-earth-100' : 'bg-terracotta-50/70 border-terracotta-200 font-medium'}`}>
                <div className="flex justify-between font-bold text-earth-900 mb-1">
                  <span>{n.title}</span>
                  <span className="text-[10px] text-earth-400">{n.timestamp}</span>
                </div>
                <p className="text-earth-600 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
