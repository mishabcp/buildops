import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CollectionsChart } from '../../../components/dashboard/CollectionsChart.jsx';
import { StatusDonut } from '../../../components/dashboard/StatusDonut.jsx';
import { PendingBreakdownChart } from '../../../components/dashboard/PendingBreakdownChart.jsx';
import { ExpenseBreakdownChart } from '../../../components/dashboard/ExpenseBreakdownChart.jsx';
import { KPIS, STATUS_COLORS } from '../previewData.js';
import { cn } from '../../../lib/utils.js';

/** Design 03 — Minimal Mono: whitespace, hairlines, restrained. */
export function Design03Minimal({ data }) {
  const fmt = (k, money) => (money ? formatCurrency(data[k] ?? 0) : data[k] ?? '—');
  return (
    <div className="bg-white p-6 sm:p-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Overview</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-brand-950">Financial Summary</h2>

        {/* KPI rows with hairline dividers */}
        <div className="mt-8 divide-y divide-slate-100 border-y border-slate-100">
          {KPIS.map((k) => (
            <div key={k.key} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <k.icon className="h-4 w-4 text-slate-300" />
                <span className="text-sm font-medium text-slate-500">{k.label}</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-brand-950 tabular">{fmt(k.key, k.money)}</span>
            </div>
          ))}
        </div>

        {/* Charts: airy 2-col */}
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Collections</p>
            <CollectionsChart data={data.collectionsByMonth} />
          </div>
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Pipeline</p>
            <StatusDonut data={data.projectStatusCounts} />
          </div>
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Payables</p>
            <PendingBreakdownChart data={data.pendingBreakdown} />
          </div>
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Expenses</p>
            <ExpenseBreakdownChart data={data.expenseBreakdown} />
          </div>
        </div>

        {/* Recent projects — plain list */}
        <div className="mt-12">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Recent Projects</p>
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {data.recentProjects.map((p) => {
              const s = STATUS_COLORS[p.status] ?? STATUS_COLORS.COMPLETED;
              return (
                <div key={p.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
                    <span className="text-sm font-semibold text-brand-950">{p.name}</span>
                    <span className="hidden text-xs text-slate-400 sm:inline">{p.client?.name}</span>
                  </div>
                  <span className="text-sm font-bold text-brand-800 tabular">{formatCurrency(p.contractValue)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low stock — inline */}
        <div className="mt-10 rounded-xl bg-slate-50 p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Low Stock</p>
          <p className="text-sm text-slate-600">
            {data.lowStockMaterials.map((m, i) => (
              <span key={m.id}>
                {i > 0 && <span className="text-slate-300"> · </span>}
                <span className="font-semibold text-brand-950">{m.name}</span>{' '}
                <span className="tabular text-slate-400">{Number(m.currentStock)}/{Number(m.minThreshold)} {m.unit}</span>
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
