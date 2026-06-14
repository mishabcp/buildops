import { useEffect, useMemo, useState } from 'react';
import { Download, Printer, ChevronLeft, ChevronRight, LayoutDashboard, Check } from 'lucide-react';
import { getDashboard } from '../../api/dashboard.api.js';
import { normalizeDashboard } from './previewData.js';
import { cn } from '../../lib/utils.js';
import { Design01Bento } from './designs/Design01Bento.jsx';
import { Design02DarkOps } from './designs/Design02DarkOps.jsx';
import { Design03Minimal } from './designs/Design03Minimal.jsx';
import { Design04Editorial } from './designs/Design04Editorial.jsx';
import { Design05LeftRail } from './designs/Design05LeftRail.jsx';
import { Design06Glass } from './designs/Design06Glass.jsx';
import { Design07Table } from './designs/Design07Table.jsx';
import { Design08Hero } from './designs/Design08Hero.jsx';
import { Design09MoneyFlow } from './designs/Design09MoneyFlow.jsx';
import { Design10Timeline } from './designs/Design10Timeline.jsx';

const DESIGNS = [
  { id: 1, name: 'Bento Grid', Component: Design01Bento },
  { id: 2, name: 'Dark Command', Component: Design02DarkOps },
  { id: 3, name: 'Minimal Mono', Component: Design03Minimal },
  { id: 4, name: 'Editorial', Component: Design04Editorial },
  { id: 5, name: 'Left Rail', Component: Design05LeftRail },
  { id: 6, name: 'Glass Gradient', Component: Design06Glass },
  { id: 7, name: 'Data Dense', Component: Design07Table },
  { id: 8, name: 'Hero Spotlight', Component: Design08Hero },
  { id: 9, name: 'Money Flow', Component: Design09MoneyFlow },
  { id: 10, name: 'Activity Timeline', Component: Design10Timeline },
];

const STORAGE_KEY = 'buildops_dashboard_design';

export function DashboardPreview() {
  const [apiData, setApiData] = useState(null);
  const [active, setActive] = useState(() => Number(localStorage.getItem(STORAGE_KEY)) || 1);

  useEffect(() => {
    getDashboard({})
      .then((res) => {
        if (res?.success && res?.data) setApiData(res.data);
      })
      .catch(() => {
        /* fall back to sample data */
      });
  }, []);

  const data = useMemo(() => normalizeDashboard(apiData), [apiData]);
  const current = DESIGNS.find((d) => d.id === active) ?? DESIGNS[0];
  const ActiveDesign = current.Component;

  const select = (id) => {
    setActive(id);
    localStorage.setItem(STORAGE_KEY, String(id));
  };
  const go = (dir) => {
    const idx = DESIGNS.findIndex((d) => d.id === active);
    const next = (idx + dir + DESIGNS.length) % DESIGNS.length;
    select(DESIGNS[next].id);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buildops-dashboard-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100">
      {/* Toolbar (hidden when printing) — sits just below the app navbar */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/90 backdrop-blur print:hidden">
        <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800 text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-brand-950">Dashboard Design Gallery</h1>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                10 concepts · same data · pick your favourite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => go(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50"
              aria-label="Previous design"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50"
              aria-label="Next design"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={downloadJSON}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-brand-800 transition-all hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Download data
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-800 px-4 text-sm font-bold text-white shadow-brand transition-all hover:bg-brand-900"
            >
              <Printer className="h-4 w-4" /> Print / PDF
            </button>
          </div>
        </div>

        {/* Design chips */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {DESIGNS.map((d) => (
            <button
              key={d.id}
              onClick={() => select(d.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-all',
                active === d.id
                  ? 'border-brand-800 bg-brand-800 text-white shadow-brand'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-800'
              )}
            >
              {active === d.id && <Check className="h-3.5 w-3.5" />}
              <span className="text-[11px] font-black tabular opacity-60">{String(d.id).padStart(2, '0')}</span>
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected design */}
      <div className="mx-auto max-w-[1600px]">
        <ActiveDesign data={data} />
      </div>
    </div>
  );
}
