import { useEffect, useState } from 'react';
import { socialProofApi } from '../../api/services';
import { SocialProofEntry, SocialProofConfig } from '../../types';
import { useToast } from '../../context/ToastContext';
import AdminLayout from './AdminLayout';
import { EditIcon, TrashIcon, PlusIcon, CloseIcon } from '../../components/Icons';

const emptyForm = { name: '', location: '', product: '', amount: '', visible: true };

export default function AdminSocialProof() {
  const { notify } = useToast();
  const [entries, setEntries] = useState<SocialProofEntry[]>([]);
  const [config, setConfig] = useState<SocialProofConfig>({ enabled: true, rotationMs: 8000 });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SocialProofEntry | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([socialProofApi.list(), socialProofApi.config()])
      .then(([list, cfg]) => {
        setEntries(list);
        setConfig(cfg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (e: SocialProofEntry) => {
    setEditing(e);
    setForm({
      name: e.name, location: e.location, product: e.product,
      amount: String(e.amount), visible: e.visible,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      product: form.product.trim(),
      amount: Number(form.amount),
      visible: form.visible,
    };
    try {
      if (editing) {
        const updated = await socialProofApi.update(editing._id, payload);
        setEntries((prev) => prev.map((x) => x._id === updated._id ? updated : x));
        notify('Entry updated');
      } else {
        const created = await socialProofApi.create(payload);
        setEntries((prev) => [created, ...prev]);
        notify('Entry added');
      }
      setShowModal(false);
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await socialProofApi.remove(id);
      setEntries((prev) => prev.filter((x) => x._id !== id));
      notify('Entry removed');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const handleToggleVisible = async (e: SocialProofEntry) => {
    try {
      const updated = await socialProofApi.update(e._id, { visible: !e.visible });
      setEntries((prev) => prev.map((x) => x._id === updated._id ? updated : x));
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const handleToggleWidget = async () => {
    try {
      const next = await socialProofApi.updateConfig({ enabled: !config.enabled });
      setConfig(next);
      notify(next.enabled ? 'Widget enabled' : 'Widget disabled');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const handleRotationChange = async (ms: number) => {
    try {
      const next = await socialProofApi.updateConfig({ rotationMs: ms });
      setConfig(next);
      notify('Rotation speed saved');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const handleSeed = async () => {
    if (entries.length > 0 && !confirm('This will replace all existing entries with the default 30 seed entries. Continue?')) return;
    setSeeding(true);
    try {
      const res = await socialProofApi.seed(entries.length > 0);
      notify(res.message || `Seeded ${res.seeded} entries`);
      load();
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AdminLayout
      title="Social Proof"
      action={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Seeding…' : 'Load 30 defaults'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <PlusIcon size={16} /> Add entry
          </button>
        </div>
      }
    >
      <div className="admin-panel glass" style={{ marginBottom: 16, padding: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Widget
            </div>
            <button
              className={`badge ${config.enabled ? 'badge-green' : 'badge-danger'}`}
              style={{ cursor: 'pointer', border: 'none', fontSize: '0.85rem', padding: '6px 14px' }}
              onClick={handleToggleWidget}
            >
              {config.enabled ? 'Enabled — showing on site' : 'Disabled — hidden'}
            </button>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Rotation speed
            </div>
            <select
              className="select"
              value={config.rotationMs}
              onChange={(e) => handleRotationChange(Number(e.target.value))}
              style={{ minWidth: 180 }}
            >
              <option value={4000}>Fast (4s)</option>
              <option value={6000}>Brisk (6s)</option>
              <option value={8000}>Normal (8s)</option>
              <option value={12000}>Slow (12s)</option>
              <option value={20000}>Very slow (20s)</option>
            </select>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-faint)' }}>
            {entries.filter((e) => e.visible).length} visible / {entries.length} total
          </div>
        </div>
      </div>

      <div className="admin-panel glass">
        {loading ? (
          <p style={{ padding: 24, color: 'var(--text-faint)' }}>Loading…</p>
        ) : entries.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--text-faint)' }}>
            No entries yet. Click <strong>Load 30 defaults</strong> to seed sample data, or <strong>Add entry</strong> to create your own.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Visible</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e._id}>
                    <td style={{ fontWeight: 600 }}>{e.name}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{e.location}</td>
                    <td>{e.product}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      ${Number.isInteger(e.amount) ? e.amount : e.amount.toFixed(2)}
                    </td>
                    <td>
                      <button
                        className={`badge ${e.visible ? 'badge-green' : 'badge-danger'}`}
                        style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                        onClick={() => handleToggleVisible(e)}
                      >
                        {e.visible ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <button className="icon-action" onClick={() => openEdit(e)} title="Edit">
                          <EditIcon size={15} />
                        </button>
                        <button className="icon-action danger" onClick={() => handleDelete(e._id)} title="Delete">
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
              <h3>{editing ? 'Edit entry' : 'Add social proof entry'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><CloseIcon size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div>
                  <label className="form-label">Name</label>
                  <input className="form-input" placeholder="e.g. Marcus" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <input className="form-input" placeholder="e.g. Austin, US" value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} required />
                </div>
              </div>
              <div className="form-row" style={{ marginTop: 14 }}>
                <div>
                  <label className="form-label">Product</label>
                  <input className="form-input" placeholder="e.g. Chase Bank Log" value={form.product}
                    onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">Amount ($)</label>
                  <input className="form-input" type="number" step="0.01" min="0" placeholder="299" value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
                </div>
              </div>
              <div className="checkbox-field" style={{ marginTop: 16 }}>
                <input type="checkbox" id="visible" checked={form.visible}
                  onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))} />
                <label htmlFor="visible" style={{ fontSize: '0.9rem' }}>Visible in widget</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Add entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
