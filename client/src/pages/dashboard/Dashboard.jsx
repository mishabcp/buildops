import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getDashboard } from '../../api/dashboard.api.js';
import { getBranches } from '../../api/branches.api.js';
import { authStore } from '../../store/authStore.js';
import { cn } from '../../lib/utils.js';
import { TableSkeleton } from '../../components/shared/TableSkeleton.jsx';
import { CollectionsChart } from '../../components/dashboard/CollectionsChart.jsx';
import { StatusDonut } from '../../components/dashboard/StatusDonut.jsx';
import { PendingBreakdownChart } from '../../components/dashboard/PendingBreakdownChart.jsx';
import { ExpenseBreakdownChart } from '../../components/dashboard/ExpenseBreakdownChart.jsx';
import { AlertTriangle, LayoutDashboard, TrendingUp, Users, FileText, ArrowRight } from 'lucide-react';

const STAT_CARDS = [
  { key: 'activeProjects', label: 'Active Projects', icon: LayoutDashboard, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { key: 'totalReceivedThisMonth', label: 'Received This Month', icon: TrendingUp, bg: 'bg-emerald-50', iconColor: 'text-emerald-600', format: (v) => formatCurrency(v ?? 0) },
  { key: 'totalOutstandingFromClients', label: 'Outstanding from Clients', icon: FileText, bg: 'bg-amber-50', iconColor: 'text-amber-600', format: (v) => formatCurrency(v ?? 0) },
  { key: 'totalPendingToVendors', label: 'Pending to Vendors', icon: FileText, bg: 'bg-rose-50', iconColor: 'text-rose-600', format: (v) => formatCurrency(v ?? 0) },
  { key: 'totalPendingToLabour', label: 'Pending to Labour', icon: Users, bg: 'bg-violet-50', iconColor: 'text-violet-600', format: (v) => formatCurrency(v ?? 0) },
  { key: 'totalPendingToAssociates', label: 'Pending to Associates', icon: Users, bg: 'bg-teal-50', iconColor: 'text-teal-600', format: (v) => formatCurrency(v ?? 0) },
];

function StatCard({ label, value, icon: Icon, bg, iconColor, format }) {
  const display = format ? format(value) : value;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-2 text-xl font-bold tracking-tight text-gray-900">{display}</p>
        </div>
        {Icon && (
          <div className={cn('rounded-lg p-2', bg, iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
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
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
          ))}
        </div>
        <div className="mt-8">
          <TableSkeleton rows={5} cols={5} />
        </div>
      </PageWrapper>
    );
  }

  const d = data || {};
  const lowStock = d.lowStockMaterials ?? [];
  const recent = d.recentProjects ?? [];
  const collectionsByMonth = d.collectionsByMonth ?? [];
  const projectStatusCounts = d.projectStatusCounts ?? [];
  const pendingBreakdown = d.pendingBreakdown ?? [];
  const expenseBreakdown = d.expenseBreakdown ?? [];

  return (
    <PageWrapper title="Dashboard">
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <p className="mb-6 text-gray-600">Overview of projects, collections, and pending payables.</p>
      {isSuperAdmin && (
        <div className="mb-6 flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Branch</label>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={d[card.key]}
            icon={card.icon}
            bg={card.bg}
            iconColor={card.iconColor}
            format={card.format}
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">Collections (last 6 months)</h3>
          <CollectionsChart data={collectionsByMonth} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">Projects by status</h3>
          <StatusDonut data={projectStatusCounts} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">Pending payables</h3>
          <PendingBreakdownChart data={pendingBreakdown} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">Expense breakdown</h3>
          <ExpenseBreakdownChart data={expenseBreakdown} />
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="mt-8 flex items-start gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
          <div className="rounded-lg bg-amber-100 p-2.5">
            <AlertTriangle className="h-6 w-6 text-amber-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-amber-900">Low stock alert</h3>
            <p className="mt-1.5 text-sm text-amber-800">
              {lowStock.map((m) => (
                <span key={m.id} className="mr-4 inline-block">
                  <strong>{m.name}</strong>: {Number(m.currentStock)} {m.unit} (min {Number(m.minThreshold)})
                </span>
              ))}
            </p>
            <Link to="/materials" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-800 underline decoration-amber-600 hover:text-amber-900">
              Manage materials
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent projects</h2>
          <Link to="/projects" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-8 text-center">
            <p className="text-gray-500">No projects yet.</p>
            <Link to="/projects/new" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">Create your first project</Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80">
                <tr className="text-left">
                  <th className="p-4 font-medium text-gray-700">Project</th>
                  <th className="p-4 font-medium text-gray-700">Client</th>
                  <th className="p-4 font-medium text-gray-700">Branch</th>
                  <th className="p-4 font-medium text-gray-700">Status</th>
                  <th className="p-4 font-medium text-gray-700 text-right">Contract value</th>
                  <th className="w-10 p-4" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 transition-colors hover:bg-blue-50/50 last:border-0">
                    <td className="p-4">
                      <Link to={`/projects/${p.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                        {p.name}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600">{p.client?.name ?? '—'}</td>
                    <td className="p-4 text-gray-600">{p.branch?.name ?? '—'}</td>
                    <td className="p-4">
                      <span className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                        p.status === 'ACTIVE' && 'bg-green-100 text-green-800',
                        p.status === 'COMPLETED' && 'bg-slate-100 text-slate-700',
                        p.status === 'ON_HOLD' && 'bg-amber-100 text-amber-800',
                        p.status === 'ENQUIRY' && 'bg-blue-100 text-blue-800',
                        !['ACTIVE', 'COMPLETED', 'ON_HOLD', 'ENQUIRY'].includes(p.status) && 'bg-gray-100 text-gray-700'
                      )}>
                        {p.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">{formatCurrency(p.contractValue)}</td>
                    <td className="p-4">
                      <Link to={`/projects/${p.id}`} className="inline-flex rounded-lg p-1.5 text-gray-400 hover:bg-blue-100 hover:text-blue-600" aria-label="Open project">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
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
