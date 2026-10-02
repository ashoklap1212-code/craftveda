/**
 * CraftVeda Frontend API Service
 * ---------------------------------------
 * Connects the React + Vite frontend to the Express + MongoDB Atlas backend at:
 * http://localhost:5000/api
 *
 * Uses HttpOnly session cookies (credentials: 'include') for secure authentication.
 */

import { Product, Order, User, Notification } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to map Mongo `_id` to `id` for frontend compatibility
function mapId<T extends { id?: string; _id?: string }>(item: T): T {
  if (!item) return item;
  return {
    ...item,
    id: item.id || item._id || '',
  };
}

function mapIdArray<T extends { id?: string; _id?: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.map(mapId);
}

// Generic HTTP Request Wrapper with credentials: 'include' for HttpOnly Cookie support
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include', // Include HttpOnly session cookie
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(err.message || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const apiService = {
  // PRODUCTS DATABASE ENDPOINTS
  async getProducts(params?: { category?: string; search?: string; sortBy?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]> {
    let queryStr = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.category) searchParams.append('category', params.category);
      if (params.search) searchParams.append('search', params.search);
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
      queryStr = `?${searchParams.toString()}`;
    }
    const data = await fetchJSON<Product[]>(`/products${queryStr}`);
    return mapIdArray(data);
  },

  async getProductById(id: string): Promise<Product> {
    const data = await fetchJSON<Product>(`/products/${id}`);
    return mapId(data);
  },

  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const data = await fetchJSON<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return mapId(data);
  },

  async updateProduct(product: Product): Promise<Product> {
    const data = await fetchJSON<Product>(`/products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return mapId(data);
  },

  async deleteProduct(productId: string): Promise<{ message: string; id: string }> {
    return fetchJSON<{ message: string; id: string }>(`/products/${productId}`, {
      method: 'DELETE',
    });
  },

  async uploadProductImage(file: File): Promise<{ message: string; imageUrl: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE_URL}/products/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Image upload failed' }));
      throw new Error(err.message || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    const serverHost = API_BASE_URL.replace(/\/api\/?$/, '');
    if (data.imageUrl && data.imageUrl.startsWith('/')) {
      data.imageUrl = `${serverHost}${data.imageUrl}`;
    }
    return data;
  },

  // USER AUTHENTICATION ENDPOINTS (PASSWORDLESS)
  async sendOtp(email: string): Promise<{ message: string; email: string; expiresAfterSeconds: number }> {
    return fetchJSON<{ message: string; email: string; expiresAfterSeconds: number }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resendOtp(email: string): Promise<{ message: string; email: string; expiresAfterSeconds: number }> {
    return fetchJSON<{ message: string; email: string; expiresAfterSeconds: number }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyOtp(email: string, otp: string): Promise<{ isNewUser: boolean; isProfileComplete: boolean; user: User }> {
    const res = await fetchJSON<{ isNewUser: boolean; isProfileComplete: boolean; user: User }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    return { ...res, user: mapId(res.user) };
  },

  async googleAuth(payload: { credential: string }): Promise<{ isNewUser: boolean; isProfileComplete: boolean; user: User }> {
    const res = await fetchJSON<{ isNewUser: boolean; isProfileComplete: boolean; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { ...res, user: mapId(res.user) };
  },

  async getCurrentUser(): Promise<User> {
    const data = await fetchJSON<User>('/auth/me');
    return mapId(data);
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const data = await fetchJSON<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return mapId(data);
  },

  async logout(): Promise<{ message: string }> {
    return fetchJSON<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  async getUsers(): Promise<User[]> {
    const data = await fetchJSON<User[]>('/auth/users');
    return mapIdArray(data);
  },

  // NOTIFICATION ENDPOINTS
  async getNotifications(): Promise<Notification[]> {
    const data = await fetchJSON<Notification[]>('/notifications');
    return mapIdArray(data);
  },

  async markNotificationRead(id: string): Promise<Notification> {
    const data = await fetchJSON<Notification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return mapId(data);
  },

  async markAllNotificationsRead(): Promise<Notification[]> {
    const data = await fetchJSON<Notification[]>('/notifications/read-all', {
      method: 'PATCH',
    });
    return mapIdArray(data);
  },

  async deleteNotification(id: string): Promise<{ message: string; id: string }> {
    return fetchJSON<{ message: string; id: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  // ORDERS DATABASE ENDPOINTS
  async getOrders(userId?: string): Promise<Order[]> {
    const url = userId ? `/orders?userId=${userId}` : '/orders';
    const data = await fetchJSON<Order[]>(url);
    return mapIdArray(data);
  },

  async getMyOrders(): Promise<Order[]> {
    const data = await fetchJSON<Order[]>('/orders/my-orders');
    return mapIdArray(data);
  },

  async getOrderById(id: string): Promise<Order> {
    const data = await fetchJSON<Order>(`/orders/${id}`);
    return mapId(data);
  },

  async createOrder(orderPayload: Partial<Order>): Promise<Order> {
    const data = await fetchJSON<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    return mapId(data);
  },

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<Order> {
    const data = await fetchJSON<Order>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
    return mapId(data);
  },

  // WISHLIST ENDPOINTS
  async getWishlist(userId?: string): Promise<{ userId: string; productIds: string[] }> {
    const url = userId ? `/wishlist/${userId}` : '/wishlist';
    return fetchJSON<{ userId: string; productIds: string[] }>(url);
  },

  async toggleWishlist(productId: string, userId?: string): Promise<{ userId: string; productIds: string[] }> {
    return fetchJSON<{ userId: string; productIds: string[] }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId, userId }),
    });
  },

  async getAdminWishlists(): Promise<Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    productCount: number;
    productIds: string[];
    products: Array<{ id: string; name: string; price: number; image: string; categoryName: string }>;
    updatedAt: string;
  }>> {
    return fetchJSON('/wishlist/admin');
  },

  // ADMIN SPECIFIC AUTHENTICATION
  async adminLogin(email: string, password: string): Promise<{ message: string; user: User }> {
    const res = await fetchJSON<{ message: string; user: User }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { ...res, user: mapId(res.user) };
  },

  async getAdminMe(): Promise<User> {
    const data = await fetchJSON<User>('/auth/admin-me');
    return mapId(data);
  },

  // ADMIN USER MANAGEMENT ENDPOINTS (MAIN ADMIN CONTROL)
  async getAdmins(): Promise<User[]> {
    const data = await fetchJSON<User[]>('/auth/admins');
    return mapIdArray(data);
  },

  async createAdmin(adminData: {
    name?: string;
    email: string;
    password: string;
    adminPermissions?: string[];
    isActive?: boolean;
  }): Promise<User> {
    const data = await fetchJSON<User>('/auth/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
    return mapId(data);
  },

  async updateAdmin(id: string, adminData: Partial<User & { password?: string }>): Promise<User> {
    const data = await fetchJSON<User>(`/auth/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adminData),
    });
    return mapId(data);
  },

  async deleteAdmin(id: string): Promise<{ message: string; id: string }> {
    return fetchJSON<{ message: string; id: string }>(`/auth/admins/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleAdminActive(id: string): Promise<User> {
    const data = await fetchJSON<User>(`/auth/admins/${id}/toggle-active`, {
      method: 'PATCH',
    });
    return mapId(data);
  },

  // DISCOUNT COUPON MANAGEMENT ENDPOINTS
  async getCoupons(): Promise<any[]> {
    const data = await fetchJSON<any[]>('/coupons');
    return mapIdArray(data);
  },

  async createCoupon(couponData: any): Promise<any> {
    const data = await fetchJSON<any>('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
    return mapId(data);
  },

  async updateCoupon(id: string, couponData: any): Promise<any> {
    const data = await fetchJSON<any>(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couponData),
    });
    return mapId(data);
  },

  async deleteCoupon(id: string): Promise<{ message: string; id: string }> {
    return fetchJSON<{ message: string; id: string }>(`/coupons/${id}`, {
      method: 'DELETE',
    });
  },

  async validateCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    code?: string;
    discountType?: string;
    discountValue?: number;
    discountAmount: number;
    message: string;
  }> {
    return fetchJSON('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },

  // ORDER CHARGES ENDPOINTS (Admin-configurable)
  async getOrderCharges(): Promise<{
    id: string;
    shippingFee: number;
    packagingFee: number;
    freeShippingThreshold: number;
    safeFragileShippingLabel: string;
    isFreeShippingEnabled: boolean;
    updatedBy: string;
  }> {
    return fetchJSON('/order-charges');
  },

  async updateOrderCharges(data: {
    shippingFee?: number;
    packagingFee?: number;
    freeShippingThreshold?: number;
    safeFragileShippingLabel?: string;
    isFreeShippingEnabled?: boolean;
  }): Promise<{
    id: string;
    shippingFee: number;
    packagingFee: number;
    freeShippingThreshold: number;
    safeFragileShippingLabel: string;
    isFreeShippingEnabled: boolean;
  }> {
    return fetchJSON('/order-charges', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // CATEGORY ENDPOINTS (MongoDB-backed)
  async getCategories(): Promise<any[]> {
    return fetchJSON('/categories');
  },

  async createCategory(categoryData: { id: string; name: string; description: string; image: string }): Promise<any> {
    return fetchJSON('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  async updateCategory(id: string, categoryData: { name?: string; description?: string; image?: string }): Promise<any> {
    return fetchJSON(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  async deleteCategory(id: string): Promise<{ message: string; id: string }> {
    return fetchJSON(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadCategoryImage(file: File): Promise<{ message: string; imageUrl: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE_URL}/categories/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Category image upload failed' }));
      throw new Error(err.message || `HTTP error ${res.status}`);
    }

    return res.json();
  },
};

export const api = apiService;

