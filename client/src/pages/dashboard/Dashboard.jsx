import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { getDashboard } from '../../api/dashboard.api.js';
import { getBranches } from '../../api/branches.api.js';
import { authStore } from '../../store/authStore.js';
import { cn } from '../../lib/utils.js';
import { TableSkeleton } from '../../components/shared/TableSkeleton.jsx';
import { AlertTriangle, LayoutDashboard, TrendingUp, Users, FileText } from 'lucide-react';

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
      {Icon && <Icon className="mt-2 h-8 w-8 text-gray-300" />}
    </div>
  );
}

export function Dashboard() {
  const user = authStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [data, setData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
    if (isSuperAdmin) getBranches().then((r) => r?.success && r?.data && setBranches(r.data));
  }, [branchId, isSuperAdmin]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = branchId ? { branchId } : {};
      const res = await getDashboard(params);
      if (res?.success && res?.data) setData(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  if (loading && !data) {
    return (
      <PageWrapper title="Dashboard">
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
          ))}
        </div>
        <TableSkeleton rows={5} cols={5} />
      </PageWrapper>
    );
  }

  const d = data || {};
  const lowStock = d.lowStockMaterials ?? [];
  const recent = d.recentProjects ?? [];

  return (
    <PageWrapper title="Dashboard">
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {isSuperAdmin && (
        <div className="mb-6">
          <label className="mr-2 text-sm text-gray-600">Branch:</label>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Active Projects" value={d.activeProjects ?? 0} icon={LayoutDashboard} />
        <StatCard label="Received This Month" value={formatCurrency(d.totalReceivedThisMonth ?? 0)} icon={TrendingUp} />
        <StatCard label="Outstanding from Clients" value={formatCurrency(d.totalOutstandingFromClients ?? 0)} icon={FileText} />
        <StatCard label="Pending to Vendors" value={formatCurrency(d.totalPendingToVendors ?? 0)} icon={FileText} />
        <StatCard label="Pending to Labour" value={formatCurrency(d.totalPendingToLabour ?? 0)} icon={Users} />
        <StatCard label="Pending to Associates" value={formatCurrency(d.totalPendingToAssociates ?? 0)} icon={Users} />
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h3 className="font-medium text-amber-800">Low stock</h3>
            <p className="mt-1 text-sm text-amber-700">
              {lowStock.map((m) => (
                <span key={m.id} className="mr-3">
                  {m.name}: {Number(m.currentStock)} {m.unit} (min {Number(m.minThreshold)})
                </span>
              ))}
            </p>
            <Link to="/materials" className="mt-2 inline-block text-sm font-medium text-amber-800 underline">
              Manage materials
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent projects</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-gray-500">No projects yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-200 text-left">
                  <th className="p-3 font-medium text-gray-700">Name</th>
                  <th className="p-3 font-medium text-gray-700">Client</th>
                  <th className="p-3 font-medium text-gray-700">Branch</th>
                  <th className="p-3 font-medium text-gray-700">Status</th>
                  <th className="p-3 font-medium text-gray-700">Contract value</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <Link to={`/projects/${p.id}`} className="font-medium text-blue-600 hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="p-3">{p.client?.name ?? '—'}</td>
                    <td className="p-3">{p.branch?.name ?? '—'}</td>
                    <td className="p-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', p.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700')}>
                        {p.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3">{formatCurrency(p.contractValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
