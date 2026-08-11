import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { GridIcon, BoxIcon, PackageCheck, UsersIcon, CoinIcon, WalletIcon } from '../../components/Icons';
import './Admin.css';

const links = [
  { to: '/admin', label: 'Dashboard', icon: GridIcon, end: true },
  { to: '/admin/products', label: 'Products', icon: BoxIcon, end: false },
  { to: '/admin/orders', label: 'Orders', icon: PackageCheck, end: false },
  { to: '/admin/users', label: 'Users', icon: UsersIcon, end: false },
  { to: '/admin/crypto-wallets', label: 'Crypto Wallets', icon: CoinIcon, end: false },
  { to: '/admin/funding', label: 'Funding', icon: WalletIcon, end: false },
];

export default function AdminLayout({ title, action, children }: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark">C</span>
          <div>
            <div className="admin-brand-name">CATALOG</div>
            <div className="admin-brand-sub">Admin console</div>
          </div>
        </div>
        <nav className="admin-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
              <l.icon size={18} /> {l.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/" className="admin-link admin-back">← Back to store</NavLink>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <h1>{title}</h1>
          {action}
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
