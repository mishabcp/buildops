import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CollectionsChart } from '../../../components/dashboard/CollectionsChart.jsx';
import { StatusDonut } from '../../../components/dashboard/StatusDonut.jsx';
import { PendingBreakdownChart } from '../../../components/dashboard/PendingBreakdownChart.jsx';
import { ExpenseBreakdownChart } from '../../../components/dashboard/ExpenseBreakdownChart.jsx';
import { KPIS, STATUS_COLORS } from '../previewData.js';
import { cn } from '../../../lib/utils.js';

const GRADS = {
  brand: 'from-brand-500 to-brand-700',
  accent: 'from-accent-400 to-accent-600',
  emerald: 'from-emerald-400 to-emerald-600',
  rose: 'from-rose-400 to-rose-600',
  amber: 'from-amber-400 to-amber-600',
};

/** Design 06 — Glass Gradient: vivid gradient cards on a soft canvas. */
export function Design06Glass({ data }) {
  const fmt = (k, money) => (money ? formatCurrency(data[k] ?? 0) : data[k] ?? '—');
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50 p-5 sm:p-8">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-accent-300/30 blur-3xl" />

      <div className="relative">
        {/* Gradient KPI cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {KPIS.map((k) => (
            <div key={k.key} className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg', GRADS[k.tone])}>
              <k.icon className="absolute -bottom-3 -right-3 h-16 w-16 text-white/20" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">{k.label}</p>
              <p className="mt-3 text-xl font-black tracking-tight tabular">{fmt(k.key, k.money)}</p>
            </div>
          ))}
        </div>

        {/* Glass chart panels */}
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl lg:col-span-2">
            <h3 className="mb-2 text-sm font-bold text-brand-950">Collections Overview</h3>
            <CollectionsChart data={data.collectionsByMonth} />
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
            <h3 className="mb-2 text-sm font-bold text-brand-950">Pipeline</h3>
            <StatusDonut data={data.projectStatusCounts} />
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
            <h3 className="mb-2 text-sm font-bold text-brand-950">Payables</h3>
            <PendingBreakdownChart data={data.pendingBreakdown} />
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
            <h3 className="mb-2 text-sm font-bold text-brand-950">Expenses</h3>
            <ExpenseBreakdownChart data={data.expenseBreakdown} />
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-accent-700">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="text-sm font-bold">Low Stock</h3>
            </div>
            <div className="space-y-2">
              {data.lowStockMaterials.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-brand-950">{m.name}</span>
                  <span className="font-mono text-accent-700 tabular">{Number(m.currentStock)}/{Number(m.minThreshold)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent projects */}
        <div className="mt-5 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
          <h3 className="mb-3 text-sm font-bold text-brand-950">Recent Projects</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.recentProjects.map((p) => {
              const s = STATUS_COLORS[p.status] ?? STATUS_COLORS.COMPLETED;
              return (
                <div key={p.id} className="rounded-xl bg-white/80 p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', s.bg, s.text)}>{p.status}</span>
                    <span className="font-mono text-sm font-bold text-brand-800 tabular">{formatCurrency(p.contractValue)}</span>
                  </div>
                  <p className="mt-2 truncate text-sm font-bold text-brand-950">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.client?.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
