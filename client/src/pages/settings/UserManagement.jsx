import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { getUsers, createUser, updateUser, deactivateUser } from '../../api/users.api.js';
import { getBranches } from '../../api/branches.api.js';
import { authStore } from '../../store/authStore.js';

const ROLES = ['SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF'];

export function UserManagement() {
  const currentUser = authStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF', branchId: '' });

  useEffect(() => {
    if (isSuperAdmin) load();
    else setLoading(false);
  }, [isSuperAdmin]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [uRes, bRes] = await Promise.all([getUsers(), getBranches()]);
      if (uRes?.success && uRes?.data) setUsers(uRes.data);
      if (bRes?.success && bRes?.data) setBranches(bRes.data);
      if (!uRes?.success) setError(uRes?.error ?? 'Failed to load users');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm({ name: '', email: '', password: '', role: 'STAFF', branchId: '' });
    setShowForm(true);
  }

  function openEdit(user) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      branchId: user.branchId ?? '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', email: '', password: '', role: 'STAFF', branchId: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        const body = { name: form.name.trim(), email: form.email.trim(), role: form.role, branchId: form.branchId || null };
        if (form.password.trim().length >= 6) body.password = form.password;
        const res = await updateUser(editingId, body);
        if (res?.success && res?.data) {
          setUsers((prev) => prev.map((u) => (u.id === editingId ? res.data : u)));
          closeForm();
        } else setError(res?.error ?? 'Failed to update');
      } else {
        if (!form.password || form.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        const res = await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          branchId: form.branchId || null,
        });
        if (res?.success && res?.data) {
          setUsers((prev) => [...prev, res.data]);
          closeForm();
        } else setError(res?.error ?? 'Failed to create');
      }
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to save');
    }
  }

  async function handleDeactivate(id) {
    if (!window.confirm('Deactivate this user?')) return;
    setError('');
    try {
      const res = await deactivateUser(id);
      if (res?.success) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: false } : u)));
      } else setError(res?.error ?? 'Failed to deactivate');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to deactivate');
    }
  }

  if (!isSuperAdmin) {
    return <p className="text-gray-500">You need Super Admin access to manage users.</p>;
  }

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>Add User</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Role</th>
                  <th className="pb-2 pr-4 font-medium">Branch</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4">{u.name}</td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">{u.role}</td>
                    <td className="py-2 pr-4">{u.branch?.name ?? '—'}</td>
                    <td className="py-2 pr-4">
                      <span className={u.isActive ? 'text-green-600' : 'text-gray-500'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="py-2">
                      <Button size="sm" variant="outline" className="mr-2" onClick={() => openEdit(u)}>Edit</Button>
                      {u.isActive && u.id !== currentUser?.id && (
                        <Button size="sm" variant="destructive" onClick={() => handleDeactivate(u.id)}>Deactivate</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? 'Edit User' : 'Add User'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={closeForm}>Close</Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Password {editingId && '(leave blank to keep)'}</label>
                  <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder={editingId ? '••••••••' : ''} required={!editingId} minLength={editingId ? 0 : 6} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Role</label>
                  <select className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Branch</label>
                  <select className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}>
                    <option value="">— None —</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <Button type="submit" className="w-full">{editingId ? 'Update' : 'Create'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
