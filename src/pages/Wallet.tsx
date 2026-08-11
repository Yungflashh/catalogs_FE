import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderApi, walletFundingApi, authApi } from '../api/services';
import { Order, WalletFunding, CryptoWallet } from '../types';
import { Loader } from '../components/Shared';
import { ArrowRight, ClockIcon, CheckCircleIcon } from '../components/Icons';
import './Wallet.css';

const fundingBadge: Record<string, string> = {
  pending: 'badge-warning',
  approved: 'badge-green',
  rejected: 'badge-danger',
};

export default function Wallet() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fundings, setFundings] = useState<WalletFunding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authApi.profile().then((fresh) => setUser({ ...fresh, token: user?.token })),
      orderApi.mine().then(setOrders),
      walletFundingApi.mine().then(setFundings),
    ]).finally(() => setLoading(false));
  }, []);

  const balance = user?.walletBalance ?? 0;
  const totalSpent = orders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.totalPrice : 0), 0);
  const totalFunded = fundings
    .filter((f) => f.status === 'approved')
    .reduce((s, f) => s + f.amount, 0);

  // Merge orders + fundings into unified timeline
  type TxnEntry =
    | { kind: 'order'; data: Order }
    | { kind: 'funding'; data: WalletFunding };

  const txns: TxnEntry[] = [
    ...orders.map((o): TxnEntry => ({ kind: 'order', data: o })),
    ...fundings.map((f): TxnEntry => ({ kind: 'funding', data: f })),
  ].sort((a, b) => {
    const aDate = a.kind === 'order' ? a.data.createdAt : a.data.createdAt;
    const bDate = b.kind === 'order' ? b.data.createdAt : b.data.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  const pendingFunding = fundings.filter((f) => f.status === 'pending');

  return (
    <div className="container">
      <div className="wallet-page-wrap">
        <div className="wallet-page-header">
          <h1 className="page-title">Wallet</h1>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/wallet/fund')}>
            + Fund wallet
          </button>
        </div>

        <div className="wallet-top fade-up">
          <div className="wallet-balance-card glass">
            <p className="wbc-label">Available balance</p>
            <p className="wbc-amount">${balance.toFixed(2)}</p>
            <p className="wbc-sub">Deducted automatically at checkout</p>
          </div>
          <div className="wallet-stat-card glass">
            <p className="wbc-label">Total funded</p>
            <p className="wbc-amount wbc-amount-dim">${totalFunded.toFixed(2)}</p>
            <p className="wbc-sub">${totalSpent.toFixed(2)} spent on {orders.filter(o => o.status !== 'cancelled').length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Pending funding alerts */}
        {pendingFunding.length > 0 && (
          <div className="wallet-pending-alert glass fade-up">
            <ClockIcon size={16} />
            <span>
              {pendingFunding.length} funding request{pendingFunding.length > 1 ? 's' : ''} pending approval.
              Your wallet will be credited once verified.
            </span>
            <Link to="/wallet/fund" style={{ color: 'var(--violet)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              Fund again <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <div className="wallet-history fade-up">
          <h2 className="wallet-history-title">Transaction history</h2>

          {loading ? <Loader /> : txns.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-faint)' }}>
              No transactions yet.{' '}
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/wallet/fund')} style={{ marginLeft: 8 }}>
                Fund your wallet
              </button>
            </div>
          ) : (
            <div className="wallet-txn-list">
              {txns.map((entry) => {
                if (entry.kind === 'order') {
                  const o = entry.data;
                  const cancelled = o.status === 'cancelled';
                  return (
                    <Link key={`o-${o._id}`} to={`/orders/${o._id}`} className="wallet-txn glass">
                      <div className="wallet-txn-left">
                        <div className="wallet-txn-icon">🛍</div>
                        <div>
                          <p className="wallet-txn-id">Order #{o._id.slice(-8).toUpperCase()}</p>
                          <p className="wallet-txn-date">{new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="wallet-txn-right">
                        <span className={`wallet-txn-amount ${cancelled ? 'wallet-txn-cancelled' : ''}`}>
                          {cancelled ? '' : '−'}${o.totalPrice.toFixed(2)}
                        </span>
                        <span className={`badge badge-${o.status === 'paid' || o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'danger' : 'warning'}`}>{o.status}</span>
                      </div>
                    </Link>
                  );
                }

                const f = entry.data;
                const w = f.cryptoWallet as CryptoWallet;
                return (
                  <div key={`f-${f._id}`} className="wallet-txn glass">
                    <div className="wallet-txn-left">
                      <div className="wallet-txn-icon">
                        {f.status === 'approved' ? <CheckCircleIcon size={18} /> : f.status === 'rejected' ? '✕' : <ClockIcon size={18} />}
                      </div>
                      <div>
                        <p className="wallet-txn-id">Deposit via {w?.symbol ?? 'Crypto'}</p>
                        <p className="wallet-txn-date">{new Date(f.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        {f.status === 'rejected' && f.adminNote && (
                          <p className="wallet-txn-date" style={{ color: 'var(--danger)' }}>{f.adminNote}</p>
                        )}
                      </div>
                    </div>
                    <div className="wallet-txn-right">
                      <span className={`wallet-txn-amount ${f.status === 'rejected' ? 'wallet-txn-cancelled' : ''} ${f.status === 'approved' ? 'wallet-txn-credit' : ''}`}>
                        {f.status === 'approved' ? '+' : ''}${f.amount.toFixed(2)}
                      </span>
                      <span className={`badge ${fundingBadge[f.status]}`}>{f.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
