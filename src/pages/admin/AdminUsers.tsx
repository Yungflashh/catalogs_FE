import { useEffect, useState, useCallback } from 'react';
import { User } from '../../types';
import { adminApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Shared';
import AdminLayout from './AdminLayout';
import { TrashIcon } from '../../components/Icons';

export default function AdminUsers() {
  const { user: current } = useAuth();
  const { notify } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
                      <button className="icon-action danger" disabled={u.role === 'admin'}
                        onClick={() => remove(u)} aria-label="Delete"
                        style={u.role === 'admin' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
                        <TrashIcon size={15} />
                      </button>
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
    </AdminLayout>
  );
}
