import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { getClients } from '../../api/clients.api.js';
import { getBranches } from '../../api/branches.api.js';
import { getProject, createProject, updateProject } from '../../api/projects.api.js';
import { authStore } from '../../store/authStore.js';
import { toastStore } from '../../store/toastStore.js';

const STATUS_OPTIONS = [
  { value: 'ENQUIRY', label: 'Enquiry' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = authStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const isEdit = id && id !== 'new';
  const [loading, setLoading] = useState(!!isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    clientId: '',
    branchId: user?.branchId ?? '',
    location: '',
    status: 'ENQUIRY',
    contractValue: '',
    startDate: '',
    estimatedEndDate: '',
    description: '',
  });

  useEffect(() => {
    loadClients();
    if (isSuperAdmin) loadBranches();
    else if (user?.branchId) setBranches([{ id: user.branchId, name: user.branch?.name ?? 'Your branch' }]);
    if (isEdit) loadProject();
  }, [isEdit, id, isSuperAdmin]);

  async function loadClients() {
    try {
      const res = await getClients();
      if (res?.success && res?.data) setClients(res.data);
    } catch (_) {}
  }

  async function loadBranches() {
    try {
      const res = await getBranches();
      if (res?.success && res?.data) setBranches(res.data);
    } catch (_) {}
  }

  async function loadProject() {
    setLoading(true);
    setError('');
    try {
      const res = await getProject(id);
      if (res?.success && res?.data) {
        const p = res.data;
        setForm({
          name: p.name ?? '',
          clientId: String(p.clientId ?? ''),
          branchId: String(p.branchId ?? ''),
          location: p.location ?? '',
          status: p.status ?? 'ENQUIRY',
          contractValue: p.contractValue != null ? String(p.contractValue) : '',
          startDate: p.startDate ? p.startDate.slice(0, 10) : '',
          estimatedEndDate: p.estimatedEndDate ? p.estimatedEndDate.slice(0, 10) : '',
          description: p.description ?? '',
        });
        setClientSearch(p.client?.name ?? '');
      } else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = clientSearch.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase())) ||
          (c.phone && c.phone.includes(clientSearch))
      )
    : clients;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        clientId: Number(form.clientId),
        branchId: Number(form.branchId),
        location: form.location.trim() || null,
        status: form.status,
        contractValue: form.contractValue ? Number(form.contractValue) : 0,
        startDate: form.startDate || null,
        estimatedEndDate: form.estimatedEndDate || null,
        description: form.description.trim() || null,
      };
      if (isEdit) {
        const res = await updateProject(id, payload);
        if (res?.success && res?.data) {
          toastStore.getState().success('Project updated');
          navigate(`/projects/${id}`);
        } else {
          setError(res?.error ?? 'Failed to update');
          toastStore.getState().error(res?.error ?? 'Failed to update');
        }
      } else {
        const res = await createProject(payload);
        if (res?.success && res?.data) {
          toastStore.getState().success('Project created');
          navigate(`/projects/${res.data.id}`);
        } else {
          setError(res?.error ?? 'Failed to create');
          toastStore.getState().error(res?.error ?? 'Failed to create');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error ?? err.message ?? 'Failed to save';
      setError(msg);
      toastStore.getState().error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageWrapper title={isEdit ? 'Edit Project' : 'New Project'}><p className="text-gray-500">Loading…</p></PageWrapper>;

  return (
    <PageWrapper title={isEdit ? 'Edit Project' : 'New Project'}>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Project' : 'New Project'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Project name *</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Client *</label>
              <Input
                placeholder="Search by name, email, phone..."
                value={form.clientId ? (clients.find((c) => c.id === Number(form.clientId))?.name ?? clientSearch) : clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  if (!e.target.value) setForm((f) => ({ ...f, clientId: '' }));
                }}
              />
              {filteredClients.length > 0 && (clientSearch.trim() || !form.clientId) && (
                <ul className="mt-1 max-h-40 overflow-auto rounded border border-gray-200 bg-white">
                  {filteredClients.slice(0, 20).map((c) => (
                    <li
                      key={c.id}
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setForm((f) => ({ ...f, clientId: String(c.id) }));
                        setClientSearch(c.name);
                      }}
                    >
                      {c.name} {c.phone && `— ${c.phone}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Branch *</label>
              <select
                className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.branchId}
                onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                required
                disabled={!isSuperAdmin && !!user?.branchId}
              >
                <option value="">Select branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Location</label>
              <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Contract value (₹) *</label>
              <Input type="number" step="0.01" min="0" value={form.contractValue} onChange={(e) => setForm((f) => ({ ...f, contractValue: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Start date</label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Estimated end date</label>
                <Input type="date" value={form.estimatedEndDate} onChange={(e) => setForm((f) => ({ ...f, estimatedEndDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
