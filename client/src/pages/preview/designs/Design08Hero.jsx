import { ArrowUpRight, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CollectionsChart } from '../../../components/dashboard/CollectionsChart.jsx';
import { StatusDonut } from '../../../components/dashboard/StatusDonut.jsx';
import { PendingBreakdownChart } from '../../../components/dashboard/PendingBreakdownChart.jsx';
import { ExpenseBreakdownChart } from '../../../components/dashboard/ExpenseBreakdownChart.jsx';
import { KPIS, TONE, STATUS_COLORS } from '../previewData.js';
import { cn } from '../../../lib/utils.js';

/** Design 08 — Hero Spotlight: one dominant metric, supporting grid. */
export function Design08Hero({ data }) {
  const fmt = (k, money) => (money ? formatCurrency(data[k] ?? 0) : data[k] ?? '—');
  return (
    <div className="bg-slate-50 p-5 sm:p-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-8 text-white shadow-brand sm:p-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-300">
            <ArrowUpRight className="h-3.5 w-3.5" /> Outstanding from clients
          </span>
          <p className="mt-6 text-5xl font-black tracking-tighter tabular sm:text-7xl">{formatCurrency(data.totalOutstandingFromClients)}</p>
          <p className="mt-3 max-w-lg text-sm font-medium text-slate-300">
            Total receivables across the portfolio. {data.activeProjects} active projects currently driving collections.
          </p>
        </div>
      </div>

      {/* Supporting KPIs */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {KPIS.filter((k) => k.key !== 'totalOutstandingFromClients').map((k) => {
          const t = TONE[k.tone];
          return (
            <div key={k.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', t.dot)} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k.label}</span>
              </div>
              <p className="mt-2 text-xl font-black tracking-tight text-brand-950 tabular">{fmt(k.key, k.money)}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Collections</h3>
          <CollectionsChart data={data.collectionsByMonth} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Pipeline</h3>
          <StatusDonut data={data.projectStatusCounts} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Payables</h3>
          <PendingBreakdownChart data={data.pendingBreakdown} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Expenses</h3>
          <ExpenseBreakdownChart data={data.expenseBreakdown} />
        </div>
      </div>

      {/* Recent + low stock */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-3 text-sm font-bold text-brand-950">Recent Projects</h3>
          <div className="space-y-2">
            {data.recentProjects.map((p) => {
              const s = STATUS_COLORS[p.status] ?? STATUS_COLORS.COMPLETED;
              return (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <span className="truncate text-sm font-bold text-brand-950">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', s.bg, s.text)}>{p.status}</span>
                    <span className="font-mono text-sm font-bold text-brand-800 tabular">{formatCurrency(p.contractValue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-accent-200 bg-accent-50 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-accent-700">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="text-sm font-bold">Low Stock</h3>
          </div>
          <div className="space-y-2">
            {data.lowStockMaterials.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-sm">
                <span className="font-semibold text-brand-950">{m.name}</span>
                <span className="font-mono text-accent-700 tabular">{Number(m.currentStock)}/{Number(m.minThreshold)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
