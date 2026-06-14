import { Activity, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CollectionsChart } from '../../../components/dashboard/CollectionsChart.jsx';
import { StatusDonut } from '../../../components/dashboard/StatusDonut.jsx';
import { PendingBreakdownChart } from '../../../components/dashboard/PendingBreakdownChart.jsx';
import { ExpenseBreakdownChart } from '../../../components/dashboard/ExpenseBreakdownChart.jsx';
import { KPIS, TONE, STATUS_COLORS } from '../previewData.js';
import { cn } from '../../../lib/utils.js';

/** Design 02 — Dark Command Center: ops console on deep navy. */
export function Design02DarkOps({ data }) {
  const fmt = (k, money) => (money ? formatCurrency(data[k] ?? 0) : data[k] ?? '—');
  return (
    <div className="bg-brand-950 p-5 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/20 text-accent-400">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-white">Operations Console</h2>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Live financial telemetry</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {KPIS.map((k) => {
          const t = TONE[k.tone];
          return (
            <div key={k.key} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k.label}</span>
                <span className={cn('h-2 w-2 rounded-full', t.dot)} />
              </div>
              <p className="mt-3 text-lg font-black tracking-tight text-white tabular">{fmt(k.key, k.money)}</p>
            </div>
          );
        })}
      </div>

      {/* Charts grid in light cards for readability */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white p-4 lg:col-span-2">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Collections — 6 months</h3>
          <CollectionsChart data={data.collectionsByMonth} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white p-4">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Pipeline</h3>
          <StatusDonut data={data.projectStatusCounts} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white p-4">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Payables</h3>
          <PendingBreakdownChart data={data.pendingBreakdown} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white p-4">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Expenses</h3>
          <ExpenseBreakdownChart data={data.expenseBreakdown} />
        </div>
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-accent-300">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="text-sm font-bold">Low Stock</h3>
          </div>
          <div className="space-y-2">
            {data.lowStockMaterials.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">{m.name}</span>
                <span className="font-mono text-accent-300 tabular">{Number(m.currentStock)}/{Number(m.minThreshold)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent projects */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-bold text-white">Recent Projects</h3>
        </div>
        <div className="divide-y divide-white/5">
          {data.recentProjects.map((p) => {
            const s = STATUS_COLORS[p.status] ?? STATUS_COLORS.COMPLETED;
            return (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.client?.name} · {p.branch?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('h-2 w-2 rounded-full', s.dot)} />
                  <span className="font-mono text-sm font-bold text-white tabular">{formatCurrency(p.contractValue)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
