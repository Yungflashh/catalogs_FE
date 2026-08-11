import { useEffect, useState } from 'react';
import { walletFundingApi, adminApi } from '../../api/services';
import { WalletFunding, User, CryptoWallet } from '../../types';
import { useToast } from '../../context/ToastContext';
import AdminLayout from './AdminLayout';
import { CheckIcon, CloseIcon } from '../../components/Icons';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const statusBadge: Record<string, string> = {
  pending: 'badge-warning',
  approved: 'badge-green',
  rejected: 'badge-danger',
};

export default function AdminFundingRequests() {
  const { notify } = useToast();
  const [requests, setRequests] = useState<WalletFunding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  // Manual adjust
  const [users, setUsers] = useState<User[]>([]);
  const [adjustUserId, setAdjustUserId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const [proofModal, setProofModal] = useState<string | null>(null);

  const load = (s: StatusFilter) => {
    setLoading(true);
    walletFundingApi.all(s === 'all' ? undefined : s)
      .then(setRequests)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);
  useEffect(() => { adminApi.users().then(setUsers); }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this funding request and credit the user\'s wallet?')) return;
    setProcessing(id);
    try {
      const updated = await walletFundingApi.approve(id);
      setRequests((prev) => prev.map((r) => r._id === id ? updated : r));
      notify('Funding approved — wallet credited');
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setProcessing(rejectId);
    try {
      const updated = await walletFundingApi.reject(rejectId, rejectNote);
      setRequests((prev) => prev.map((r) => r._id === rejectId ? updated : r));
      setRejectId(null);
      setRejectNote('');
      notify('Funding request rejected');
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(adjustAmount);
    if (!adjustUserId || !amount) { notify('Select a user and enter an amount', 'error'); return; }
    setAdjusting(true);
    try {
      const delta = adjustType === 'credit' ? amount : -amount;
      const result = await walletFundingApi.adjust(adjustUserId, delta, adjustNote || undefined);
      const u = result as any;
      notify(`Wallet ${adjustType}ed $${amount.toFixed(2)} for ${u.name ?? 'user'}. New balance: $${u.walletBalance?.toFixed(2)}`);
      setAdjustAmount('');
      setAdjustNote('');
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setAdjusting(false);
    }
  };

  const tabs: StatusFilter[] = ['pending', 'all', 'approved', 'rejected'];

  return (
    <AdminLayout title="Wallet Funding">
      {/* Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabs.map((t) => (
          <button
            key={t}
            className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(t)}
            style={{ textTransform: 'capitalize' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Requests table */}
      <div className="admin-panel glass" style={{ marginBottom: 28 }}>
        <h3 className="admin-panel-title" style={{ marginBottom: 18, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
          Funding requests
        </h3>
        {loading ? (
          <p style={{ padding: '16px 0', color: 'var(--text-faint)' }}>Loading…</p>
        ) : requests.length === 0 ? (
          <p style={{ padding: '16px 0', color: 'var(--text-faint)' }}>No {filter !== 'all' ? filter : ''} requests.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Wallet</th>
                  <th>Submitted</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Proof</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const u = typeof r.user === 'object' ? r.user : null;
                  const w = r.cryptoWallet as CryptoWallet;
                  const expired = new Date(r.expiresAt) < new Date();
                  return (
                    <tr key={r._id}>
                      <td>
                        {u ? (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{u.email}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--green)' }}>Balance: ${(u.walletBalance ?? 0).toFixed(2)}</div>
                          </div>
                        ) : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>${r.amount.toFixed(2)}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{w?.name ?? '—'}</div>
                        {w?.network && <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{w.network}</div>}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-faint)' }}>
                        {new Date(r.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: expired ? 'var(--danger)' : 'var(--text-faint)' }}>
                        {expired ? 'Expired' : new Date(r.expiresAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <span className={`badge ${statusBadge[r.status]}`}>{r.status}</span>
                        {r.adminNote && <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 3 }}>{r.adminNote}</div>}
                      </td>
                      <td>
                        {r.proofImage ? (
                          <button className="btn btn-ghost btn-sm" onClick={() => setProofModal(r.proofImage!)}>View</button>
                        ) : (
                          <span style={{ color: 'var(--text-faint)', fontSize: '0.82rem' }}>None</span>
                        )}
                      </td>
                      <td>
                        {r.status === 'pending' && (
                          <div className="tbl-actions">
                            <button
                              className="icon-action"
                              title="Approve"
                              disabled={processing === r._id}
                              onClick={() => handleApprove(r._id)}
                              style={{ color: 'var(--green)' }}
                            >
                              <CheckIcon size={15} />
                            </button>
                            <button
                              className="icon-action danger"
                              title="Reject"
                              disabled={processing === r._id}
                              onClick={() => { setRejectId(r._id); setRejectNote(''); }}
                            >
                              <CloseIcon size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual wallet adjustment */}
      <div className="admin-panel glass">
        <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', marginBottom: 18 }}>Manual wallet adjustment</h3>
        <form onSubmit={handleAdjust} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label">User</label>
            <select className="form-input status-select" style={{ width: '100%' }}
              value={adjustUserId} onChange={(e) => setAdjustUserId(e.target.value)} required>
              <option value="">Select user…</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '0 1 120px' }}>
            <label className="form-label">Type</label>
            <select className="form-input status-select" style={{ width: '100%' }}
              value={adjustType} onChange={(e) => setAdjustType(e.target.value as 'credit' | 'debit')}>
              <option value="credit">Credit (+)</option>
              <option value="debit">Debit (−)</option>
            </select>
          </div>
          <div style={{ flex: '0 1 120px' }}>
            <label className="form-label">Amount ($)</label>
            <input type="number" min="0.01" step="0.01" className="form-input" placeholder="0.00"
              value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} required />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label className="form-label">Note (optional)</label>
            <input type="text" className="form-input" placeholder="Reason…"
              value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={adjusting} style={{ height: 40 }}>
            {adjusting ? 'Applying…' : 'Apply'}
          </button>
        </form>
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setRejectId(null)}>
          <div className="modal glass" style={{ maxWidth: 420 }}>
            <div className="modal-head">
              <h3>Reject funding request</h3>
              <button className="modal-close" onClick={() => setRejectId(null)}><CloseIcon size={20} /></button>
            </div>
            <div>
              <label className="form-label">Reason (optional)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Reason shown to user…"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                style={{ resize: 'vertical', marginTop: 6 }}
              />
              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button className="btn btn-ghost" onClick={() => setRejectId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleReject} disabled={processing === rejectId}>
                  {processing === rejectId ? 'Rejecting…' : 'Reject request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proof image modal */}
      {proofModal && (
        <div className="modal-overlay" onClick={() => setProofModal(null)}>
          <div style={{ maxWidth: 700, width: '100%', padding: 12, position: 'relative' }}>
            <button onClick={() => setProofModal(null)}
              style={{ position: 'absolute', top: -8, right: 0, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', zIndex: 1 }}>✕</button>
            <img src={proofModal} alt="Payment proof" style={{ width: '100%', borderRadius: 12, maxHeight: '80vh', objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
