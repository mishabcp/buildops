import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CollectionsChart } from '../../../components/dashboard/CollectionsChart.jsx';
import { StatusDonut } from '../../../components/dashboard/StatusDonut.jsx';
import { KPIS, STATUS_COLORS } from '../previewData.js';
import { cn } from '../../../lib/utils.js';

/** Design 07 — Data-Dense Table-first: spreadsheet-style command view. */
export function Design07Table({ data }) {
  const fmt = (k, money) => (money ? formatCurrency(data[k] ?? 0) : String(data[k] ?? '—'));
  const totalPending = (data.totalPendingToVendors ?? 0) + (data.totalPendingToLabour ?? 0) + (data.totalPendingToAssociates ?? 0);

  return (
    <div className="bg-white p-5 sm:p-8">
      {/* KPI table */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-900 text-left text-white">
              <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest">Metric</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-widest">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {KPIS.map((k, i) => (
              <tr key={k.key} className={i % 2 ? 'bg-slate-50/60' : 'bg-white'}>
                <td className="px-4 py-2.5 font-semibold text-slate-600">{k.label}</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-brand-950 tabular">{fmt(k.key, k.money)}</td>
              </tr>
            ))}
            <tr className="bg-brand-50 font-bold">
              <td className="px-4 py-2.5 text-brand-900">Total Payable</td>
              <td className="px-4 py-2.5 text-right font-mono text-brand-900 tabular">{formatCurrency(totalPending)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Two compact charts */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Collections</h3>
          <CollectionsChart data={data.collectionsByMonth} />
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Pipeline</h3>
          <StatusDonut data={data.projectStatusCounts} />
        </div>
      </div>

      {/* Payables + expenses as tables */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <BreakdownTable title="Accounts Payable" rows={data.pendingBreakdown} />
        <BreakdownTable title="Expense Breakdown" rows={data.expenseBreakdown} />
      </div>

      {/* Recent projects full table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Project</th>
              <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Client</th>
              <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Branch</th>
              <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500">Contract</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.recentProjects.map((p) => {
              const s = STATUS_COLORS[p.status] ?? STATUS_COLORS.COMPLETED;
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-bold text-brand-950">{p.name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{p.client?.name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{p.branch?.name}</td>
                  <td className="px-4 py-2.5"><span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', s.bg, s.text)}>{p.status}</span></td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-brand-800 tabular">{formatCurrency(p.contractValue)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Low stock table */}
      <div className="mt-5">
        <BreakdownTable
          title="Low Stock Materials"
          rows={data.lowStockMaterials.map((m) => ({ name: m.name, value: `${Number(m.currentStock)} / ${Number(m.minThreshold)} ${m.unit}` }))}
          raw
        />
      </div>
    </div>
  );
}

function BreakdownTable({ title, rows, raw }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h3>
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="px-4 py-2.5 font-semibold text-slate-600">{r.name}</td>
              <td className="px-4 py-2.5 text-right font-mono font-bold text-brand-950 tabular">
                {raw ? r.value : formatCurrency(r.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
