import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Footer, ProtectedRoute, AdminRoute } from './components/Shared';
import SplashScreen from './components/SplashScreen';
import ScrollDebugHUD from './components/ScrollDebugHUD';
import ChatWidget from './components/ChatWidget';
import { trackApi } from './api/services';

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

// Fire a single visitor ping per browser session so admins get a Telegram
// notification on a real visit (not on every SPA route change or refresh).
// Uses sessionStorage: cleared when the tab closes, so a new tab / new day
// counts as a new session.
function VisitorPing() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (sessionStorage.getItem('cat_visited') === '1') return;
      sessionStorage.setItem('cat_visited', '1');
    } catch {
      // Private mode may throw on setItem — ignore, best-effort tracking.
    }
    // Defer past first paint so the ping never competes with initial render.
    const id = setTimeout(() => {
      trackApi.visit(window.location.pathname, document.referrer || '');
    }, 800);
    return () => clearTimeout(id);
  }, []);
  return null;
}

// Register empty passive touch listeners on window. iOS Safari otherwise
// treats touch events as potentially blocking (waits to see if the page
// calls preventDefault) which can cost the first scroll gesture on load.
// Explicit passive:true tells iOS to commit to the fast scroll path.
function IOSScrollHint() {
  useEffect(() => {
    const noop = () => {};
    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener('touchstart', noop, opts);
    window.addEventListener('touchmove', noop, opts);
    window.addEventListener('touchend', noop, opts);
    return () => {
      window.removeEventListener('touchstart', noop, opts);
      window.removeEventListener('touchmove', noop, opts);
      window.removeEventListener('touchend', noop, opts);
    };
  }, []);
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
      {!ready && <SplashScreen onDone={handleSplashDone} />}
      <IOSScrollHint />
      <VisitorPing />
      <ScrollToTop />
      {typeof window !== 'undefined' && window.location.search.includes('debug=1') && <ScrollDebugHUD />}
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 68px)' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/hello" element={
            <div style={{ padding: 20, minHeight: '250vh' }}>
              <h1>Scroll test</h1>
              <p>If this page scrolls immediately with no hang, the problem is inside Landing.tsx.</p>
              <p>If this also hangs 1-2s before scrolling on iOS Safari, the problem is in the App shell (Navbar, ChatWidget, splash, or global CSS).</p>
              <p style={{ marginTop: 200 }}>scroll marker 1</p>
              <p style={{ marginTop: 400 }}>scroll marker 2</p>
              <p style={{ marginTop: 400 }}>scroll marker 3 — end</p>
            </div>
          } />
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
      {!isAdmin && <ChatWidget />}
    </>
  );
}
