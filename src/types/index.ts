export type CategoryId = 
  | 'ceramic-pots' 
  | 'clay-pots' 
  | 'handi' 
  | 'jadi' 
  | 'traditional-decor' 
  | 'kitchen-home' 
  | 'brass-copper'
  | 'home-art'
  | 'new-arrivals';

export interface Review {
  id: string;
  _id?: string;
  productId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  isHidden?: boolean;
  createdAt?: string;
}

export interface AdminReview {
  id: string;
  _id?: string;
  productId: string;
  productName: string;
  productImage: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  userName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  isHidden: boolean;
  date: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: CategoryId;
  categoryName: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  shortDescription: string;
  material: string;
  dimensions: string;
  weight: string;
  color: string;
  manufacturingType: string;
  careInstructions: string;
  suitableUsage: string;
  packagingInfo: string;
  inStock: boolean;
  stockQuantity: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  mobileNumber: string;
  email: string;
  houseFlat: string;
  street: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export type OrderStatus = 
  | 'Order Placed'
  | 'Payment Confirmed'
  | 'Order Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderStatusStep {
  status: OrderStatus;
  timestamp: string;
  completed: boolean;
  notes?: string;
}

export interface PaymentDetails {
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD';
  transactionId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  amount: number;
  upiHandle?: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  currentStatus: OrderStatus;
  statusTimeline: OrderStatusStep[];
  payment: PaymentDetails;
  createdAt: string;
  estimatedDeliveryDate: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  profileImage?: string;
  googleId?: string | null;
  authProvider?: 'email' | 'google';
  isEmailVerified?: boolean;
  profileCompleted?: boolean;
  role: 'customer' | 'admin' | string;
  isMainAdmin?: boolean;
  adminPermissions?: string[];
  savedAddresses: ShippingAddress[];
  joinedDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  _id?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read?: boolean;
  isRead?: boolean;
  timestamp?: string;
  createdAt?: string;
  relatedOrderId?: string;
}

export interface FilterOptions {
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStockOnly: boolean;
  searchQuery: string;
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popularity';
}

export interface Coupon {
  id: string;
  _id?: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount?: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface OrderCharges {
  id?: string;
  shippingFee: number;
  packagingFee: number;
  freeShippingThreshold: number;
  safeFragileShippingLabel: string;
  isFreeShippingEnabled: boolean;
  updatedBy?: string;
}
