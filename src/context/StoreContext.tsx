import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, Category, CartItem, Order, User, Notification, 
  OrderStatus, ShippingAddress, OrderCharges
} from '../types';


import { apiService } from '../services/api';

export type CustomerPage = 
  | 'home' 
  | 'shop' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'order-confirmation' 
  | 'track-order' 
  | 'profile' 
  | 'personal-details'
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
  | 'categories'
  | 'wishlist'
  | 'coupons'
  | 'order-charges'
  | 'admins'
  | 'reviews';

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

  // Passwordless Auth & User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<{ isNewUser: boolean; isProfileComplete: boolean; user: User }>;
  resendOtp: (email: string) => Promise<void>;
  googleLogin: (payload: { credential: string }) => Promise<{ isNewUser: boolean; isProfileComplete: boolean; user: User }>;
  logoutUser: () => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<User | undefined>;
  addSavedAddress: (address: ShippingAddress) => void;

  // Products & Categories
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStock: (id: string, newStock: number) => Promise<void>;
  addCategory: (category: Omit<Category, 'itemCount'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;

  // Order Charges (Admin-managed)
  orderCharges: OrderCharges;
  fetchOrderCharges: () => Promise<void>;
  updateOrderCharges: (data: Partial<OrderCharges>) => Promise<void>;

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
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  // Orders & Checkout
  orders: Order[];
  fetchOrders: () => Promise<void>;
  createOrder: (address: ShippingAddress, paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD', couponCode?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, notes?: string) => void;
  currentCheckoutOrder: Order | null;

  // Notifications
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Toast Alerts
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const DEFAULT_ORDER_CHARGES: OrderCharges = {
    shippingFee: 99,
    packagingFee: 0,
    freeShippingThreshold: 1499,
    safeFragileShippingLabel: 'Safe Fragile Shipping',
    isFreeShippingEnabled: true,
  };
  const [orderCharges, setOrderCharges] = useState<OrderCharges>(DEFAULT_ORDER_CHARGES);

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

  // 1. Initial Data Load & Session Check via GET /api/auth/me
  useEffect(() => {
    async function loadInitialData() {
      // Fetch Products
      try {
        const apiProds = await apiService.getProducts();
        if (apiProds && Array.isArray(apiProds)) {
          setProducts(apiProds);
        }
      } catch (err: any) {
        console.error('❌ Failed to load products:', err);
      }

      // Fetch Categories from MongoDB Atlas
      try {
        const apiCats = await apiService.getCategories();
        if (apiCats && Array.isArray(apiCats)) {
          setCategories(apiCats);
        }
      } catch (err: any) {
        console.error('❌ Failed to load categories:', err);
      }

      // Fetch Order Charges from MongoDB Atlas
      try {
        const charges = await apiService.getOrderCharges();
        if (charges) {
          setOrderCharges(charges);
        }
      } catch (err: any) {
        console.error('❌ Failed to load order charges:', err);
        // Use defaults if API fails
      }

      // Check Active Session via GET /api/auth/me (HttpOnly Cookie)
      try {
        const user = await apiService.getCurrentUser();
        if (user && user.id) {
          setCurrentUser(user);
          if (user.profileCompleted === false) {
            setActiveCustomerPage('personal-details');
          }
        }
      } catch (err: any) {
        // User not logged in or session expired
        setCurrentUser(null);
      }
    }

    loadInitialData();
  }, []);

  // UI state
  const [viewRole, setViewRole] = useState<'customer' | 'admin'>('customer');
  const [activeCustomerPage, setActiveCustomerPage] = useState<CustomerPage>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTab>('profile');

  // 2. Synchronize User Data (Orders, Wishlist, Notifications) whenever currentUser or viewRole changes
  const fetchOrders = async () => {
    try {
      if (viewRole === 'admin' || currentUser?.role === 'admin') {
        const allOrders = await apiService.getOrders();
        if (Array.isArray(allOrders)) {
          setOrders(allOrders);
        }
      } else if (currentUser && currentUser.id) {
        const userOrders = await apiService.getMyOrders();
        if (Array.isArray(userOrders)) {
          setOrders(userOrders);
        }
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error('❌ Failed to load orders:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const userNotifs = await apiService.getNotifications();
      if (Array.isArray(userNotifs)) {
        setNotifications(userNotifs);
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    async function syncUserData() {
      fetchOrders();

      if (currentUser && currentUser.id) {
        // Fetch User Wishlist
        try {
          const wishlistRes = await apiService.getWishlist(currentUser.id);
          if (wishlistRes && Array.isArray(wishlistRes.productIds)) {
            setWishlist(wishlistRes.productIds);
          }
        } catch (err: any) {
          console.error('❌ Failed to load user wishlist:', err);
        }

        // Fetch User Notifications
        fetchNotifications();
      } else {
        setWishlist([]);
        setNotifications([]);
      }
    }

    syncUserData();
  }, [currentUser, viewRole]);
  
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

  // Sync cart state to LocalStorage as a shopping bag utility
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

  // Passwordless Auth Actions
  const sendOtp = async (email: string) => {
    try {
      const res = await apiService.sendOtp(email);
      showToast(res.message || `Verification code sent to ${email}`, 'success');
    } catch (err: any) {
      console.error('❌ Failed to send OTP:', err);
      showToast(err.message || 'Failed to send OTP code', 'error');
      throw err;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const res = await apiService.resendOtp(email);
      showToast(res.message || `Resent OTP to ${email}`, 'success');
    } catch (err: any) {
      console.error('❌ Failed to resend OTP:', err);
      showToast(err.message || 'Failed to resend OTP code', 'error');
      throw err;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const res = await apiService.verifyOtp(email, otp);
      if (res && res.user) {
        setCurrentUser(res.user);
        showToast(`Welcome to CraftVeda ${res.user.name ? res.user.name : res.user.email}! 🙏`, 'success');
        return res;
      }
      throw new Error('Invalid verification response');
    } catch (err: any) {
      console.error('❌ OTP Verification failed:', err);
      showToast(err.message || 'Verification failed', 'error');
      throw err;
    }
  };

  const googleLogin = async (payload: { credential: string }) => {
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

  const logoutUser = async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    }
    setCurrentUser(null);
    setOrders([]);
    setWishlist([]);
    setNotifications([]);
    setCurrentCheckoutOrder(null);
    setIsAuthModalOpen(false);
    setIsCartDrawerOpen(false);
    setActiveCustomerPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Cart Totals (uses dynamic orderCharges from MongoDB)
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartDiscount = cart.reduce((sum, item) => {
    const diff = item.product.originalPrice - item.product.price;
    return sum + (diff > 0 ? diff * item.quantity : 0);
  }, 0);
  const shippingCharge = (orderCharges.isFreeShippingEnabled && cartSubtotal >= orderCharges.freeShippingThreshold)
    ? 0
    : (orderCharges.shippingFee + orderCharges.packagingFee);
  const cartTotal = cartSubtotal + shippingCharge;

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
      showToast(`Failed to create product: ${err.message}`, 'error');
      throw err;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const res = await apiService.updateProduct(updatedProduct);
      if (res && res.id) {
        setProducts(prev => prev.map(p => p.id === res.id ? res : p));
        showToast(`Product "${res.name}" updated!`, 'success');
      }
    } catch (err: any) {
      console.error('❌ Product update error:', err);
      showToast(`Failed to update product: ${err.message}`, 'error');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product deleted from catalog', 'info');
    } catch (err: any) {
      console.error('❌ Product deletion error:', err);
      showToast(`Failed to delete product: ${err.message}`, 'error');
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
        showToast('Stock level updated', 'success');
      }
    } catch (err: any) {
      console.error('❌ Stock update error:', err);
      showToast(`Failed to update stock: ${err.message}`, 'error');
    }
  };

  const fetchCategories = async () => {
    try {
      const apiCats = await apiService.getCategories();
      if (apiCats && Array.isArray(apiCats)) {
        setCategories(apiCats);
      }
    } catch (err: any) {
      console.error('❌ Failed to refresh categories:', err);
    }
  };

  const addCategory = async (newCatData: Omit<Category, 'itemCount'>) => {
    try {
      await apiService.createCategory({
        id: newCatData.id,
        name: newCatData.name,
        description: newCatData.description,
        image: newCatData.image,
      });
      await fetchCategories();
      showToast(`Category "${newCatData.name}" added to MongoDB!`, 'success');
    } catch (err: any) {
      console.error('❌ Category creation error:', err);
      showToast(`Failed to create category: ${err.message}`, 'error');
      throw err;
    }
  };

  const updateCategory = async (updatedCategory: Category) => {
    try {
      await apiService.updateCategory(updatedCategory.id, {
        name: updatedCategory.name,
        description: updatedCategory.description,
        image: updatedCategory.image,
      });
      await fetchCategories();
      showToast(`Category "${updatedCategory.name}" updated in MongoDB!`, 'success');
    } catch (err: any) {
      console.error('❌ Category update error:', err);
      showToast(`Failed to update category: ${err.message}`, 'error');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await apiService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast('Category removed from MongoDB', 'info');
    } catch (err: any) {
      console.error('❌ Category delete error:', err);
      showToast(`Failed to delete category: ${err.message}`, 'error');
      throw err;
    }
  };

  // Order Charges Management
  const fetchOrderCharges = async () => {
    try {
      const charges = await apiService.getOrderCharges();
      if (charges) setOrderCharges(charges);
    } catch (err: any) {
      console.error('❌ Failed to fetch order charges:', err);
    }
  };

  const updateOrderCharges = async (data: Partial<OrderCharges>) => {
    try {
      const updated = await apiService.updateOrderCharges(data);
      setOrderCharges(updated);
      showToast('Order charges updated successfully!', 'success');
    } catch (err: any) {
      console.error('❌ Failed to update order charges:', err);
      showToast(`Failed to update charges: ${err.message}`, 'error');
      throw err;
    }
  };

  // Authenticated Order Creation
  const createOrder = async (
    address: ShippingAddress, 
    paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD',
    couponCode?: string
  ): Promise<Order> => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Please sign in to place an order', 'info');
      throw new Error('Authentication required to create order');
    }

    const orderNum = `CV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = cartSubtotal;
    const delivery = (orderCharges.isFreeShippingEnabled && subtotal >= orderCharges.freeShippingThreshold)
      ? 0
      : (orderCharges.shippingFee + orderCharges.packagingFee);
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
      customerName: address.fullName,
      customerEmail: address.email || currentUser.email,
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

    try {
      const createdApiOrder = await apiService.createOrder(orderPayload);
      if (createdApiOrder && createdApiOrder.id) {
        setOrders(prev => [createdApiOrder, ...prev]);
        setCurrentCheckoutOrder(createdApiOrder);
        setSelectedOrderId(createdApiOrder.id);
        clearCart();
        setActiveCustomerPage('order-confirmation');
        showToast(`Order #${createdApiOrder.orderNumber} confirmed!`, 'success');
        fetchNotifications();
        return createdApiOrder;
      }
      throw new Error('Failed to create order');
    } catch (err: any) {
      console.error('❌ Order submission error:', err);
      showToast(`Order submission failed: ${err.message}`, 'error');
      throw err;
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, notes?: string) => {
    apiService.updateOrderStatus(orderId, newStatus, notes).then(updatedOrder => {
      if (updatedOrder && updatedOrder.id) {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        showToast(`Order status updated to "${newStatus}"`, 'success');
      }
    }).catch((err: any) => {
      console.error('❌ Order status update error:', err);
      showToast(`Order status update failed: ${err.message}`, 'error');
    });
  };

  // Notification Actions
  const markNotificationAsRead = async (id: string) => {
    try {
      const updated = await apiService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const updatedList = await apiService.markAllNotificationsRead();
      setNotifications(updatedList);
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      console.error('Failed to delete notification:', err);
    }
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
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        sendOtp,
        verifyOtp,
        resendOtp,
        googleLogin,
        logoutUser,
        updateUserProfile,
        addSavedAddress,

        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        addCategory,
        updateCategory,
        deleteCategory,
        fetchCategories,

        orderCharges,
        fetchOrderCharges,
        updateOrderCharges,

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
        fetchOrders,
        createOrder,
        updateOrderStatus,
        currentCheckoutOrder,

        notifications,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,

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
