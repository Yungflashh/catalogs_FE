import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order } from '../types';
import { orderApi } from '../api/services';
import { Loader, EmptyState } from '../components/Shared';
import { CheckIcon, BoxIcon, ArrowRight } from '../components/Icons';
import './OrderDetail.css';

const statusColor: Record<string, string> = {
  pending: 'badge-warning',
  paid: 'badge-green',
  shipped: 'badge-violet',
  delivered: 'badge-cyan',
  cancelled: 'badge-danger',
};

const steps = [
  { key: 'pending',   label: 'Order placed',  desc: 'Your order has been received' },
  { key: 'paid',      label: 'Payment confirmed', desc: 'Wallet balance deducted' },
  { key: 'delivered', label: 'Delivered',     desc: 'Access your digital logs' },
];

function stepIndex(status: string) {
  if (status === 'cancelled') return -1;
  const i = steps.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!id) return;
    orderApi.get(id).then(setOrder).catch(() => setErr(true)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (err || !order)
    return (
      <div className="container">
        <EmptyState title="Order not found" subtitle="We couldn't find this order." action={{ label: 'View all orders', to: '/orders' }} />
      </div>
    );

  const activeStep = stepIndex(order.status);
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="container">
      <div className="od-wrap">

        {/* ── Back ── */}
        <Link to="/orders" className="od-back">← Back to orders</Link>

        {/* ── Header ── */}
        <div className="od-header fade-up">
          <div className="od-header-left">
            <div className="od-order-label">Order</div>
            <h1 className="od-order-num">#{order._id.slice(-8).toUpperCase()}</h1>
            <p className="od-date">
              Placed {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              {' '}at{' '}
              {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`badge od-status-badge ${statusColor[order.status] || 'badge-green'}`}>
            {order.status}
          </span>
        </div>

        {/* ── Status tracker ── */}
        {order.status !== 'cancelled' ? (
          <div className="od-track glass fade-up">
            {steps.map((s, i) => {
              const done = i <= activeStep;
              const current = i === activeStep;
              return (
                <div key={s.key} className="od-step-wrap">
                  <div className={`od-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                    <div className="od-dot">
                      {done ? <CheckIcon size={14} /> : <span>{i + 1}</span>}
                    </div>
                    <div className="od-step-text">
                      <span className="od-step-label">{s.label}</span>
                      <span className="od-step-desc">{s.desc}</span>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`od-connector ${i < activeStep ? 'done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="od-cancelled glass fade-up">
            <span className="badge badge-danger" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>Order cancelled</span>
            <p>This order was cancelled. If you were charged, a refund was issued to your wallet.</p>
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="od-grid">

          {/* Items */}
          <div className="od-items glass fade-up">
            <div className="od-items-head">
              <h3>Items <span className="od-items-count">{itemCount}</span></h3>
            </div>
            <div className="od-item-list">
              {order.items.map((it, i) => (
                <div key={i} className="od-item">
                  <div className="od-item-img">
                    <img src={it.image || `https://picsum.photos/seed/${it.product}/120/120`} alt={it.name} />
                  </div>
                  <div className="od-item-info">
                    <span className="od-item-name">{it.name}</span>
                    <span className="od-item-meta">Qty {it.quantity} × ${it.price.toFixed(2)}</span>
                  </div>
                  <span className="od-item-total">${(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary + actions */}
          <aside className="od-side">
            <div className="glass od-summary fade-up">
              <h3 className="od-summary-title">Summary</h3>

              <div className="od-sum-rows">
                <div className="od-sum-row">
                  <span>Items</span>
                  <span>{itemCount}</span>
                </div>
                <div className="od-sum-row">
                  <span>Payment</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="od-sum-row">
                  <span>Delivery</span>
                  <span className="badge badge-green">Digital</span>
                </div>
              </div>

              <div className="od-sum-divider" />

              <div className="od-sum-total">
                <span>Total</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {order.status === 'delivered' && (
              <div className="glass od-access fade-up">
                <div className="od-access-icon"><BoxIcon size={22} /></div>
                <div>
                  <p className="od-access-title">Logs ready</p>
                  <p className="od-access-sub">Your digital logs are available to access.</p>
                </div>
                <ArrowRight size={18} className="od-access-arrow" />
              </div>
            )}

            <Link to="/orders" className="od-all-link">View all orders</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
