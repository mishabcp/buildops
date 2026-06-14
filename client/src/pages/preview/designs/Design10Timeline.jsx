import { TrendingUp, Wallet, Layers, BarChart3, PieChart, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CollectionsChart } from '../../../components/dashboard/CollectionsChart.jsx';
import { StatusDonut } from '../../../components/dashboard/StatusDonut.jsx';
import { PendingBreakdownChart } from '../../../components/dashboard/PendingBreakdownChart.jsx';
import { ExpenseBreakdownChart } from '../../../components/dashboard/ExpenseBreakdownChart.jsx';
import { KPIS, TONE, STATUS_COLORS } from '../previewData.js';
import { cn } from '../../../lib/utils.js';

/** Design 10 — Activity Timeline: a vertical narrative of the business. */
export function Design10Timeline({ data }) {
  const fmt = (k, money) => (money ? formatCurrency(data[k] ?? 0) : data[k] ?? '—');
  return (
    <div className="bg-slate-50 p-5 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="relative border-l-2 border-slate-200 pl-8">
          {/* Node: Snapshot */}
          <Node icon={Layers} tint="brand" title="Snapshot" caption="Where things stand today">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {KPIS.map((k) => {
                const t = TONE[k.tone];
                return (
                  <div key={k.key} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full', t.dot)} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k.label}</span>
                    </div>
                    <p className="mt-1.5 text-lg font-black tracking-tight text-brand-950 tabular">{fmt(k.key, k.money)}</p>
                  </div>
                );
              })}
            </div>
          </Node>

          {/* Node: Collections */}
          <Node icon={TrendingUp} tint="emerald" title="Collections" caption="Trailing six months">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <CollectionsChart data={data.collectionsByMonth} />
            </div>
          </Node>

          {/* Node: Pipeline */}
          <Node icon={PieChart} tint="brand" title="Pipeline" caption="Project status distribution">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <StatusDonut data={data.projectStatusCounts} />
            </div>
          </Node>

          {/* Node: Outflows */}
          <Node icon={Wallet} tint="rose" title="Outflows" caption="Payables and expenses">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Payables</h4>
                <PendingBreakdownChart data={data.pendingBreakdown} />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Expenses</h4>
                <ExpenseBreakdownChart data={data.expenseBreakdown} />
              </div>
            </div>
          </Node>

          {/* Node: Projects */}
          <Node icon={BarChart3} tint="brand" title="Recent Projects" caption="Latest activity">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {data.recentProjects.map((p) => {
                const s = STATUS_COLORS[p.status] ?? STATUS_COLORS.COMPLETED;
                return (
                  <div key={p.id} className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-brand-950">{p.name}</p>
                      <p className="text-[11px] text-slate-400">{p.client?.name} · {p.branch?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', s.bg, s.text)}>{p.status}</span>
                      <span className="font-mono text-sm font-bold text-brand-800 tabular">{formatCurrency(p.contractValue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Node>

          {/* Node: Alerts */}
          <Node icon={AlertTriangle} tint="accent" title="Alerts" caption="Needs attention" last>
            <div className="rounded-2xl border border-accent-200 bg-accent-50 p-5 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-3">
                {data.lowStockMaterials.map((m) => (
                  <div key={m.id} className="rounded-xl bg-white/70 p-3">
                    <p className="truncate text-sm font-bold text-brand-950">{m.name}</p>
                    <p className="text-[11px] font-medium text-accent-700 tabular">{Number(m.currentStock)} {m.unit} · min {Number(m.minThreshold)}</p>
                  </div>
                ))}
              </div>
            </div>
          </Node>
        </div>
      </div>
    </div>
  );
}

const NODE_TINT = {
  brand: 'bg-brand-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  rose: 'bg-rose-600 text-white',
  accent: 'bg-accent-500 text-white',
};

function Node({ icon: Icon, tint, title, caption, children, last }) {
  return (
    <div className={cn('relative', last ? '' : 'pb-10')}>
      <span className={cn('absolute -left-[2.55rem] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-slate-50', NODE_TINT[tint])}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="mb-3">
        <h3 className="text-base font-black tracking-tight text-brand-950">{title}</h3>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{caption}</p>
      </div>
      {children}
    </div>
  );
}
