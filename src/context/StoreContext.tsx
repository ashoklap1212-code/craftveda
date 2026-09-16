import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, Category, Review, CartItem, Order, User, Notification, 
  OrderStatus, ShippingAddress 
} from '../types';
import { 
  INITIAL_CATEGORIES, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS 
} from '../data/initialData';

import { apiService, getAuthToken, setAuthToken } from '../services/api';

export type CustomerPage = 
  | 'home' 
  | 'shop' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'order-confirmation' 
  | 'track-order' 
  | 'profile' 
  | 'categories' 
  | 'about' 
  | 'contact';

export type AdminTab = 
  | 'dashboard' 
  | 'products' 
  | 'inventory' 
  | 'orders' 
  | 'users' 
  | 'payments' 
  | 'categories';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ProfileTab = 'profile' | 'orders' | 'addresses' | 'wishlist' | 'notifications';

interface StoreContextType {
  // Navigation & Role
  viewRole: 'customer' | 'admin';
  setViewRole: (role: 'customer' | 'admin') => void;
  activeCustomerPage: CustomerPage;
  setActiveCustomerPage: (page: CustomerPage) => void;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  activeProfileTab: ProfileTab;
  setActiveProfileTab: (tab: ProfileTab) => void;
  navigateToWishlist: () => void;

  // Selected entities
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  navigateToProductDetail: (id: string) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  navigateToOrderTracking: (id: string) => void;
  quickViewProductId: string | null;
  setQuickViewProductId: (id: string | null) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;

  // Auth & User
  currentUser: User | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  sendOtp: (email: string, phone?: string, name?: string) => Promise<void>;
  verifyOtp: (email: string, otp: string, phone?: string, name?: string) => Promise<{ isNewUser: boolean; isProfileComplete: boolean; user: User }>;
  resendOtp: (email: string, phone?: string, name?: string) => Promise<void>;
  googleLogin: (payload: { credential?: string; email?: string; name?: string; avatar?: string }) => Promise<{ isNewUser: boolean; isProfileComplete: boolean; user: User }>;
  loginUser: (email: string, password?: string) => Promise<User | undefined>;
  registerUser: (name: string, email: string, password?: string) => Promise<User | undefined>;
  logoutUser: () => void;
  updateUserProfile: (profileData: Partial<User>) => Promise<User | undefined>;
  addSavedAddress: (address: ShippingAddress) => void;

  // Products & Categories
  products: Product[];
  categories: Category[];
  reviews: Review[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStock: (id: string, newStock: number) => Promise<void>;
  addCategory: (category: Omit<Category, 'itemCount'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;

  // Cart & Wishlist
  cart: CartItem[];
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartSubtotal: number;
  cartDiscount: number;
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  // Orders & Checkout
  orders: Order[];
  createOrder: (address: ShippingAddress, paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD', couponCode?: string) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, notes?: string) => void;
  currentCheckoutOrder: Order | null;

  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Toast Alerts
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('craftveda_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Load Data from Backend Express API on mount
  useEffect(() => {
    async function loadApiData() {
      // Fetch Products
      try {
        const apiProds = await apiService.getProducts();
        if (apiProds && Array.isArray(apiProds)) {
          setProducts(apiProds);
        }
      } catch (err: any) {
        console.error('❌ Failed to load products from Express/MongoDB API:', err);
        showToast(`Database Error: ${err.message || 'Failed to connect to backend'}`, 'error');
      }

      // Restore User Session
      if (getAuthToken()) {
        try {
          const user = await apiService.getCurrentUser();
          if (user && user.id) {
            setCurrentUser(user);
          }
        } catch (err: any) {
          console.error('❌ Token validation failed:', err.message);
          setAuthToken(null);
        }
      }

      // Fetch Orders
      try {
        const apiOrders = await apiService.getOrders();
        if (apiOrders && Array.isArray(apiOrders)) {
          setOrders(apiOrders);
        }
      } catch (err: any) {
        console.error('❌ Failed to load orders from Express/MongoDB API:', err);
      }

      // Fetch Wishlist
      try {
        const wishlistRes = await apiService.getWishlist();
        if (wishlistRes && Array.isArray(wishlistRes.productIds)) {
          setWishlist(wishlistRes.productIds);
        }
      } catch (err: any) {
        console.error('❌ Failed to load wishlist from Express/MongoDB API:', err);
      }
    }

    loadApiData();
  }, []);

  // UI state
  const [viewRole, setViewRole] = useState<'customer' | 'admin'>('customer');
  const [activeCustomerPage, setActiveCustomerPage] = useState<CustomerPage>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTab>('profile');
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  
  const [currentCheckoutOrder, setCurrentCheckoutOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const navigateToWishlist = () => {
    setActiveProfileTab('wishlist');
    setActiveCustomerPage('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync cart state to LocalStorage as a local shopping bag utility
  useEffect(() => {
    localStorage.setItem('craftveda_cart', JSON.stringify(cart));
  }, [cart]);

  // Navigation Helpers
  const navigateToProductDetail = (id: string) => {
    setSelectedProductId(id);
    setActiveCustomerPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToOrderTracking = (id: string) => {
    setSelectedOrderId(id);
    setActiveCustomerPage('track-order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // User Authentication
  const sendOtp = async (email: string, phone?: string, name?: string) => {
    try {
      const res = await apiService.sendOtp(email, phone, name);
      showToast(res.message || `Verification code sent to ${email}`, 'success');
    } catch (err: any) {
      console.error('❌ Failed to send OTP:', err);
      showToast(err.message || 'Failed to send OTP code', 'error');
      throw err;
    }
  };

  const resendOtp = async (email: string, phone?: string, name?: string) => {
    try {
      const res = await apiService.resendOtp(email, phone, name);
      showToast(res.message || `Resent OTP to ${email}`, 'success');
    } catch (err: any) {
      console.error('❌ Failed to resend OTP:', err);
      showToast(err.message || 'Failed to resend OTP code', 'error');
      throw err;
    }
  };

  const verifyOtp = async (email: string, otp: string, phone?: string, name?: string) => {
    try {
      const res = await apiService.verifyOtp(email, otp, phone, name);
      if (res && res.user) {
        setCurrentUser(res.user);
        showToast(`Welcome ${res.user.name ? res.user.name : res.user.email}! 🙏`, 'success');
        return res;
      }
      throw new Error('Invalid verification response');
    } catch (err: any) {
      console.error('❌ OTP Verification failed:', err);
      showToast(err.message || 'Verification failed', 'error');
      throw err;
    }
  };

  const googleLogin = async (payload: { credential?: string; email?: string; name?: string; avatar?: string }) => {
    try {
      const res = await apiService.googleAuth(payload);
      if (res && res.user) {
        setCurrentUser(res.user);
        showToast(`Signed in with Google as ${res.user.name || res.user.email}! 🙏`, 'success');
        return res;
      }
      throw new Error('Google authentication failed');
    } catch (err: any) {
      console.error('❌ Google auth failed:', err);
      showToast(err.message || 'Google authentication failed', 'error');
      throw err;
    }
  };

  const loginUser = async (email: string, password?: string) => {
    try {
      const authResult = await apiService.loginUser({ email, password });
      if (authResult && authResult.id) {
        setCurrentUser(authResult);
        setIsAuthModalOpen(false);
        showToast(`Welcome back, ${authResult.name}! 🙏`, 'success');
        return authResult;
      }
    } catch (err: any) {
      console.error('❌ Authentication failed:', err);
      showToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const registerUser = async (name: string, email: string, password?: string) => {
    try {
      const authResult = await apiService.registerUser({ name, email, password, role: 'customer' });
      if (authResult && authResult.id) {
        setCurrentUser(authResult);
        showToast(`Account created for ${authResult.name}!`, 'success');
        return authResult;
      }
    } catch (err: any) {
      console.error('❌ Registration failed:', err);
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logoutUser = () => {
    setAuthToken(null);
    setCurrentUser(null);
    showToast('Logged out successfully', 'info');
  };

  const updateUserProfile = async (profileData: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await apiService.updateProfile(profileData);
      if (res && res.id) {
        setCurrentUser(res);
        showToast('Personal details updated successfully.', 'success');
        return res;
      }
    } catch (err: any) {
      console.error('❌ Failed to update profile:', err);
      showToast(`Profile update failed: ${err.message}`, 'error');
      throw err;
    }
  };

  const addSavedAddress = (address: ShippingAddress) => {
    if (!currentUser) return;
    const exists = currentUser.savedAddresses.some(a => a.street === address.street && a.pincode === address.pincode);
    if (!exists) {
      const updatedAddresses = [...currentUser.savedAddresses, address];
      updateUserProfile({ savedAddresses: updatedAddresses });
    }
  };

  // Cart Management
  const addToCart = (product: Product, quantity = 1) => {
    if (!product.inStock || product.stockQuantity < 1) {
      showToast(`${product.name} is out of stock`, 'error');
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex].quantity = Math.min(newQty, product.stockQuantity);
        return updated;
      }
      return [...prevCart, { product, quantity: Math.min(quantity, product.stockQuantity) }];
    });

    showToast(`Added "${product.name}" to cart! 🏺`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const cappedQty = Math.min(quantity, item.product.stockQuantity);
        return { ...item, quantity: cappedQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  // Wishlist Actions
  const toggleWishlist = async (productId: string) => {
    try {
      const res = await apiService.toggleWishlist(productId, currentUser?.id);
      if (res && Array.isArray(res.productIds)) {
        setWishlist(res.productIds);
        const exists = res.productIds.includes(productId);
        if (exists) {
          showToast('Added to wishlist ❤️', 'success');
        } else {
          showToast('Removed from wishlist', 'info');
        }
      }
    } catch (err: any) {
      console.error('❌ Wishlist operation error:', err);
      showToast(`Wishlist Error: ${err.message}`, 'error');
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Cart Totals
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartDiscount = cart.reduce((sum, item) => {
    const diff = item.product.originalPrice - item.product.price;
    return sum + (diff > 0 ? diff * item.quantity : 0);
  }, 0);
  const cartTotal = cartSubtotal > 1499 ? cartSubtotal : cartSubtotal + 99;

  // Products Database CRUD
  const addProduct = async (newProdData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const apiProd = await apiService.addProduct(newProdData);
      if (apiProd && apiProd.id) {
        setProducts(prev => [apiProd, ...prev]);
        setCategories(prev => prev.map(c => {
          if (c.id === apiProd.category) {
            return { ...c, itemCount: c.itemCount + 1 };
          }
          return c;
        }));
        showToast(`Product "${apiProd.name}" saved to MongoDB Atlas!`, 'success');
      }
    } catch (err: any) {
      console.error('❌ Product creation error:', err);
      showToast(`Failed to create product in database: ${err.message}`, 'error');
      throw err;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const res = await apiService.updateProduct(updatedProduct);
      if (res && res.id) {
        setProducts(prev => prev.map(p => p.id === res.id ? res : p));
        showToast(`Product "${res.name}" updated in MongoDB Atlas!`, 'success');
      }
    } catch (err: any) {
      console.error('❌ Product update error:', err);
      showToast(`Failed to update product in database: ${err.message}`, 'error');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product deleted from MongoDB catalog', 'info');
    } catch (err: any) {
      console.error('❌ Product deletion error:', err);
      showToast(`Failed to delete product from database: ${err.message}`, 'error');
      throw err;
    }
  };

  const updateProductStock = async (id: string, newStock: number) => {
    const targetProduct = products.find(p => p.id === id);
    if (!targetProduct) return;

    const updated = {
      ...targetProduct,
      stockQuantity: Math.max(0, newStock),
      inStock: newStock > 0,
    };

    try {
      const res = await apiService.updateProduct(updated);
      if (res && res.id) {
        setProducts(prev => prev.map(p => p.id === res.id ? res : p));
        showToast('Stock level updated in database', 'success');
      }
    } catch (err: any) {
      console.error('❌ Stock update error:', err);
      showToast(`Failed to update stock: ${err.message}`, 'error');
    }
  };

  const addCategory = (newCatData: Omit<Category, 'itemCount'>) => {
    const itemCount = products.filter(p => p.category === newCatData.id).length;
    const newCategory: Category = {
      ...newCatData,
      itemCount,
    };
    setCategories(prev => [...prev, newCategory]);
    showToast(`Category "${newCategory.name}" added!`, 'success');
  };

  const updateCategory = (updatedCategory: Category) => {
    const itemCount = products.filter(p => p.category === updatedCategory.id).length;
    const finalCategory = { ...updatedCategory, itemCount };
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? finalCategory : c));
    showToast(`Category "${updatedCategory.name}" updated!`, 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Category removed from store', 'info');
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setReviews(prev => [newReview, ...prev]);

    const prodReviews = [...reviews.filter(r => r.productId === reviewData.productId), newReview];
    const avgRating = Number((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1));

    setProducts(prev => prev.map(p => {
      if (p.id === reviewData.productId) {
        return {
          ...p,
          rating: avgRating,
          reviewCount: prodReviews.length,
        };
      }
      return p;
    }));

    showToast('Thank you! Your review has been published.', 'success');
  };

  // Order Database Submission
  const createOrder = (
    address: ShippingAddress, 
    paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD',
    couponCode?: string
  ): Order => {
    const orderNum = `CV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = cartSubtotal;
    const delivery = subtotal > 1499 ? 0 : 99;
    let discount = 0;
    if (couponCode === 'CRAFT10') {
      discount = Math.round(subtotal * 0.10);
    }
    const finalTotal = subtotal + delivery - discount;

    const orderItems = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images[0],
      unitPrice: item.product.price,
      quantity: item.quantity,
      totalPrice: item.product.price * item.quantity,
    }));

    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const orderPayload: Partial<Order> = {
      orderNumber: orderNum,
      userId: currentUser ? currentUser.id : 'guest-user',
      customerName: address.fullName,
      customerEmail: address.email,
      customerPhone: address.mobileNumber,
      items: orderItems,
      shippingAddress: address,
      subtotal,
      deliveryCharge: delivery,
      discountAmount: discount,
      couponCode,
      totalAmount: finalTotal,
      currentStatus: 'Order Placed',
      payment: {
        paymentMethod,
        transactionId: `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        status: 'SUCCESS',
        amount: finalTotal,
        upiHandle: 'customer@upi',
        timestamp: nowStr,
      },
    };

    apiService.createOrder(orderPayload).then(createdApiOrder => {
      if (createdApiOrder && createdApiOrder.id) {
        setOrders(prev => [createdApiOrder, ...prev]);
        setCurrentCheckoutOrder(createdApiOrder);
        setSelectedOrderId(createdApiOrder.id);
        clearCart();
        setActiveCustomerPage('order-confirmation');
        showToast(`Order #${createdApiOrder.orderNumber} saved to MongoDB Atlas!`, 'success');
      }
    }).catch((err: any) => {
      console.error('❌ Order submission error:', err);
      showToast(`Order submission failed: ${err.message}`, 'error');
    });

    // Temporary object for synchronous return type requirement
    const draftOrder: Order = {
      id: `ord-pending`,
      orderNumber: orderNum,
      userId: currentUser ? currentUser.id : 'guest-user',
      customerName: address.fullName,
      customerEmail: address.email,
      customerPhone: address.mobileNumber,
      items: orderItems,
      shippingAddress: address,
      subtotal,
      deliveryCharge: delivery,
      discountAmount: discount,
      totalAmount: finalTotal,
      currentStatus: 'Order Placed',
      statusTimeline: [
        { status: 'Order Placed', timestamp: nowStr, completed: true, notes: 'Order submitted' }
      ],
      payment: {
        paymentMethod,
        transactionId: `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        status: 'SUCCESS',
        amount: finalTotal,
        timestamp: nowStr,
      },
      createdAt: nowStr,
      estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    return draftOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, notes?: string) => {
    apiService.updateOrderStatus(orderId, newStatus, notes).then(updatedOrder => {
      if (updatedOrder && updatedOrder.id) {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        showToast(`Order status updated to "${newStatus}" in database!`, 'success');
      }
    }).catch((err: any) => {
      console.error('❌ Order status update error:', err);
      showToast(`Order status update failed: ${err.message}`, 'error');
    });
  };

  // Notification Actions
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <StoreContext.Provider
      value={{
        viewRole,
        setViewRole,
        activeCustomerPage,
        setActiveCustomerPage,
        activeAdminTab,
        setActiveAdminTab,
        activeProfileTab,
        setActiveProfileTab,
        navigateToWishlist,

        selectedProductId,
        setSelectedProductId,
        navigateToProductDetail,
        selectedOrderId,
        setSelectedOrderId,
        navigateToOrderTracking,
        quickViewProductId,
        setQuickViewProductId,

        searchQuery,
        setSearchQuery,
        selectedCategoryFilter,
        setSelectedCategoryFilter,

        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        sendOtp,
        verifyOtp,
        resendOtp,
        googleLogin,
        loginUser,
        registerUser,
        logoutUser,
        updateUserProfile,
        addSavedAddress,

        products,
        categories,
        reviews,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        addCategory,
        updateCategory,
        deleteCategory,
        addReview,

        cart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartSubtotal,
        cartDiscount,

        wishlist,
        toggleWishlist,
        isInWishlist,

        orders,
        createOrder,
        updateOrderStatus,
        currentCheckoutOrder,

        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        toast,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
