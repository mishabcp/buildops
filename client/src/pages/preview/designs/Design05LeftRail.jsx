import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CollectionsChart } from '../../../components/dashboard/CollectionsChart.jsx';
import { StatusDonut } from '../../../components/dashboard/StatusDonut.jsx';
import { PendingBreakdownChart } from '../../../components/dashboard/PendingBreakdownChart.jsx';
import { ExpenseBreakdownChart } from '../../../components/dashboard/ExpenseBreakdownChart.jsx';
import { KPIS, TONE, STATUS_COLORS } from '../previewData.js';
import { cn } from '../../../lib/utils.js';

/** Design 05 — Left Rail Stats: KPI rail + chart-dominant main. */
export function Design05LeftRail({ data }) {
  const fmt = (k, money) => (money ? formatCurrency(data[k] ?? 0) : data[k] ?? '—');
  return (
    <div className="flex flex-col bg-slate-50 lg:flex-row">
      {/* KPI rail */}
      <aside className="shrink-0 bg-white p-5 lg:w-72 lg:border-r lg:border-slate-200">
        <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          {KPIS.map((k) => {
            const t = TONE[k.tone];
            return (
              <div key={k.key} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-2">
                  <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', t.bg, t.text)}>
                    <k.icon className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k.label}</span>
                </div>
                <p className="mt-2 text-lg font-black tracking-tight text-brand-950 tabular">{fmt(k.key, k.money)}</p>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-5 sm:p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-brand-950">Collections Overview</h3>
          <CollectionsChart data={data.collectionsByMonth} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
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

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h3 className="mb-3 text-sm font-bold text-brand-950">Recent Projects</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {data.recentProjects.map((p) => {
                  const s = STATUS_COLORS[p.status] ?? STATUS_COLORS.COMPLETED;
                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 font-bold text-brand-950">{p.name}</td>
                      <td className="py-2.5 text-slate-400">{p.branch?.name}</td>
                      <td className="py-2.5"><span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', s.bg, s.text)}>{p.status}</span></td>
                      <td className="py-2.5 text-right font-mono font-bold text-brand-800 tabular">{formatCurrency(p.contractValue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
      </main>
    </div>
  );
}
