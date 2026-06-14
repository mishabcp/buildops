import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  FileText,
  GitBranch,
  LayoutDashboard,
  PackageSearch,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { getBranches } from '../../api/branches.api.js';
import { getDashboard } from '../../api/dashboard.api.js';
import { CollectionsChart } from '../../components/dashboard/CollectionsChart.jsx';
import { ExpenseBreakdownChart } from '../../components/dashboard/ExpenseBreakdownChart.jsx';
import { PendingBreakdownChart } from '../../components/dashboard/PendingBreakdownChart.jsx';
import { StatusDonut } from '../../components/dashboard/StatusDonut.jsx';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { TableSkeleton } from '../../components/shared/TableSkeleton.jsx';
import { cn } from '../../lib/utils.js';
import { authStore } from '../../store/authStore.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import './dashboard.css';

const STAT_CARDS = [
  { key: 'activeProjects', label: 'Active Projects', icon: LayoutDashboard, gradient: 'from-brand-500 to-brand-800' },
  { key: 'totalReceivedThisMonth', label: 'Received This Month', icon: TrendingUp, gradient: 'from-emerald-400 to-emerald-600', money: true },
  { key: 'totalOutstandingFromClients', label: 'Outstanding Clients', icon: FileText, gradient: 'from-accent-400 to-accent-600', money: true },
  { key: 'totalPendingToVendors', label: 'Pending Vendors', icon: Wallet, gradient: 'from-rose-400 to-rose-600', money: true },
  { key: 'totalPendingToLabour', label: 'Pending Labour', icon: Users, gradient: 'from-amber-400 to-amber-600', money: true },
  { key: 'totalPendingToAssociates', label: 'Pending Associates', icon: Users, gradient: 'from-brand-400 to-brand-600', money: true },
];

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  COMPLETED: 'bg-slate-100 text-slate-600 ring-slate-200',
  ON_HOLD: 'bg-amber-50 text-amber-700 ring-amber-200',
  ENQUIRY: 'bg-brand-50 text-brand-700 ring-brand-200',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-200',
};

function GlassMetricCard({ card, value, delayClass }) {
  const Icon = card.icon;
  const display = card.money ? formatCurrency(value ?? 0) : value ?? '—';

  return (
    <div
      className={cn(
        'dash-animate group relative min-h-32 overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-lg shadow-brand-950/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        card.gradient,
        delayClass
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.35),transparent_35%)]" />
      <Icon className="absolute -bottom-4 -right-4 h-20 w-20 text-white/20 transition-transform duration-300 group-hover:scale-110" />
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">{card.label}</p>
        <p className="mt-4 truncate text-2xl font-black tracking-tight tabular">{display}</p>
      </div>
    </div>
  );
}

function GlassPanel({ title, subtitle, action, className, children }) {
  return (
    <section className={cn('rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,47,80,0.18)] ring-1 ring-slate-900/[0.02]', className)}>
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.18em] text-brand-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm font-medium text-slate-600">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function BranchFilter({ branches, branchId, onBranchChange }) {
  return (
    <div className="relative inline-flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-brand-700 shadow-sm ring-1 ring-white/70">
        <GitBranch className="h-4 w-4" />
      </div>
      <div className="relative min-w-48">
        <select
          className="w-full appearance-none rounded-2xl border border-white/70 bg-white/70 py-3 pl-4 pr-10 text-sm font-bold text-brand-950 shadow-sm outline-none backdrop-blur transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
          value={branchId}
          onChange={(e) => onBranchChange(e.target.value)}
        >
          <option value="">All branches</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
      </div>
    </div>
  );
}

function LowStockPanel({ materials }) {
  return (
    <GlassPanel
      title="Low Stock"
      subtitle={materials.length ? 'Materials below threshold' : 'Inventory is healthy'}
      className="dash-animate dash-delay-10"
    >
      {materials.length ? (
        <div className="space-y-3">
          {materials.map((material) => (
            <Link
              key={material.id}
              to="/materials"
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-accent-200 hover:bg-accent-50/60 hover:shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="alert-pulse flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-brand-950">{material.name}</p>
                  <p className="text-xs font-semibold text-slate-600">Minimum {Number(material.minThreshold)} {material.unit}</p>
                </div>
              </div>
              <span className="font-mono text-sm font-black text-accent-700 tabular">
                {Number(material.currentStock)}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/80 p-4 text-emerald-700">
          <PackageSearch className="h-5 w-5" />
          <p className="text-sm font-bold">No materials are currently below threshold.</p>
        </div>
      )}
    </GlassPanel>
  );
}

function RecentProjectsPanel({ projects }) {
  return (
    <GlassPanel
      title="Recent Projects"
      subtitle="Latest project movement across branches"
      className="dash-animate dash-delay-10"
      action={
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-950 px-4 py-2 text-sm font-bold text-white shadow-brand transition hover:bg-brand-900"
        >
          View Directory <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      {projects.length ? (
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset',
                    STATUS_STYLES[project.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'
                  )}
                >
                  {project.status?.replace(/_/g, ' ') ?? 'Unknown'}
                </span>
                <span className="font-mono text-sm font-black text-brand-800 tabular">
                  {formatCurrency(project.contractValue)}
                </span>
              </div>
              <p className="mt-3 truncate text-base font-extrabold text-brand-950 group-hover:text-brand-700">
                {project.name}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                <span className="truncate">{project.client?.name ?? 'No client'}</span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                  {project.branch?.name ?? 'Global'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white/50 p-10 text-center">
          <LayoutDashboard className="mx-auto h-8 w-8 text-brand-300" />
          <h3 className="mt-4 text-sm font-bold text-brand-950">No recent projects</h3>
          <p className="mt-1 text-sm text-slate-500">Create a project to see it here.</p>
          <Link
            to="/projects/new"
            className="mt-5 inline-flex items-center rounded-2xl bg-brand-800 px-4 py-2 text-sm font-bold text-white shadow-brand transition hover:bg-brand-900"
          >
            Create New Project
          </Link>
        </div>
      )}
    </GlassPanel>
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

  if (loading && !data) {
    return (
      <PageWrapper>
        <div className="relative rounded-[2rem] bg-slate-100 p-5 sm:p-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm" />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm" />
            ))}
          </div>
          <div className="mt-5">
            <TableSkeleton rows={5} cols={5} />
          </div>
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
      <div className="relative -m-4 min-h-[calc(100vh-7rem)] rounded-[2rem] bg-slate-100 p-4 sm:-m-6 sm:p-8">
        <div className="relative">
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200/70 bg-red-50/90 p-4 text-red-800 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="dash-animate dash-delay-1 mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-accent-600">Buildops command center</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-brand-950 sm:text-5xl">
                {greeting}, <span className="text-accent-500">{user?.name?.split(' ')[0] ?? 'there'}</span>
              </h1>
              <p className="mt-2 text-base font-semibold text-slate-600">{todayStr}</p>
            </div>

            {isSuperAdmin && (
              <BranchFilter branches={branches} branchId={branchId} onBranchChange={setBranchId} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
            {STAT_CARDS.map((card, i) => (
              <GlassMetricCard
                key={card.key}
                card={card}
                value={d[card.key]}
                delayClass={`dash-delay-${i + 1}`}
              />
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            <GlassPanel
              title="Collections Overview"
              subtitle="Trailing 6-month payment view"
              className="dash-animate dash-delay-7 xl:col-span-2"
            >
              <CollectionsChart data={collectionsByMonth} />
            </GlassPanel>

            <GlassPanel
              title="Pipeline"
              subtitle="Current project status split"
              className="dash-animate dash-delay-8"
            >
              <StatusDonut data={projectStatusCounts} />
            </GlassPanel>

            <GlassPanel
              title="Payables"
              subtitle="Outstanding liabilities"
              className="dash-animate dash-delay-9"
            >
              <PendingBreakdownChart data={pendingBreakdown} />
            </GlassPanel>

            <GlassPanel
              title="Expenses"
              subtitle="Categorized spending distribution"
              className="dash-animate dash-delay-10"
            >
              <ExpenseBreakdownChart data={expenseBreakdown} />
            </GlassPanel>

            <LowStockPanel materials={lowStock} />
          </div>

          <div className="mt-5">
            <RecentProjectsPanel projects={recent} />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
