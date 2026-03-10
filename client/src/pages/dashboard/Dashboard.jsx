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
    accent: 'from-blue-500 to-indigo-500',
    iconBg: 'bg-blue-50/50 group-hover:bg-blue-100/50',
    iconColor: 'text-blue-600',
  },
  {
    key: 'totalReceivedThisMonth',
    label: 'Received This Month',
    icon: TrendingUp,
    accent: 'from-emerald-400 to-teal-500',
    iconBg: 'bg-emerald-50/50 group-hover:bg-emerald-100/50',
    iconColor: 'text-emerald-600',
    format: (v) => formatCurrency(v ?? 0),
  },
  {
    key: 'totalOutstandingFromClients',
    label: 'Outstanding (Clients)',
    icon: FileText,
    accent: 'from-amber-400 to-orange-500',
    iconBg: 'bg-amber-50/50 group-hover:bg-amber-100/50',
    iconColor: 'text-amber-600',
    format: (v) => formatCurrency(v ?? 0),
  },
  {
    key: 'totalPendingToVendors',
    label: 'Pending to Vendors',
    icon: FileText,
    accent: 'from-rose-400 to-red-500',
    iconBg: 'bg-rose-50/50 group-hover:bg-rose-100/50',
    iconColor: 'text-rose-600',
    format: (v) => formatCurrency(v ?? 0),
  },
  {
    key: 'totalPendingToLabour',
    label: 'Pending to Labour',
    icon: Users,
    accent: 'from-violet-400 to-purple-500',
    iconBg: 'bg-violet-50/50 group-hover:bg-violet-100/50',
    iconColor: 'text-violet-600',
    format: (v) => formatCurrency(v ?? 0),
  },
  {
    key: 'totalPendingToAssociates',
    label: 'Pending to Associates',
    icon: Users,
    accent: 'from-cyan-400 to-blue-500',
    iconBg: 'bg-cyan-50/50 group-hover:bg-cyan-100/50',
    iconColor: 'text-cyan-600',
    format: (v) => formatCurrency(v ?? 0),
  },
];

function StatCard({ label, value, icon: Icon, accent, iconBg, iconColor, format, delayClass }) {
  const display = format ? format(value) : value;
  return (
    <div
      className={cn(
        'dash-animate group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1',
        delayClass
      )}
    >
      <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${accent} opacity-80`} />
      
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <p className="truncate text-[13px] font-semibold text-slate-500/90 tracking-wide uppercase">
            {label}
          </p>
          <div className="mt-3 flex items-baseline">
            <p className="truncate font-sans text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-950 transition-colors">
              {display ?? '—'}
            </p>
          </div>
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
              iconBg,
              iconColor
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function ChartCard({ title, subtitle, children, delayClass }) {
  return (
    <div
      className={cn(
        'dash-animate flex flex-col rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md',
        delayClass
      )}
    >
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="flex-1 relative min-h-[300px]">
        {children}
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200/80',
  ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-200/60',
  ENQUIRY: 'bg-blue-50 text-blue-700 border-blue-200/60',
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
    if (isSuperAdmin) {
      getBranches()
        .then((r) => r?.success && r?.data && setBranches(r.data))
        .catch(() => { /* Branch list failed (e.g. 500); keep dropdown empty, use "All branches" */ });
    }
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-slate-200/60 bg-slate-100/50" />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl border border-slate-200/60 bg-slate-100/50" />
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

  /* ---- greeting ---- */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl py-2 sm:py-6">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm flex items-center gap-3">
             <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* ── Header ── */}
        <div className="dash-animate dash-delay-1 mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl block">
              {greeting}, <span className="text-blue-600">{user?.name?.split(' ')[0] ?? 'there'}</span> 👋
            </h1>
            <p className="mt-2 text-base font-medium text-slate-500">{todayStr}</p>
          </div>

          {isSuperAdmin && (
            <div className="relative inline-flex items-center gap-2 group">
              <div className="flex items-center justify-center p-2 rounded-lg bg-slate-100/80 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <GitBranch className="h-4 w-4 shrink-0" />
              </div>
              <div className="relative min-w-[180px]">
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200/80 bg-white/50 backdrop-blur-sm py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 cursor-pointer"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                >
                  <option value="">All branches config</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          )}
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="dash-animate dash-delay-7 mt-8 flex items-start gap-5 rounded-2xl border border-orange-200/60 bg-gradient-to-br from-orange-50/80 to-amber-50/50 p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="alert-pulse relative flex items-center justify-center rounded-xl bg-orange-100 p-3 shadow-inner shadow-orange-200/50">
              <AlertTriangle className="h-7 w-7 text-orange-600" />
            </div>
            
            <div className="min-w-0 flex-1 relative z-10">
              <h3 className="text-base font-bold text-orange-950 tracking-tight">Attention: Low Stock Alert</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-orange-800/90 font-medium">
                {lowStock.map((m) => (
                  <span key={m.id} className="mr-5 inline-block">
                    <strong className="text-orange-900">{m.name}</strong>: 
                    <span className="opacity-80 ml-1.5">{Number(m.currentStock)} {m.unit} (min {Number(m.minThreshold)})</span>
                  </span>
                ))}
              </p>
              <Link
                to="/materials"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 hover:text-orange-900 transition-colors group"
              >
                Manage Inventory
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Charts row 1 ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard
            title="Collections Overview"
            subtitle="Trailing 6-month view"
            delayClass="dash-delay-7"
          >
            <CollectionsChart data={collectionsByMonth} />
          </ChartCard>
          
          <ChartCard
            title="Project Pipeline"
            subtitle="Current status distribution"
            delayClass="dash-delay-8"
          >
            <StatusDonut data={projectStatusCounts} />
          </ChartCard>
        </div>

        {/* ── Charts row 2 ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard
            title="Accounts Payable"
            subtitle="Outstanding liabilities breakdown"
            delayClass="dash-delay-9"
          >
            <PendingBreakdownChart data={pendingBreakdown} />
          </ChartCard>
          
          <ChartCard
            title="Expense Analytics"
            subtitle="Categorized spending distribution"
            delayClass="dash-delay-10"
          >
            <ExpenseBreakdownChart data={expenseBreakdown} />
          </ChartCard>
        </div>

        {/* ── Recent projects ── */}
        <div className="dash-animate dash-delay-10 mt-10 p-6 rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <SectionHeader
            title="Active Workflow"
            subtitle="Recently updated projects"
            action={
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 border border-slate-200/50"
              >
                View Directory <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          {recent.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <LayoutDashboard className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">No active projects</h3>
              <p className="mt-1 text-sm text-slate-500">Get started by creating a new project workflow.</p>
              <Link
                to="/projects/new"
                className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
              >
                Create New Project
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/60 bg-white/50">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-left">
                    <th className="py-4 px-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Project Details
                    </th>
                    <th className="py-4 px-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Client
                    </th>
                    <th className="py-4 px-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Branch
                    </th>
                    <th className="py-4 px-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Status
                    </th>
                    <th className="py-4 px-5 text-right text-xs font-bold uppercase tracking-widest text-slate-500">
                      Contract Value
                    </th>
                    <th className="w-12 py-4 px-5" aria-hidden />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {recent.map((p) => (
                    <tr key={p.id} className="project-row group transition-colors hover:bg-slate-50/70">
                      <td className="py-4 px-5">
                        <Link
                          to={`/projects/${p.id}`}
                          className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-500">{p.client?.name ?? '—'}</td>
                      <td className="py-4 px-5 font-medium text-slate-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                           {p.branch?.name ?? '—'}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border',
                            STATUS_STYLES[p.status] ?? 'bg-slate-100 text-slate-600 border-slate-200/80'
                          )}
                        >
                          {p.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span className="inline-block font-bold text-slate-700 font-mono tracking-tight bg-slate-50 px-2 py-1 rounded-lg">
                           {formatCurrency(p.contractValue)}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          to={`/projects/${p.id}`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-blue-600 hover:shadow-sm ring-1 ring-slate-200/0 hover:ring-slate-200"
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
      </div>
    </PageWrapper>
  );
}
