import { ReactNode, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  GridIcon, BoxIcon, PackageCheck, UsersIcon, CoinIcon, WalletIcon,
  MenuIcon, CloseIcon,
} from '../../components/Icons';
import './Admin.css';

const links = [
  { to: '/admin', label: 'Dashboard', icon: GridIcon, end: true },
  { to: '/admin/products', label: 'Products', icon: BoxIcon, end: false },
  { to: '/admin/orders', label: 'Orders', icon: PackageCheck, end: false },
  { to: '/admin/users', label: 'Users', icon: UsersIcon, end: false },
  { to: '/admin/crypto-wallets', label: 'Crypto Wallets', icon: CoinIcon, end: false },
  { to: '/admin/funding', label: 'Funding', icon: WalletIcon, end: false },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="admin-brand">
        <span className="brand-mark">C</span>
        <div>
          <div className="admin-brand-name">CATALOG</div>
          <div className="admin-brand-sub">Admin console</div>
        </div>
      </div>
      <nav className="admin-nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} onClick={onNavigate}
            className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <l.icon size={18} /> {l.label}
          </NavLink>
        ))}
      </nav>
      <NavLink to="/" className="admin-link admin-back" onClick={onNavigate}>← Back to store</NavLink>
    </>
  );
}

export default function AdminLayout({ title, action, children }: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setDrawer(false); }, [pathname]);

  useEffect(() => {
    if (drawer) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawer(false); };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [drawer]);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <SidebarContent />
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <button
            className="admin-hamburger"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
          >
            <MenuIcon size={22} />
          </button>
          <h1>{title}</h1>
          {action}
        </div>
        <div className="admin-content">{children}</div>
      </div>

      {drawer && createPortal(
        <>
          <div className="admin-drawer-backdrop" onClick={() => setDrawer(false)} />
          <aside className="admin-drawer" role="dialog" aria-label="Admin navigation">
            <button
              className="admin-drawer-close"
              onClick={() => setDrawer(false)}
              aria-label="Close menu"
            >
              <CloseIcon size={22} />
            </button>
            <SidebarContent onNavigate={() => setDrawer(false)} />
          </aside>
        </>,
        document.body
      )}
    </div>
  );
}
