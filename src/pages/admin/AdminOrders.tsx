import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../../types';
import { orderApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Shared';
import AdminLayout from './AdminLayout';

const statuses = ['pending', 'paid', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { notify } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    orderApi.all().then(setOrders).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, status: string) => {
    try {
      const updated = await orderApi.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: updated.status } : o)));
      notify('Order status updated');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  return (
    <AdminLayout title="Orders">
      {loading ? <Loader /> : (
        <div className="admin-panel glass admin-table-wrap fade-up">
          <table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const cust = typeof o.user === 'object' ? o.user : null;
                return (
                  <tr key={o._id}>
                    <td><Link to={`/orders/${o._id}`} style={{ color: 'var(--cyan)' }}>#{o._id.slice(-6).toUpperCase()}</Link></td>
                    <td>
                      <div className="tbl-prod-name">{cust?.name || '—'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>{cust?.email}</div>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td>${o.totalPrice.toFixed(2)}</td>
                    <td>
                      <select
                        className={`select status-select`}
                        value={o.status}
                        onChange={(e) => changeStatus(o._id, e.target.value)}
                      >
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: 30 }}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
