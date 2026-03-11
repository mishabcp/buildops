import { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { getClients, createClient, updateClient, deleteClient } from '../../api/clients.api.js';
import { TableSkeleton } from '../../components/shared/TableSkeleton.jsx';
import { toastStore } from '../../store/toastStore.js';
import { Plus, Search, AlertTriangle, Pencil, Trash2, X, Building2 } from 'lucide-react';

export function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    loadClients();
  }, [search]);

  async function loadClients() {
    setLoading(true);
    setError('');
    try {
      const res = await getClients(search.trim());
      if (res?.success && res?.data) setClients(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveClient(payload) {
    try {
      if (editingClient) {
        const res = await updateClient(editingClient.id, payload);
        if (res?.success && res?.data) {
          setClients((prev) => prev.map((c) => (c.id === editingClient.id ? res.data : c)));
          setEditingClient(null);
          setShowForm(false);
          toastStore.getState().success('Client updated');
        } else throw new Error(res?.error ?? 'Update failed');
      } else {
        const res = await createClient(payload);
        if (res?.success && res?.data) {
          setClients((prev) => [res.data, ...prev]);
          setShowForm(false);
          toastStore.getState().success('Client created');
        } else throw new Error(res?.error ?? 'Create failed');
      }
    } catch (err) {
      throw err;
    }
  }

  async function handleDelete(client) {
    const message =
      'Delete this client? They will be removed from the list. You cannot delete a client that has projects.';
    if (!window.confirm(message)) return;
    try {
      const res = await deleteClient(client.id);
      if (res?.success) {
        setClients((prev) => prev.filter((c) => c.id !== client.id));
        toastStore.getState().success('Client deleted');
      } else throw new Error(res?.error ?? 'Delete failed');
    } catch (err) {
      const msg = err.response?.data?.error ?? err.message ?? 'Could not delete client';
      toastStore.getState().error(msg);
    }
  }

  return (
    <PageWrapper title="Clients">
      <div className="animate-in fade-in duration-500">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-200/80 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all rounded-xl w-full text-[15px] font-medium"
            />
          </div>
          <Button
            onClick={() => {
              setEditingClient(null);
              setShowForm(true);
            }}
            className="h-11 px-6 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add client
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
          {loading ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm">
              <TableSkeleton rows={8} cols={6} />
            </div>
          ) : clients.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 mb-6">
                <Building2 className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">No clients found</h3>
              <p className="mt-2 text-base text-slate-500 max-w-sm mx-auto">
                {search.trim()
                  ? "We couldn't find any clients matching your search."
                  : "You don't have any clients yet. Add your first client to assign them to projects."}
              </p>
              {!search.trim() && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="mt-8 h-12 px-6 rounded-xl gap-2 font-semibold shadow-md min-w-[160px]"
                >
                  <Plus className="h-4 w-4" />
                  Add client
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80 text-left">
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Name</th>
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Phone</th>
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Email</th>
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Address</th>
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Projects</th>
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {clients.map((c) => (
                      <tr key={c.id} className="group transition-colors hover:bg-slate-50/70">
                        <td className="py-4 px-5 font-bold text-slate-900 text-[15px]">{c.name}</td>
                        <td className="py-4 px-5 font-medium text-slate-600">{c.phone ?? '—'}</td>
                        <td className="py-4 px-5 font-medium text-slate-600">{c.email ?? '—'}</td>
                        <td className="py-4 px-5 font-medium text-slate-500 max-w-[200px] truncate" title={c.address ?? ''}>
                          {c.address ?? '—'}
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                            {c._count?.projects ?? 0}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                setEditingClient(c);
                                setShowForm(true);
                              }}
                              aria-label="Edit client"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(c)}
                              aria-label="Delete client"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => {
              setShowForm(false);
              setEditingClient(null);
            }}
          />
          <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-lg">
            <ClientForm
              client={editingClient}
              onSave={handleSaveClient}
              onClose={() => {
                setShowForm(false);
                setEditingClient(null);
              }}
            />
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

function ClientForm({ client, onSave, onClose }) {
  const isEdit = !!client;
  const [form, setForm] = useState({
    name: client?.name ?? '',
    phone: client?.phone ?? '',
    email: client?.email ?? '',
    address: client?.address ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
      });
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative w-full bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900 leading-tight">
          {isEdit ? 'Edit client' : 'Add client'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name (required)</label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Client or organization name"
            className="h-11 rounded-xl border-slate-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Optional"
            className="h-11 rounded-xl border-slate-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Optional"
            className="h-11 rounded-xl border-slate-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
          <Input
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="Optional"
            className="h-11 rounded-xl border-slate-200"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11">
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="flex-1 rounded-xl h-11 bg-slate-900 hover:bg-slate-800">
            {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
}
