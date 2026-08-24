import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import {
  CartIcon, HeartIcon, SearchIcon, MenuIcon, CloseIcon, UserIcon,
  BoxIcon, LogoutIcon, GridIcon,
} from './Icons';
import { Sun, Moon } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount } = useShop();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('cat_theme') as 'dark' | 'light') || 'dark'
  );

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('cat_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/shop?keyword=${encodeURIComponent(term.trim())}`);
    setDrawer(false);
  };

  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">C</span>CATALOG
        </Link>

        <form className="nav-search" onSubmit={submit}>
          <SearchIcon size={18} />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search logs..."
            aria-label="Search logs"
          />
        </form>

        <nav className="nav-links">
          <NavLink to="/shop" className="nav-link">Shop</NavLink>
          {user && <NavLink to="/orders" className="nav-link">Orders</NavLink>}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-link">Admin</NavLink>
          )}

          <button className="icon-btn theme-toggle hide-xs" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to="/wishlist" className="icon-btn hide-xs" aria-label="Wishlist">
            <HeartIcon size={19} />
            {wishlistCount > 0 && <span className="count-bubble">{wishlistCount}</span>}
          </Link>
          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <CartIcon size={19} />
            {cartCount > 0 && <span className="count-bubble">{cartCount}</span>}
          </Link>

          {user ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button className="avatar" onClick={() => setMenuOpen((o) => !o)} aria-label="Account menu">
                {initials}
              </button>
              {menuOpen && (
                <div className="menu-pop">
                  <div className="menu-head">
                    <div className="n">{user.name}</div>
                    <div className="e">{user.email}</div>
                  </div>
                  <div className="menu-wallet">
                    <span className="menu-wallet-label">Wallet balance</span>
                    <span className="menu-wallet-amount">${(user.walletBalance ?? 0).toFixed(2)}</span>
                  </div>
                  <button className="menu-item" onClick={() => { navigate('/wallet'); setMenuOpen(false); }}>
                    <UserIcon size={17} /> Wallet
                  </button>
                  <button className="menu-item" onClick={() => { navigate('/account'); setMenuOpen(false); }}>
                    <UserIcon size={17} /> My Account
                  </button>
                  <button className="menu-item" onClick={() => { navigate('/orders'); setMenuOpen(false); }}>
                    <BoxIcon size={17} /> Purchase History
                  </button>
                  {user.role === 'admin' && (
                    <button className="menu-item" onClick={() => { navigate('/admin'); setMenuOpen(false); }}>
                      <GridIcon size={17} /> Dashboard
                    </button>
                  )}
                  <button className="menu-item" onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}>
                    <LogoutIcon size={17} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" style={{ marginLeft: 4 }}>
              Sign in
            </Link>
          )}

          <button className="icon-btn hamburger" onClick={() => setDrawer((d) => !d)} aria-label="Menu">
            {drawer ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </nav>
      </div>

      {drawer && (
        <div className="mobile-drawer">
          <form className="nav-search mobile-only" onSubmit={submit} style={{ display: 'flex', maxWidth: '100%', marginBottom: 10 }}>
            <SearchIcon size={18} />
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search logs..." />
          </form>
          <NavLink to="/shop" className="nav-link" onClick={() => setDrawer(false)}>Shop</NavLink>
          <NavLink to="/wishlist" className="nav-link" onClick={() => setDrawer(false)}>Wishlist</NavLink>
          <NavLink to="/cart" className="nav-link" onClick={() => setDrawer(false)}>Cart</NavLink>
          {user && <NavLink to="/orders" className="nav-link" onClick={() => setDrawer(false)}>Purchase History</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className="nav-link" onClick={() => setDrawer(false)}>Admin</NavLink>}
          {!user && <NavLink to="/login" className="nav-link" onClick={() => setDrawer(false)}>Sign in</NavLink>}
        </div>
      )}
    </header>
  );
}
