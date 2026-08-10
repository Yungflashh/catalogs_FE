import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import { orderApi } from '../api/services';
import { Loader, EmptyState } from '../components/Shared';
import { ArrowRight } from '../components/Icons';
import './Orders.css';

const statusClass: Record<string, string> = {
  pending: 'badge-warning', paid: 'badge-cyan', shipped: 'badge-violet',
  delivered: 'badge-success', cancelled: 'badge-danger',
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.mine().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="container" style={{ paddingTop: 72, paddingBottom: 80 }}>
      <h1 className="page-title" style={{ marginBottom: 28 }}>Purchase history</h1>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" subtitle="Your completed purchases will appear here."
          action={{ label: 'Start shopping', to: '/shop' }} />
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <Link to={`/orders/${o._id}`} key={o._id} className="order-row glass fade-up">
              <div className="order-thumbs">
                {o.items.slice(0, 3).map((it, i) => (
                  <img key={i} src={it.image || `https://picsum.photos/seed/${it.product}/100/100`} alt={it.name} style={{ zIndex: 3 - i }} />
                ))}
                {o.items.length > 3 && <span className="order-more">+{o.items.length - 3}</span>}
              </div>
              <div className="order-meta">
                <div className="order-id">Order #{o._id.slice(-8).toUpperCase()}</div>
                <div className="order-date">{new Date(o.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} · {o.items.length} item{o.items.length !== 1 ? 's' : ''}</div>
              </div>
              <span className={`badge ${statusClass[o.status]}`}>{o.status}</span>
              <div className="order-total">${o.totalPrice.toFixed(2)}</div>
              <ArrowRight size={17} className="order-arrow" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
