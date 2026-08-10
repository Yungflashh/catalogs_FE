import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/services';
import { ArrowRight, WalletIcon, BoxIcon } from '../components/Icons';
import './Account.css';

export default function Account() {
  const { user, setUser, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [name, setName]       = useState(user?.name || '');
  const [email, setEmail]     = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [busy, setBusy]       = useState(false);

  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const balance  = user?.walletBalance ?? 0;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: { name: string; email: string; password?: string } = { name, email };
      if (password) payload.password = password;
      const updated = await authApi.updateProfile(payload);
      setUser({ ...updated, token: updated.token || user?.token });
      setPassword('');
      notify('Profile updated');
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="account-wrap">

        {/* ── Profile hero ── */}
        <div className="acc-hero glass fade-up">
          <div className="acc-avatar">{initials}</div>
          <div className="acc-identity">
            <h1 className="acc-name">{user?.name}</h1>
            <p className="acc-email">{user?.email}</p>
            <span className={`badge ${user?.role === 'admin' ? 'badge-violet' : 'badge-cyan'}`}>
              {user?.role}
            </span>
          </div>
          <div className="acc-meta">
            <div className="acc-meta-item">
              <span className="acc-meta-val">${balance.toFixed(2)}</span>
              <span className="acc-meta-label">Wallet balance</span>
            </div>
            <div className="acc-meta-divider" />
            <div className="acc-meta-item">
              <span className="acc-meta-val">{memberSince}</span>
              <span className="acc-meta-label">Member since</span>
            </div>
          </div>
        </div>

        <div className="acc-body">
          {/* ── Edit form ── */}
          <div className="glass acc-form-card fade-up">
            <h2 className="acc-section-title">Edit profile</h2>

            <form onSubmit={submit} className="acc-form">
              <div className="acc-field-row">
                <div className="acc-field">
                  <label className="acc-label">Full name</label>
                  <input
                    className="acc-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="acc-field">
                  <label className="acc-label">Email address</label>
                  <input
                    className="acc-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="acc-field">
                <label className="acc-label">
                  New password
                  <button type="button" className="acc-toggle-pw" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? 'Hide' : 'Change password'}
                  </button>
                </label>
                {showPw && (
                  <input
                    className="acc-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                )}
              </div>

              <div className="acc-form-foot">
                <button className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Save changes'}
                </button>
                <button type="button" className="btn btn-ghost acc-logout"
                  onClick={() => { logout(); navigate('/'); }}>
                  Sign out
                </button>
              </div>
            </form>
          </div>

          {/* ── Quick links ── */}
          <div className="acc-links">
            <Link to="/wallet" className="acc-link glass fade-up">
              <div className="acc-link-icon acc-link-green"><WalletIcon size={20} /></div>
              <div className="acc-link-body">
                <span className="acc-link-title">Wallet</span>
                <span className="acc-link-sub">${balance.toFixed(2)} available · Fund or view history</span>
              </div>
              <ArrowRight size={16} className="acc-link-arrow" />
            </Link>

            <Link to="/orders" className="acc-link glass fade-up">
              <div className="acc-link-icon acc-link-violet"><BoxIcon size={20} /></div>
              <div className="acc-link-body">
                <span className="acc-link-title">Purchase history</span>
                <span className="acc-link-sub">View all your past orders</span>
              </div>
              <ArrowRight size={16} className="acc-link-arrow" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
