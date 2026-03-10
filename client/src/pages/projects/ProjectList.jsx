import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getProjects } from '../../api/projects.api.js';
import { getBranches } from '../../api/branches.api.js';
import { authStore } from '../../store/authStore.js';
import { TableSkeleton } from '../../components/shared/TableSkeleton.jsx';
import { Plus, Search } from 'lucide-react';

export function ProjectList() {
  const user = authStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [projects, setProjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProjects();
    if (isSuperAdmin) loadBranches();
  }, [branchId, status, search, isSuperAdmin]);

  async function loadBranches() {
    try {
      const res = await getBranches();
      if (res?.success && res?.data) setBranches(res.data);
    } catch (_) {}
  }

  async function loadProjects() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (branchId) params.branchId = branchId;
      if (status) params.status = status;
      if (search.trim()) params.search = search.trim();
      const res = await getProjects(params);
      if (res?.success && res?.data) setProjects(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper title="Projects">
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by project or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {isSuperAdmin && (
          <select
            className="h-10 rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
        <select
          className="h-10 rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="ENQUIRY">Enquiry</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <Link to="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No projects found.</p>
          <Link to="/projects/new" className="mt-4 inline-block">
            <Button>New Project</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="border-b border-gray-200 text-left">
                <th className="p-3 font-medium text-gray-700">Name</th>
                <th className="p-3 font-medium text-gray-700">Client</th>
                {isSuperAdmin && <th className="p-3 font-medium text-gray-700">Branch</th>}
                <th className="p-3 font-medium text-gray-700">Status</th>
                <th className="p-3 font-medium text-gray-700">Contract Value</th>
                <th className="p-3 font-medium text-gray-700">Received</th>
                <th className="p-3 font-medium text-gray-700">Balance</th>
                <th className="p-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                >
                  <td className="p-3 font-medium">
                    <Link to={`/projects/${p.id}`} className="text-gray-900 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">{p.client?.name ?? '—'}</td>
                  {isSuperAdmin && <td className="p-3 text-gray-600">{p.branch?.name ?? '—'}</td>}
                  <td className="p-3"><StatusBadge status={p.status} /></td>
                  <td className="p-3">{formatCurrency(p.contractValue)}</td>
                  <td className="p-3">{formatCurrency(p.totalReceived)}</td>
                  <td className="p-3">{formatCurrency(p.balance)}</td>
                  <td className="p-3">
                    <Link to={`/projects/${p.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}
