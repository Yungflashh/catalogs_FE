import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Footer, ProtectedRoute, AdminRoute } from './components/Shared';
import SplashScreen from './components/SplashScreen';
import ScrollDebug from './components/ScrollDebug';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // iOS Safari can ignore scrollTo if fired synchronously during a route
    // transition. Defer to the next frame so the new page has committed first.
    const id = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(id);
  }, [pathname]);
  return null;
}

import Landing from './pages/Landing';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Account from './pages/Account';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCryptoWallets from './pages/admin/AdminCryptoWallets';
import AdminFundingRequests from './pages/admin/AdminFundingRequests';
import FundWallet from './pages/FundWallet';
import NotFound from './pages/NotFound';

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const [ready, setReady] = useState(false);

  const handleSplashDone = useCallback(() => {
    setReady(true);
    // iOS Safari can retain a scroll-locked state after a fixed overlay
    // (the splash) unmounts. Nudging scroll on the next frame forces the
    // browser to reset its touch scroll gesture handler.
    requestAnimationFrame(() => {
      window.scrollTo(window.scrollX, window.scrollY);
    });
  }, []);

  return (
    <>
      <ScrollDebug />
      {!ready && <SplashScreen onDone={handleSplashDone} />}
      <ScrollToTop />
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 68px)' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/wallet/fund" element={<ProtectedRoute><FundWallet /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/crypto-wallets" element={<AdminRoute><AdminCryptoWallets /></AdminRoute>} />
          <Route path="/admin/funding" element={<AdminRoute><AdminFundingRequests /></AdminRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
