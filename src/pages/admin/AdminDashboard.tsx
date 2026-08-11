import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminStats } from '../../types';
import { adminApi } from '../../api/services';
import { Loader } from '../../components/Shared';
import AdminLayout from './AdminLayout';
import { UsersIcon, BoxIcon, PackageCheck, ChartIcon } from '../../components/Icons';

const statusClass: Record<string, string> = {
  pending: 'badge-warning', paid: 'badge-cyan', shipped: 'badge-violet',
  delivered: 'badge-success', cancelled: 'badge-danger',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats().then(setStats).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading || !stats ? <Loader /> : (
        <>
          <div className="stat-grid">
            <div className="stat-card glass fade-up">
              <div className="stat-icon"><ChartIcon size={22} /></div>
              <div className="stat-value">${stats.revenue.toFixed(2)}</div>
              <div className="stat-label">Total revenue</div>
            </div>
            <div className="stat-card glass fade-up">
              <div className="stat-icon"><PackageCheck size={22} /></div>
              <div className="stat-value">{stats.orders}</div>
              <div className="stat-label">Orders</div>
            </div>
            <div className="stat-card glass fade-up">
              <div className="stat-icon"><BoxIcon size={22} /></div>
              <div className="stat-value">{stats.products}</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="stat-card glass fade-up">
              <div className="stat-icon"><UsersIcon size={22} /></div>
              <div className="stat-value">{stats.users}</div>
              <div className="stat-label">Customers</div>
            </div>
          </div>

          <div className="admin-cols">
            <div className="admin-panel glass fade-up">
              <h3>Recent orders</h3>
              {stats.recentOrders.length === 0 ? (
                <p style={{ color: 'var(--text-faint)' }}>No orders yet.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((o) => {
                        const cust = typeof o.user === 'object' ? o.user.name : '—';
                        return (
                          <tr key={o._id}>
                            <td><Link to={`/orders/${o._id}`} style={{ color: 'var(--cyan)' }}>#{o._id.slice(-6).toUpperCase()}</Link></td>
                            <td>{cust}</td>
                            <td><span className={`badge ${statusClass[o.status]}`}>{o.status}</span></td>
                            <td>${o.totalPrice.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-panel glass fade-up">
              <h3>Low stock alert</h3>
              {stats.lowStock.length === 0 ? (
                <p style={{ color: 'var(--text-faint)' }}>All products well stocked.</p>
              ) : (
                <div className="low-list">
                  {stats.lowStock.map((p) => (
                    <div key={p._id} className="low-item">
                      <span>{p.name}</span>
                      <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>{p.stock} left</span>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/admin/products" className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 18 }}>
                Manage products
              </Link>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
