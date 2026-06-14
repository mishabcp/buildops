import { ArrowUpRight, AlertTriangle, Package } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CollectionsChart } from '../../../components/dashboard/CollectionsChart.jsx';
import { StatusDonut } from '../../../components/dashboard/StatusDonut.jsx';
import { PendingBreakdownChart } from '../../../components/dashboard/PendingBreakdownChart.jsx';
import { ExpenseBreakdownChart } from '../../../components/dashboard/ExpenseBreakdownChart.jsx';
import { KPIS, TONE, STATUS_COLORS } from '../previewData.js';
import { cn } from '../../../lib/utils.js';

/** Design 01 — Bento Grid: mixed-size tiles, one hero metric. */
export function Design01Bento({ data }) {
  const fmt = (k, money) => (money ? formatCurrency(data[k] ?? 0) : data[k] ?? '—');
  return (
    <div className="bg-slate-50 p-5 sm:p-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Hero tile */}
        <div className="col-span-2 row-span-2 flex flex-col justify-between rounded-3xl bg-brand-900 p-6 text-white shadow-brand lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-400">Received this month</span>
            <ArrowUpRight className="h-5 w-5 text-accent-400" />
          </div>
          <div>
            <p className="mt-6 text-4xl font-black tracking-tight tabular sm:text-5xl">{formatCurrency(data.totalReceivedThisMonth)}</p>
            <p className="mt-2 text-sm font-medium text-slate-300">Across {data.activeProjects} active projects</p>
          </div>
          <div className="mt-6 h-32">
            <CollectionsChart data={data.collectionsByMonth} />
          </div>
        </div>

        {/* Small KPI tiles */}
        {KPIS.filter((k) => k.key !== 'totalReceivedThisMonth').map((k) => {
          const t = TONE[k.tone];
          return (
            <div key={k.key} className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', t.bg, t.text)}>
                <k.icon className="h-5 w-5" />
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k.label}</p>
                <p className="mt-1 text-xl font-black tracking-tight text-brand-950 tabular">{fmt(k.key, k.money)}</p>
              </div>
            </div>
          );
        })}

        {/* Status donut */}
        <div className="col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Project Pipeline</h3>
          <StatusDonut data={data.projectStatusCounts} />
        </div>

        {/* Pending */}
        <div className="col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Accounts Payable</h3>
          <PendingBreakdownChart data={data.pendingBreakdown} />
        </div>

        {/* Expense */}
        <div className="col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Expense Mix</h3>
          <ExpenseBreakdownChart data={data.expenseBreakdown} />
        </div>

        {/* Recent projects */}
        <div className="col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-3 text-sm font-bold text-brand-950">Recent Projects</h3>
          <div className="space-y-2">
            {data.recentProjects.slice(0, 5).map((p) => {
              const s = STATUS_COLORS[p.status] ?? STATUS_COLORS.COMPLETED;
              return (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-brand-950">{p.name}</p>
                    <p className="text-[11px] font-medium text-slate-400">{p.client?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', s.bg, s.text)}>{p.status}</span>
                    <span className="font-mono text-sm font-bold text-brand-800 tabular">{formatCurrency(p.contractValue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low stock */}
        <div className="col-span-2 rounded-3xl border border-accent-200 bg-accent-50 p-5 shadow-sm lg:col-span-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent-600" />
            <h3 className="text-sm font-bold text-accent-900">Low Stock Alerts</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {data.lowStockMaterials.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2.5">
                <Package className="h-4 w-4 text-accent-600" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-brand-950">{m.name}</p>
                  <p className="text-[11px] font-medium text-accent-700 tabular">{Number(m.currentStock)} {m.unit} · min {Number(m.minThreshold)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
