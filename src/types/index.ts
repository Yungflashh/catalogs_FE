export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  walletBalance: number;
  token?: string;
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  featured: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
}

export interface Wishlist {
  _id?: string;
  user: string;
  products: Product[];
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  items: OrderItem[];
  paymentMethod: string;
  totalPrice: number;
  status: 'pending' | 'paid' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

export interface AdminStats {
  users: number;
  products: number;
  orders: number;
  revenue: number;
  recentOrders: Order[];
  lowStock: { _id: string; name: string; stock: number }[];
}

export interface CryptoWallet {
  _id: string;
  name: string;
  symbol: string;
  address: string;
  network?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface WalletFunding {
  _id: string;
  user: string | { _id: string; name: string; email: string; walletBalance: number };
  amount: number;
  cryptoWallet: CryptoWallet;
  status: 'pending' | 'approved' | 'rejected';
  proofImage?: string;
  expiresAt: string;
  adminNote?: string;
  createdAt: string;
}
