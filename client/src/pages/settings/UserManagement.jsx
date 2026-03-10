import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { getUsers, createUser, updateUser, deactivateUser } from '../../api/users.api.js';
import { getBranches } from '../../api/branches.api.js';
import { authStore } from '../../store/authStore.js';
import { Users, UserPlus, Pencil, ShieldAlert, X, Building2, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const ROLES = ['SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF'];

const ROLE_STYLES = {
  SUPER_ADMIN: 'bg-purple-50 text-purple-700 border-purple-200/60',
  BRANCH_MANAGER: 'bg-blue-50 text-blue-700 border-blue-200/60',
  STAFF: 'bg-slate-100 text-slate-600 border-slate-200/80',
};

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
    if (!window.confirm('Are you sure you want to deactivate this user? They will immediately lose access to the system.')) return;
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

  if (!isSuperAdmin) return null;

  if (loading) {
     return (
       <div className="animate-pulse space-y-4">
         <div className="h-14 bg-slate-100 rounded-xl w-32 ml-auto" />
         <div className="h-64 bg-slate-100 rounded-3xl w-full" />
       </div>
     )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-end mb-6">
        <Button 
          onClick={openCreate}
          className="h-11 px-6 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/30 font-semibold"
        >
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden min-h-[400px]">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 sm:px-8 py-5 flex items-center gap-3">
           <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-100/50 text-blue-600">
              <Users className="h-5 w-5" />
           </div>
           <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">System Users</h3>
              <p className="text-sm text-slate-500 font-medium">Manage user accounts, roles, and branch assignments</p>
           </div>
        </div>

        <div className="overflow-x-auto">
          {users.length === 0 ? (
            <div className="text-center py-20">
              <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No users found</h3>
              <p className="text-slate-500 mt-1">Get started by creating your first user account.</p>
            </div>
          ) : (
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-left">
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">User Identification</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Role & Access</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Assigned Branch</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Account Status</th>
                  <th className="py-4 px-6 w-32" aria-hidden />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="group transition-colors hover:bg-slate-50/70">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center auto-bg rounded-full bg-slate-100 text-slate-500 font-bold border border-slate-200">
                           {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-[15px]">{u.name}</p>
                          <p className="text-[13px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                       <span className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border',
                          ROLE_STYLES[u.role] ?? 'bg-slate-100 text-slate-600 border-slate-200/80'
                        )}>
                          {u.role.replace('_', ' ')}
                        </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                       {u.branch ? (
                         <div className="flex items-center gap-2">
                           <Building2 className="h-4 w-4 text-slate-400" />
                           {u.branch.name}
                         </div>
                       ) : (
                         <span className="text-slate-400 italic">Global Access</span>
                       )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                         <div className={cn("w-2 h-2 rounded-full", u.isActive ? "bg-emerald-500" : "bg-slate-300")} />
                         <span className={cn("font-semibold text-[13px]", u.isActive ? 'text-emerald-700' : 'text-slate-500')}>
                           {u.isActive ? 'Active' : 'Deactivated'}
                         </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-9 w-9 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" 
                          onClick={() => openEdit(u)}
                          title="Edit User"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        {u.isActive && u.id !== currentUser?.id && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" 
                            onClick={() => handleDeactivate(u.id)}
                            title="Deactivate User"
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={closeForm} />
          
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Configuration' : 'Create User'}
              </h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      value={form.name} 
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
                      className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                      placeholder="e.g. Jane Doe"
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="email" 
                      value={form.email} 
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} 
                      className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                      placeholder="jane@company.com"
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">
                    Password {editingId && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="password" 
                      value={form.password} 
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} 
                      placeholder={editingId ? '• • • • • • • •' : 'Create strong password'} 
                      required={!editingId} 
                      minLength={editingId ? 0 : 6} 
                      className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium tracking-wide transition-all"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 border-b border-transparent">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                      System Role
                    </label>
                    <select 
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 cursor-pointer" 
                      value={form.role} 
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 border-b border-transparent">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      Branch
                    </label>
                    <select 
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 cursor-pointer" 
                      value={form.branchId} 
                      onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                    >
                      <option value="">Global Access</option>
                      {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-3">
                 <Button 
                  type="button" 
                  variant="outline"
                  onClick={closeForm}
                  className="flex-1 h-12 rounded-xl font-bold hover:bg-slate-50 border-slate-200 text-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all font-bold hover:shadow-xl hover:-translate-y-0.5"
                >
                  {editingId ? 'Save Changes' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
