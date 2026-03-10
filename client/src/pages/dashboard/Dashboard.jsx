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
import {
  AlertTriangle,
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  ArrowRight,
  ChevronDown,
  GitBranch,
} from 'lucide-react';
import './dashboard.css';

const STAT_CARDS = [
  {
    key: 'activeProjects',
    label: 'Active Projects',
    icon: LayoutDashboard,
    accent: '#3b82f6',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    key: 'totalReceivedThisMonth',
    label: 'Received This Month',
    icon: TrendingUp,
    accent: '#059669',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    format: (v) => formatCurrency(v ?? 0),
  },
  {
    key: 'totalOutstandingFromClients',
    label: 'Outstanding (Clients)',
    icon: FileText,
    accent: '#d97706',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    format: (v) => formatCurrency(v ?? 0),
  },
  {
    key: 'totalPendingToVendors',
    label: 'Pending to Vendors',
    icon: FileText,
    accent: '#e11d48',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    format: (v) => formatCurrency(v ?? 0),
  },
  {
    key: 'totalPendingToLabour',
    label: 'Pending to Labour',
    icon: Users,
    accent: '#7c3aed',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    format: (v) => formatCurrency(v ?? 0),
  },
  {
    key: 'totalPendingToAssociates',
    label: 'Pending to Associates',
    icon: Users,
    accent: '#0d9488',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    format: (v) => formatCurrency(v ?? 0),
  },
];

function StatCard({ label, value, icon: Icon, accent, iconBg, iconColor, format, delayClass }) {
  const display = format ? format(value) : value;
  return (
    <div
      className={cn(
        'dash-animate stat-card relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm',
        delayClass
      )}
    >
      {/* Colored left accent bar */}
      <span
        className="stat-card-accent"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between">
        <div className="min-w-0 pr-2">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <p className="mt-2 truncate text-xl font-bold tracking-tight text-gray-900">
            {display ?? '—'}
          </p>
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              iconBg,
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function ChartCard({ title, subtitle, children, delayClass }) {
  return (
    <div
      className={cn(
        'dash-animate chart-card rounded-xl border border-gray-100 bg-white p-5 shadow-sm',
        delayClass
      )}
    >
      <SectionHeader title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  COMPLETED: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  ON_HOLD: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  ENQUIRY: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
};

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

  /* ---- Loading skeleton ---- */
  if (loading && !data) {
    return (
      <PageWrapper title="Dashboard">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
          ))}
        </div>
        <div className="mt-6">
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

  /* ---- greeting ---- */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <PageWrapper>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {/* ── Header ── */}
      <div className="dash-animate dash-delay-1 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">{todayStr}</p>
        </div>

        {isSuperAdmin && (
          <div className="relative inline-flex items-center gap-2">
            <GitBranch className="h-4 w-4 shrink-0 text-gray-400" />
            <div className="relative">
              <select
                className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              >
                <option value="">All branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map((card, i) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={d[card.key]}
            icon={card.icon}
            accent={card.accent}
            iconBg={card.iconBg}
            iconColor={card.iconColor}
            format={card.format}
            delayClass={`dash-delay-${i + 1}`}
          />
        ))}
      </div>

      {/* ── Low stock alert ── */}
      {lowStock.length > 0 && (
        <div className="dash-animate dash-delay-7 mt-6 flex items-start gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
          <div className="alert-pulse rounded-lg bg-amber-100 p-2.5">
            <AlertTriangle className="h-6 w-6 text-amber-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-amber-900">Low stock alert</h3>
            <p className="mt-1.5 text-sm text-amber-800">
              {lowStock.map((m) => (
                <span key={m.id} className="mr-4 inline-block">
                  <strong>{m.name}</strong>: {Number(m.currentStock)} {m.unit} (min{' '}
                  {Number(m.minThreshold)})
                </span>
              ))}
            </p>
            <Link
              to="/materials"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-800 underline decoration-amber-600 hover:text-amber-900"
            >
              Manage materials
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Charts row 1 ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Collections"
          subtitle="Last 6 months"
          delayClass="dash-delay-7"
        >
          <CollectionsChart data={collectionsByMonth} />
        </ChartCard>
        <ChartCard
          title="Projects by Status"
          subtitle="Current distribution"
          delayClass="dash-delay-8"
        >
          <StatusDonut data={projectStatusCounts} />
        </ChartCard>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Pending Payables"
          subtitle="Breakdown by category"
          delayClass="dash-delay-9"
        >
          <PendingBreakdownChart data={pendingBreakdown} />
        </ChartCard>
        <ChartCard
          title="Expense Breakdown"
          subtitle="By expense type"
          delayClass="dash-delay-10"
        >
          <ExpenseBreakdownChart data={expenseBreakdown} />
        </ChartCard>
      </div>

      {/* ── Recent projects ── */}
      <div className="dash-animate dash-delay-10 mt-8">
        <SectionHeader
          title="Recent Projects"
          subtitle="Latest activity"
          action={
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />

        {recent.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-8 text-center">
            <p className="text-gray-500">No projects yet.</p>
            <Link
              to="/projects/new"
              className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Project
                  </th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Client
                  </th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Branch
                  </th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Contract Value
                  </th>
                  <th className="w-10 p-4" aria-hidden />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((p) => (
                  <tr key={p.id} className="project-row transition-colors hover:bg-blue-50/40">
                    <td className="p-4">
                      <Link
                        to={`/projects/${p.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-500">{p.client?.name ?? '—'}</td>
                    <td className="p-4 text-gray-500">{p.branch?.name ?? '—'}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_STYLES[p.status] ?? 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
                        )}
                      >
                        {p.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-gray-800">
                      {formatCurrency(p.contractValue)}
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/projects/${p.id}`}
                        className="inline-flex rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-100 hover:text-blue-600"
                        aria-label="Open project"
                      >
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
