import { ReactNode } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Loader = () => (
  <div className="center-load"><div className="spinner" /></div>
);

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const EmptyState = ({
  title, subtitle, action,
}: { title: string; subtitle: string; action?: { label: string; to: string } }) => (
  <div className="fade-up" style={{ textAlign: 'center', padding: '72px 0 48px' }}>
    <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8 }}>{title}</p>
    <p style={{ color: 'var(--text-faint)', fontSize: '0.88rem', marginBottom: action ? 24 : 0 }}>{subtitle}</p>
    {action && <Link to={action.to} className="btn btn-primary btn-sm">{action.label}</Link>}
  </div>
);

export const Footer = () => (
  <footer className="site-footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <div className="footer-brand-name">CATA<span>LOG</span></div>
          <p className="footer-tagline">
            The smartest way to browse, save, and track premium tech.
            Every item, fully logged.
          </p>
        </div>
        <div className="footer-col">
          <h4>Catalog</h4>
          <Link to="/shop">All logs</Link>
          <Link to="/shop">New entries</Link>
          <Link to="/shop">Categories</Link>
          <Link to="/wishlist">Saved list</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/orders">Purchase history</Link>
          <Link to="/account">Profile</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/register">Sign up</Link>
        </div>
        <div className="footer-col">
          <h4>Info</h4>
          <Link to="/">About</Link>
          <Link to="/">Security</Link>
          <Link to="/">Privacy</Link>
          <Link to="/">Terms</Link>
        </div>
      </div>
      <div className="footer-bar">
        <p>© {new Date().getFullYear()} CATALOG. All rights reserved.</p>
        <span className="footer-live">LIVE</span>
      </div>
    </div>
  </footer>
);
