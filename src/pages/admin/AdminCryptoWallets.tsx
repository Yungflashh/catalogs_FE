import { useEffect, useState } from 'react';
import { cryptoWalletApi } from '../../api/services';
import { CryptoWallet } from '../../types';
import { useToast } from '../../context/ToastContext';
import AdminLayout from './AdminLayout';
import { EditIcon, TrashIcon, PlusIcon, CloseIcon } from '../../components/Icons';

const emptyForm = { name: '', symbol: '', address: '', network: '', isActive: true };

export default function AdminCryptoWallets() {
  const { notify } = useToast();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CryptoWallet | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    cryptoWalletApi.all().then(setWallets).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (w: CryptoWallet) => {
    setEditing(w);
    setForm({ name: w.name, symbol: w.symbol, address: w.address, network: w.network || '', isActive: w.isActive });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await cryptoWalletApi.update(editing._id, form);
        setWallets((prev) => prev.map((w) => w._id === updated._id ? updated : w));
        notify('Wallet updated');
      } else {
        const created = await cryptoWalletApi.create(form);
        setWallets((prev) => [created, ...prev]);
        notify('Wallet added');
      }
      setShowModal(false);
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this wallet?')) return;
    try {
      await cryptoWalletApi.remove(id);
      setWallets((prev) => prev.filter((w) => w._id !== id));
      notify('Wallet removed');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const handleToggle = async (w: CryptoWallet) => {
    try {
      const updated = await cryptoWalletApi.update(w._id, { isActive: !w.isActive });
      setWallets((prev) => prev.map((x) => x._id === updated._id ? updated : x));
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  return (
    <AdminLayout
      title="Crypto Wallets"
      action={
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <PlusIcon size={16} /> Add wallet
        </button>
      }
    >
      <div className="admin-panel glass">
        {loading ? (
          <p style={{ padding: 24, color: 'var(--text-faint)' }}>Loading…</p>
        ) : wallets.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--text-faint)' }}>No crypto wallets configured. Add one to allow users to fund their wallets.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Network</th>
                  <th>Address</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((w) => (
                  <tr key={w._id}>
                    <td style={{ fontWeight: 600 }}>{w.name}</td>
                    <td>
                      <span className="badge badge-violet">{w.symbol}</span>
                    </td>
                    <td style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>
                      {w.network || '—'}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {w.address.slice(0, 20)}…
                      </span>
                    </td>
                    <td>
                      <button
                        className={`badge ${w.isActive ? 'badge-green' : 'badge-danger'}`}
                        style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                        onClick={() => handleToggle(w)}
                      >
                        {w.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <button className="icon-action" onClick={() => openEdit(w)} title="Edit">
                          <EditIcon size={15} />
                        </button>
                        <button className="icon-action danger" onClick={() => handleDelete(w._id)} title="Delete">
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal glass">
            <div className="modal-head">
              <h3>{editing ? 'Edit wallet' : 'Add crypto wallet'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><CloseIcon size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div>
                  <label className="form-label">Name</label>
                  <input className="form-input" placeholder="e.g. Bitcoin" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">Symbol</label>
                  <input className="form-input" placeholder="e.g. BTC" value={form.symbol}
                    onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))} required />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label className="form-label">Wallet address</label>
                <input className="form-input" placeholder="Full wallet address" value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required />
              </div>
              <div style={{ marginTop: 14 }}>
                <label className="form-label">Network (optional)</label>
                <input className="form-input" placeholder="e.g. TRC20, ERC20, BEP20" value={form.network}
                  onChange={(e) => setForm((f) => ({ ...f, network: e.target.value }))} />
              </div>
              <div className="checkbox-field" style={{ marginTop: 16 }}>
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                <label htmlFor="isActive" style={{ fontSize: '0.9rem' }}>Active (visible to users)</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Add wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
