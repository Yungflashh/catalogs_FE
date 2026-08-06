import api from './client';
import {
  Product, ProductsResponse, Cart, Wishlist, Order, User, AdminStats,
  CryptoWallet, WalletFunding,
} from '../types';

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    api.post<User>('/auth/login', { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    api.post<User>('/auth/register', { name, email, password }).then((r) => r.data),
  profile: () => api.get<User>('/auth/profile').then((r) => r.data),
  updateProfile: (data: Partial<User> & { password?: string }) =>
    api.put<User>('/auth/profile', data).then((r) => r.data),
};

// ---- Products ----
export interface ProductQuery {
  keyword?: string;
  category?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}
export const productApi = {
  list: (q: ProductQuery = {}) =>
    api.get<ProductsResponse>('/products', { params: q }).then((r) => r.data),
  featured: () => api.get<Product[]>('/products/featured').then((r) => r.data),
  categories: () => api.get<string[]>('/products/categories').then((r) => r.data),
  get: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  similar: (id: string) => api.get<Product[]>(`/products/${id}/similar`).then((r) => r.data),
  create: (data: Partial<Product>) =>
    api.post<Product>('/products', data).then((r) => r.data),
  update: (id: string, data: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/products/${id}`).then((r) => r.data),
};

// ---- Upload ----
export const uploadApi = {
  image: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api
      .post<{ url: string }>('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.url);
  },
};

// ---- Cart ----
export const cartApi = {
  get: () => api.get<Cart>('/cart').then((r) => r.data),
  add: (productId: string, quantity = 1) =>
    api.post<Cart>('/cart', { productId, quantity }).then((r) => r.data),
  update: (productId: string, quantity: number) =>
    api.put<Cart>(`/cart/${productId}`, { quantity }).then((r) => r.data),
  remove: (productId: string) =>
    api.delete<Cart>(`/cart/${productId}`).then((r) => r.data),
  clear: () => api.delete('/cart').then((r) => r.data),
};

// ---- Wishlist ----
export const wishlistApi = {
  get: () => api.get<Wishlist>('/wishlist').then((r) => r.data),
  add: (productId: string) =>
    api.post<Wishlist>('/wishlist', { productId }).then((r) => r.data),
  remove: (productId: string) =>
    api.delete<Wishlist>(`/wishlist/${productId}`).then((r) => r.data),
};

// ---- Orders ----
export const orderApi = {
  create: (paymentMethod: string) =>
    api.post<Order>('/orders', { paymentMethod }).then((r) => r.data),
  mine: () => api.get<Order[]>('/orders/mine').then((r) => r.data),
  get: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  all: () => api.get<Order[]>('/orders').then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.put<Order>(`/orders/${id}/status`, { status }).then((r) => r.data),
};

// ---- Admin ----
export const adminApi = {
  stats: () => api.get<AdminStats>('/admin/stats').then((r) => r.data),
  users: () => api.get<User[]>('/admin/users').then((r) => r.data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  updateRole: (id: string, role: string) =>
    api.put<User>(`/admin/users/${id}/role`, { role }).then((r) => r.data),
};

// ---- Crypto Wallets ----
export const cryptoWalletApi = {
  active: () => api.get<CryptoWallet[]>('/crypto-wallets').then((r) => r.data),
  all: () => api.get<CryptoWallet[]>('/crypto-wallets/all').then((r) => r.data),
  create: (data: Partial<CryptoWallet>) =>
    api.post<CryptoWallet>('/crypto-wallets', data).then((r) => r.data),
  update: (id: string, data: Partial<CryptoWallet>) =>
    api.put<CryptoWallet>(`/crypto-wallets/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/crypto-wallets/${id}`).then((r) => r.data),
};

// ---- Wallet Funding ----
export const walletFundingApi = {
  create: (amount: number, cryptoWalletId: string) =>
    api.post<WalletFunding>('/wallet-funding', { amount, cryptoWalletId }).then((r) => r.data),
  submitProof: (id: string, proofImage: string) =>
    api.put<WalletFunding>(`/wallet-funding/${id}/proof`, { proofImage }).then((r) => r.data),
  mine: () => api.get<WalletFunding[]>('/wallet-funding/mine').then((r) => r.data),
  all: (status?: string) =>
    api.get<WalletFunding[]>('/wallet-funding', { params: status ? { status } : undefined }).then((r) => r.data),
  approve: (id: string) =>
    api.put<WalletFunding>(`/wallet-funding/${id}/approve`).then((r) => r.data),
  reject: (id: string, adminNote?: string) =>
    api.put<WalletFunding>(`/wallet-funding/${id}/reject`, { adminNote }).then((r) => r.data),
  adjust: (userId: string, amount: number, note?: string) =>
    api.post<User>('/wallet-funding/adjust', { userId, amount, note }).then((r) => r.data),
};
