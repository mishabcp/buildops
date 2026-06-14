import { ArrowDownLeft, ArrowUpRight, Layers, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CollectionsChart } from '../../../components/dashboard/CollectionsChart.jsx';
import { StatusDonut } from '../../../components/dashboard/StatusDonut.jsx';
import { PendingBreakdownChart } from '../../../components/dashboard/PendingBreakdownChart.jsx';
import { ExpenseBreakdownChart } from '../../../components/dashboard/ExpenseBreakdownChart.jsx';
import { STATUS_COLORS } from '../previewData.js';
import { cn } from '../../../lib/utils.js';

/** Design 09 — Money Flow Columns: In / Out / Operations swimlanes. */
export function Design09MoneyFlow({ data }) {
  const totalOut = (data.totalPendingToVendors ?? 0) + (data.totalPendingToLabour ?? 0) + (data.totalPendingToAssociates ?? 0);
  return (
    <div className="bg-slate-50 p-5 sm:p-8">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* MONEY IN */}
        <Column title="Money In" icon={ArrowUpRight} tint="emerald">
          <Metric label="Received this month" value={formatCurrency(data.totalReceivedThisMonth)} tint="emerald" />
          <Metric label="Outstanding (clients)" value={formatCurrency(data.totalOutstandingFromClients)} tint="emerald" subtle />
          <Panel title="Collections trend">
            <CollectionsChart data={data.collectionsByMonth} />
          </Panel>
        </Column>

        {/* MONEY OUT */}
        <Column title="Money Out" icon={ArrowDownLeft} tint="rose">
          <Metric label="Pending to vendors" value={formatCurrency(data.totalPendingToVendors)} tint="rose" />
          <Metric label="Pending to labour" value={formatCurrency(data.totalPendingToLabour)} tint="rose" subtle />
          <Metric label="Pending to associates" value={formatCurrency(data.totalPendingToAssociates)} tint="rose" subtle />
          <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">
            Total out: <span className="font-mono tabular">{formatCurrency(totalOut)}</span>
          </div>
          <Panel title="Payables breakdown">
            <PendingBreakdownChart data={data.pendingBreakdown} />
          </Panel>
          <Panel title="Expense mix">
            <ExpenseBreakdownChart data={data.expenseBreakdown} />
          </Panel>
        </Column>

        {/* OPERATIONS */}
        <Column title="Operations" icon={Layers} tint="brand">
          <Metric label="Active projects" value={String(data.activeProjects)} tint="brand" />
          <Panel title="Pipeline">
            <StatusDonut data={data.projectStatusCounts} />
          </Panel>
          <Panel title="Recent projects">
            <div className="space-y-2">
              {data.recentProjects.map((p) => {
                const s = STATUS_COLORS[p.status] ?? STATUS_COLORS.COMPLETED;
                return (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="truncate font-semibold text-brand-950">{p.name}</span>
                    <span className={cn('ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', s.bg, s.text)}>{p.status}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
          <div className="rounded-xl border border-accent-200 bg-accent-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-accent-700">
              <AlertTriangle className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wide">Low stock</h4>
            </div>
            {data.lowStockMaterials.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-brand-950">{m.name}</span>
                <span className="font-mono text-accent-700 tabular">{Number(m.currentStock)}/{Number(m.minThreshold)}</span>
              </div>
            ))}
          </div>
        </Column>
      </div>
    </div>
  );
}

const TINTS = {
  emerald: 'bg-emerald-100 text-emerald-700',
  rose: 'bg-rose-100 text-rose-700',
  brand: 'bg-brand-100 text-brand-700',
};

function Column({ title, icon: Icon, tint, children }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/60 p-4">
      <div className="flex items-center gap-2">
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', TINTS[tint])}>
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-black uppercase tracking-wide text-brand-950">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value, tint, subtle }) {
  return (
    <div className={cn('rounded-xl p-3', subtle ? 'bg-slate-50' : cn(TINTS[tint], 'bg-opacity-40'))}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black tracking-tight text-brand-950 tabular">{value}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h4>
      {children}
    </div>
  );
}
