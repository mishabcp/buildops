import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CollectionsChart } from '../../../components/dashboard/CollectionsChart.jsx';
import { StatusDonut } from '../../../components/dashboard/StatusDonut.jsx';
import { PendingBreakdownChart } from '../../../components/dashboard/PendingBreakdownChart.jsx';
import { ExpenseBreakdownChart } from '../../../components/dashboard/ExpenseBreakdownChart.jsx';
import { KPIS, STATUS_COLORS } from '../previewData.js';
import { cn } from '../../../lib/utils.js';

/** Design 04 — Editorial / Magazine: oversized numbers, column rhythm. */
export function Design04Editorial({ data }) {
  const fmt = (k, money) => (money ? formatCurrency(data[k] ?? 0) : String(data[k] ?? '—'));
  const lead = KPIS[1]; // Received this month
  return (
    <div className="bg-white p-6 sm:p-10">
      {/* Masthead */}
      <div className="border-b-4 border-brand-950 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent-500">The Buildops Ledger</p>
        <h2 className="mt-1 text-4xl font-black tracking-tighter text-brand-950 sm:text-5xl">Monthly Report</h2>
      </div>

      {/* Lead story */}
      <div className="grid gap-8 border-b border-slate-200 py-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{lead.label}</p>
          <p className="mt-2 text-5xl font-black leading-none tracking-tighter text-brand-950 tabular sm:text-6xl">
            {formatCurrency(data[lead.key])}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Collections held steady this period across {data.activeProjects} active projects, with healthy receivables in the pipeline.
          </p>
        </div>
        <div className="lg:col-span-2">
          <CollectionsChart data={data.collectionsByMonth} />
        </div>
      </div>

      {/* KPI column rhythm */}
      <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200 lg:grid-cols-5">
        {KPIS.filter((k) => k.key !== lead.key).map((k) => (
          <div key={k.key} className="px-4 py-6 first:pl-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k.label}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-brand-950 tabular">{fmt(k.key, k.money)}</p>
          </div>
        ))}
      </div>

      {/* Three column charts */}
      <div className="grid gap-8 py-8 lg:grid-cols-3">
        <div>
          <h3 className="mb-3 border-b border-slate-200 pb-2 text-sm font-black uppercase tracking-wide text-brand-950">Pipeline</h3>
          <StatusDonut data={data.projectStatusCounts} />
        </div>
        <div>
          <h3 className="mb-3 border-b border-slate-200 pb-2 text-sm font-black uppercase tracking-wide text-brand-950">Payables</h3>
          <PendingBreakdownChart data={data.pendingBreakdown} />
        </div>
        <div>
          <h3 className="mb-3 border-b border-slate-200 pb-2 text-sm font-black uppercase tracking-wide text-brand-950">Expenses</h3>
          <ExpenseBreakdownChart data={data.expenseBreakdown} />
        </div>
      </div>

      {/* Recent projects as editorial list */}
      <div className="grid gap-8 border-t border-slate-200 py-8 lg:grid-cols-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-brand-950">Recent<br />Projects</h3>
        <div className="lg:col-span-2">
          {data.recentProjects.map((p) => {
            const s = STATUS_COLORS[p.status] ?? STATUS_COLORS.COMPLETED;
            return (
              <div key={p.id} className="flex items-baseline justify-between border-b border-slate-100 py-3 last:border-0">
                <div className="flex items-baseline gap-3">
                  <span className="font-black text-brand-950">{p.name}</span>
                  <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold uppercase', s.bg, s.text)}>{p.status}</span>
                </div>
                <span className="font-mono text-sm font-bold text-brand-800 tabular">{formatCurrency(p.contractValue)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low stock footer */}
      <div className="border-t-4 border-accent-400 pt-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-accent-600">Stockroom Watch</p>
        <p className="mt-1 text-sm text-slate-600">
          {data.lowStockMaterials.map((m, i) => (
            <span key={m.id}>{i > 0 && ' / '}<strong className="text-brand-950">{m.name}</strong> ({Number(m.currentStock)} {m.unit})</span>
          ))}
        </p>
      </div>
    </div>
  );
}
