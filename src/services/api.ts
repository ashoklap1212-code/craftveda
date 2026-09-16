/**
 * CraftVeda Frontend API Service
 * ---------------------------------------
 * Connects the React + Vite frontend to the Express + MongoDB Atlas backend at:
 * http://localhost:5000/api
 */

import { Product, Order, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to retrieve JWT token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('craftveda_token');
};

// Helper to set JWT token
export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('craftveda_token', token);
  } else {
    localStorage.removeItem('craftveda_token');
  }
};

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

// Generic HTTP Request Wrapper
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
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
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('image', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/products/upload`, {
      method: 'POST',
      headers,
      body: formData,
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

  // USER AUTHENTICATION ENDPOINTS
  async sendOtp(email: string, phone?: string, name?: string): Promise<{ message: string; email: string; phone?: string; name?: string; expiresAfterSeconds: number }> {
    return fetchJSON<{ message: string; email: string; phone?: string; name?: string; expiresAfterSeconds: number }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, phone, name }),
    });
  },

  async resendOtp(email: string, phone?: string, name?: string): Promise<{ message: string; email: string; phone?: string; name?: string; expiresAfterSeconds: number }> {
    return fetchJSON<{ message: string; email: string; phone?: string; name?: string; expiresAfterSeconds: number }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email, phone, name }),
    });
  },

  async verifyOtp(email: string, otp: string, phone?: string, name?: string): Promise<{ token: string; isNewUser: boolean; isProfileComplete: boolean; user: User }> {
    const res = await fetchJSON<{ token: string; isNewUser: boolean; isProfileComplete: boolean; user: User }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, phone, name }),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return { ...res, user: mapId(res.user) };
  },

  async getUsers(): Promise<User[]> {
    const data = await fetchJSON<User[]>('/auth/users');
    return mapIdArray(data);
  },

  async googleAuth(payload: { credential?: string; email?: string; name?: string; avatar?: string; googleId?: string }): Promise<{ token: string; isNewUser: boolean; isProfileComplete: boolean; user: User }> {
    const res = await fetchJSON<{ token: string; isNewUser: boolean; isProfileComplete: boolean; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return { ...res, user: mapId(res.user) };
  },

  async registerUser(userData: { name: string; email: string; password?: string; phone?: string; avatar?: string; role?: string }): Promise<User & { token: string }> {
    const res = await fetchJSON<User & { token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return { ...mapId(res), token: res.token };
  },

  async loginUser(credentials: { email: string; password?: string }): Promise<User & { token: string }> {
    const res = await fetchJSON<User & { token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return { ...mapId(res), token: res.token };
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
};

export const api = apiService;
