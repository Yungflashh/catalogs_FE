import { useEffect, useState, useCallback } from 'react';
import { Mail } from 'lucide-react';
import { User } from '../../types';
import { adminApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Shared';
import AdminLayout from './AdminLayout';
import { TrashIcon, CloseIcon } from '../../components/Icons';

export default function AdminUsers() {
  const { user: current } = useAuth();
  const { notify } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailTarget, setEmailTarget] = useState<User | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.users().then(setUsers).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (id: string, role: string) => {
    try {
      const updated = await adminApi.updateRole(id, role);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: updated.role } : u)));
      notify('Role updated');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const remove = async (u: User) => {
    if (!confirm(`Delete user "${u.name}"?`)) return;
    try {
      await adminApi.deleteUser(u._id);
      notify('User removed');
      setUsers((prev) => prev.filter((x) => x._id !== u._id));
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const openEmail = (u: User) => {
    setEmailTarget(u);
    setSubject('');
    setMessage('');
  };

  const closeEmail = () => {
    if (sending) return;
    setEmailTarget(null);
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTarget) return;
    setSending(true);
    try {
      await adminApi.emailUser(emailTarget._id, subject, message);
      notify(`Email sent to ${emailTarget.email}`);
      setEmailTarget(null);
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout title="Users">
      {loading ? <Loader /> : (
        <div className="admin-panel glass admin-table-wrap fade-up">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Joined</th><th>Role</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === current?._id;
                return (
                  <tr key={u._id}>
                    <td className="tbl-prod-name">{u.name}{isSelf && <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}> (you)</span>}</td>
                    <td>{u.email}</td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <select className="select status-select" value={u.role}
                        disabled={isSelf}
                        onChange={(e) => changeRole(u._id, e.target.value)}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <button
                          className="icon-action"
                          onClick={() => openEmail(u)}
                          aria-label={`Email ${u.name}`}
                          title="Send email"
                        >
                          <Mail size={15} />
                        </button>
                        <button className="icon-action danger" disabled={u.role === 'admin'}
                          onClick={() => remove(u)} aria-label="Delete"
                          style={u.role === 'admin' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: 30 }}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {emailTarget && (
        <div className="modal-overlay" onClick={closeEmail}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>Email user</h3>
                <div style={{ color: 'var(--text-faint)', fontSize: '0.82rem', marginTop: 4 }}>
                  To: {emailTarget.name} &lt;{emailTarget.email}&gt;
                </div>
              </div>
              <button className="modal-close" onClick={closeEmail} disabled={sending}><CloseIcon size={22} /></button>
            </div>
            <form onSubmit={sendEmail}>
              <div className="field">
                <label>Subject</label>
                <input
                  className="input"
                  required
                  maxLength={200}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Update on your recent order"
                  disabled={sending}
                />
              </div>
              <div className="field">
                <label>Message</label>
                <textarea
                  className="textarea"
                  required
                  maxLength={10000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  rows={8}
                  disabled={sending}
                  style={{ minHeight: 180 }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 6, textAlign: 'right' }}>
                  {message.length} / 10,000
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeEmail} disabled={sending}>Cancel</button>
                <button className="btn btn-primary" disabled={sending || !subject.trim() || !message.trim()}>
                  {sending ? 'Sending…' : 'Send email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
