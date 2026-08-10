import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderApi, authApi } from '../api/services';
import { EmptyState } from '../components/Shared';
import { WalletIcon, ArrowRight } from '../components/Icons';
import './Cart.css';
import './Checkout.css';

export default function Checkout() {
  const { cart, refresh } = useShop();
  const { user, setUser } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const balance = user?.walletBalance ?? 0;
  const sufficient = balance >= total;

  const [busy, setBusy] = useState(false);

  if (items.length === 0)
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <EmptyState title="Nothing to check out" subtitle="Your cart is empty." action={{ label: 'Go to shop', to: '/shop' }} />
      </div>
    );

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sufficient) {
      notify('Insufficient wallet balance. Please fund your wallet first.', 'error');
      return;
    }
    setBusy(true);
    try {
      const order = await orderApi.create('Wallet');
      // Refresh both cart state and user wallet balance in parallel
      const [fresh] = await Promise.all([authApi.profile(), refresh()]);
      setUser({ ...fresh, token: user?.token });
      notify('Order placed successfully!');
      navigate(`/orders/${order._id}`);
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="cart-wrap">
        <h1 className="page-title" style={{ marginBottom: 24 }}>Checkout</h1>
        <form className="cart-grid" onSubmit={placeOrder}>
          <div className="checkout-forms">
            {/* Wallet balance section */}
            <section className="glass checkout-section fade-up">
              <h3>Payment — Wallet</h3>
              <div className="checkout-balance-row">
                <div className="checkout-balance-left">
                  <WalletIcon size={18} />
                  <span>Your wallet balance</span>
                </div>
                <span className={`checkout-balance-amount ${sufficient ? '' : 'insufficient'}`}>
                  ${balance.toFixed(2)}
                </span>
              </div>
              {!sufficient && (
                <div className="checkout-insufficient">
                  <p>You need <strong>${total.toFixed(2)}</strong> but only have <strong>${balance.toFixed(2)}</strong>.</p>
                  <Link to="/wallet/fund" className="btn btn-primary btn-sm">
                    Fund wallet — add ${(total - balance).toFixed(2)} or more
                  </Link>
                </div>
              )}
            </section>

            <section className="glass checkout-section checkout-digital fade-up">
              <div className="digital-badge">
                <span className="badge badge-green">Digital delivery</span>
              </div>
              <p className="digital-info">
                All products are digital. Your purchase will be available instantly after checkout — no shipping required.
              </p>
            </section>
          </div>

          <aside className="cart-summary glass fade-up">
            <h3>Order summary</h3>
            <div className="checkout-items">
              {items.map((i) => (
                <div key={i.product._id} className="checkout-line">
                  <span>{i.quantity} × {i.product.name}</span>
                  <span>${(i.product.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="sum-divider" />
            <div className="sum-row"><span>Delivery</span><span className="badge badge-green">Free</span></div>
            <div className="sum-divider" />
            <div className="sum-row sum-total"><span>Total</span><span>${total.toFixed(2)}</span></div>

            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 18 }}
              disabled={busy || !sufficient}
              title={!sufficient ? 'Insufficient wallet balance' : undefined}
            >
              {busy ? 'Placing order…' : sufficient ? `Place order · $${total.toFixed(2)}` : 'Insufficient balance'}
              {!busy && sufficient && <ArrowRight size={16} />}
            </button>

            {!sufficient && (
              <Link to="/wallet/fund" className="cart-continue" style={{ marginTop: 12, color: 'var(--violet)' }}>
                Fund your wallet →
              </Link>
            )}
          </aside>
        </form>
      </div>
    </div>
  );
}
