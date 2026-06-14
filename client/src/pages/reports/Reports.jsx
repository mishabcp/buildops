import { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Button } from '../../components/ui/button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import {
  getReportProjectPl,
  getReportPaymentCollection,
  getReportPendingBills,
  getReportLabourCost,
  getReportMaterialUsage,
  downloadExport,
} from '../../api/reports.api.js';
import { getBranches } from '../../api/branches.api.js';
import { authStore } from '../../store/authStore.js';
import { cn } from '../../lib/utils.js';
import { TableSkeleton } from '../../components/shared/TableSkeleton.jsx';
import { 
  FileDown, 
  FileSpreadsheet, 
  PieChart, 
  Banknote, 
  Receipt, 
  Users, 
  PackageOpen,
  Filter,
  BarChart3,
  CalendarDays,
  RefreshCw,
  GitBranch
} from 'lucide-react';

const REPORT_TYPES = [
  { id: 'project-pl', label: 'Project Dashboard (P&L)', icon: PieChart, params: ['branchId', 'dateRange'] },
  { id: 'payment-collection', label: 'Payment Collection', icon: Banknote, params: ['branchId', 'month', 'year'] },
  { id: 'pending-bills', label: 'Pending Vendor Bills', icon: Receipt, params: ['branchId'] },
  { id: 'labour-cost', label: 'Labour Cost Analysis', icon: Users, params: ['branchId'] },
  { id: 'material-usage', label: 'Material Usage Log', icon: PackageOpen, params: ['branchId'] },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function Reports() {
  const user = authStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [reportType, setReportType] = useState('project-pl');
  const [branchId, setBranchId] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [branches, setBranches] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    if (isSuperAdmin) getBranches().then((r) => r?.success && r?.data && setBranches(r.data));
  }, [isSuperAdmin]);

  useEffect(() => {
    loadReport();
  }, [reportType, branchId, dateRange, month, year]);

  async function loadReport() {
    setLoading(true);
    setError('');
    const params = {};
    if (branchId) params.branchId = branchId;
    if (reportType === 'project-pl' && dateRange) params.dateRange = dateRange;
    if (reportType === 'payment-collection') {
      params.month = month;
      params.year = year;
    }
    try {
      let res;
      switch (reportType) {
        case 'project-pl':
          res = await getReportProjectPl(params);
          setData(res?.data ?? []);
          break;
        case 'payment-collection':
          res = await getReportPaymentCollection(params);
          setData(res?.data?.rows ?? res?.data ?? []);
          break;
        case 'pending-bills':
          res = await getReportPendingBills(params);
          setData(res?.data ?? []);
          break;
        case 'labour-cost':
          res = await getReportLabourCost(params);
          setData(res?.data ?? []);
          break;
        case 'material-usage':
          res = await getReportMaterialUsage(params);
          setData(res?.data ?? []);
          break;
        default:
          setData([]);
      }
      if (res && !res.success) setError(res?.error ?? 'Failed to load report data');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load report data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(format) {
    const params = { report: reportType };
    if (branchId) params.branchId = branchId;
    if (reportType === 'project-pl' && dateRange) params.dateRange = dateRange;
    if (reportType === 'payment-collection') {
      params.month = month;
      params.year = year;
    }
    setExporting(format);
    try {
      await downloadExport(format, params);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Export rendering failed');
    } finally {
      setExporting(null);
    }
  }

  const rows = Array.isArray(data) ? data : [];
  const activeReport = REPORT_TYPES.find(r => r.id === reportType);

  return (
    <PageWrapper title="Analysis & Reports">
      <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ── Sidebar Navigation & Filters ── */}
        <aside className="w-full lg:w-[300px] shrink-0 space-y-4 lg:space-y-6">
          {/* Report Selection Modules - Horizontal scroll on mobile, vertical on desktop */}
          <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden transition-all">
             <div className="bg-slate-50/50 px-5 lg:px-6 py-3 lg:py-4 border-b border-slate-100 flex items-center gap-2">
               <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
               <h3 className="font-bold text-slate-900 text-sm lg:text-base leading-none tracking-tight">Report Modules</h3>
             </div>
             
             {/* Horizontal Scroll logic for mobile */}
             <div className="p-2 lg:p-3 overflow-x-auto lg:overflow-x-visible custom-scrollbar">
                <nav className="flex lg:flex-col gap-1.5 lg:gap-1 min-w-max lg:min-w-0 pb-1 lg:pb-0">
                  {REPORT_TYPES.map((r) => {
                    const isActive = reportType === r.id;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setReportType(r.id)}
                        className={cn(
                          'flex items-center gap-2.5 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 text-left text-[13px] lg:text-[14px] font-bold rounded-xl lg:rounded-2xl transition-all duration-200 group relative whitespace-nowrap lg:whitespace-normal',
                          isActive 
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-200' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600 border border-transparent'
                        )}
                      >
                        <div className={cn(
                           "h-7 w-7 lg:h-8 lg:w-8 rounded-lg lg:rounded-xl flex items-center justify-center shrink-0 transition-all",
                           isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500"
                        )}>
                           <Icon className="h-4 w-4" />
                        </div>
                        {r.label}
                      </button>
                    );
                  })}
                </nav>
             </div>
          </div>

          {/* Filtering Context - Collapsible on small screens? No, just more compact */}
          <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-5 lg:px-6 py-3 lg:py-4 border-b border-slate-100 flex items-center gap-2">
               <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
               <h3 className="font-bold text-slate-900 text-sm lg:text-base leading-none tracking-tight">Data Parameters</h3>
            </div>
            
            <div className="p-4 lg:p-5 space-y-4 lg:space-y-5">
              {isSuperAdmin && (
                <div className="space-y-1.5 lg:space-y-2 relative">
                  <label className="text-[10px] lg:text-[11px] font-bold uppercase tracking-widest text-slate-400">Reporting Branch</label>
                  <div className="relative">
                    <GitBranch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select
                      className="w-full h-10 lg:h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[13px] font-semibold text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all cursor-pointer"
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                    >
                      <option value="">Consolidated (All)</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {reportType === 'project-pl' && (
               <div className="space-y-1.5 lg:space-y-2 relative">
                  <label className="text-[10px] lg:text-[11px] font-bold uppercase tracking-widest text-slate-400">Date Range Boundary</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. 2026-01-01,2026-12-31"
                      className="w-full h-10 lg:h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[13px] font-semibold text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {reportType === 'payment-collection' && (
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="space-y-1.5 lg:space-y-2 relative">
                     <label className="text-[10px] lg:text-[11px] font-bold uppercase tracking-widest text-slate-400">Month</label>
                     <select
                       className="w-full h-10 lg:h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[13px] font-semibold text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all cursor-pointer"
                       value={month}
                       onChange={(e) => setMonth(e.target.value)}
                     >
                       {MONTHS.map((mName, idx) => (
                         <option key={idx + 1} value={idx + 1}>{mName}</option>
                       ))}
                     </select>
                  </div>
                  <div className="space-y-1.5 lg:space-y-2 relative">
                     <label className="text-[10px] lg:text-[11px] font-bold uppercase tracking-widest text-slate-400">Year</label>
                     <input
                       type="number"
                       min="2020"
                       max="2035"
                       className="w-full h-10 lg:h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[13px] font-semibold text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                       value={year}
                       onChange={(e) => setYear(e.target.value)}
                     />
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main Data View ── */}
        <main className="min-w-0 flex-1 flex flex-col space-y-4 lg:space-y-6">
          {/* Header & Export Actions */}
          <div className="bg-white p-5 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
             <div className="relative">
                <h2 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900">{activeReport?.label}</h2>
                <p className="text-[13px] font-medium text-slate-400 mt-1 flex items-center gap-2">
                   {branchId ? (
                     <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md border border-brand-100/50">
                        {branches.find(b => String(b.id) === String(branchId))?.name ?? 'Branch Filtered'}
                     </span>
                   ) : (
                     <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">Consolidated View</span>
                   )}
                   {rows.length > 0 && <span className="w-1 h-1 rounded-full bg-slate-300" />}
                   {rows.length > 0 && <span>{rows.length} records</span>}
                </p>
             </div>
             
             <div className="flex flex-wrap items-center gap-2 lg:gap-3 relative">
               <Button 
                  size="sm" 
                  onClick={() => loadReport()} 
                  className="h-9 lg:h-10 w-9 lg:w-10 p-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
               <Button 
                  size="sm" 
                  disabled={exporting !== null || rows.length === 0} 
                  onClick={() => handleExport('pdf')}
                  className="h-9 lg:h-10 px-3 lg:px-4 rounded-xl gap-2 font-bold shadow-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand-700 transition-all"
                >
                  <FileDown className="h-4 w-4" />
                  <span className="hidden sm:inline">{exporting === 'pdf' ? 'Exporting…' : 'PDF'}</span>
                  <span className="sm:hidden">PDF</span>
               </Button>
               <Button 
                  size="sm" 
                  disabled={exporting !== null || rows.length === 0} 
                  onClick={() => handleExport('excel')}
                  className="h-9 lg:h-10 px-3 lg:px-4 rounded-xl gap-2 font-bold shadow-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition-all"
               >
                 <FileSpreadsheet className="h-4 w-4" />
                 <span className="hidden sm:inline">{exporting === 'excel' ? 'Exporting…' : 'Excel'}</span>
                 <span className="sm:hidden">Excel</span>
               </Button>
             </div>
          </div>

          {error && (
             <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm animate-in shake">
               <p className="text-sm font-medium text-red-800">{error}</p>
             </div>
          )}

          {/* Table Container */}
          <div className="flex-1 bg-white rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
            {loading ? (
              <div className="p-6 overflow-hidden">
                <TableSkeleton rows={10} cols={6} />
              </div>
            ) : rows.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 lg:p-20 text-center">
                 <div className="h-16 w-16 lg:h-20 lg:w-20 bg-slate-50 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-sm mb-5 border border-slate-100">
                    <BarChart3 className="h-8 w-8 lg:h-10 lg:w-10 text-slate-200" />
                 </div>
                 <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2">No data generated</h3>
                 <p className="text-slate-400 font-medium max-w-xs text-sm">
                   We couldn't find any information for the selected report and parameters. Try adjusting your filters.
                 </p>
              </div>
            ) : (
              <>
                {/* Desktop View: Table */}
                <div className="hidden sm:block overflow-x-auto custom-scrollbar flex-1">
                  <table className="w-full text-sm whitespace-nowrap">
                    <thead className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60 text-slate-400 sticky top-0 z-10 font-black">
                      <tr className="text-left">
                        {Object.keys(rows[0]).map((k, index) => (
                          <th key={k} className={cn(
                             "py-4 px-5 text-[10px] uppercase tracking-widest",
                             index === 0 && "pl-8"
                          )}>
                            {k.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((row, i) => (
                        <tr key={i} className="group transition-colors hover:bg-slate-50/70 border-b border-slate-50/50 last:border-0 font-medium">
                          {Object.keys(rows[0]).map((k, index) => {
                            let v = row[k];
                            let isMonetary = false;
                            
                            if (v instanceof Date || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v))) {
                               v = formatDate(v);
                            } else if (typeof v === 'number' && /amount|value|cost|balance|received|labour|profit/i.test(k)) {
                               v = formatCurrency(v);
                               isMonetary = true;
                            }
                            
                            return (
                              <td key={k} className={cn(
                                 "py-4 px-5",
                                 index === 0 ? "pl-8 font-bold text-slate-900" : "text-slate-600",
                                 isMonetary && "font-mono font-bold tracking-tight text-slate-900",
                                 (k === 'estimatedProfit' && row[k] < 0) && "text-red-600 bg-red-50/30",
                                 (k === 'estimatedProfit' && row[k] > 0) && "text-emerald-600 bg-emerald-50/30",
                                 k === 'profitMargin' && "font-black"
                              )}>
                                {v ?? '—'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: Cards */}
                <div className="sm:hidden divide-y divide-slate-100 overflow-y-auto max-h-[calc(100vh-350px)] custom-scrollbar">
                   {rows.map((row, i) => (
                     <div key={i} className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs ring-1 ring-brand-100">
                                 {i + 1}
                              </div>
                              <h4 className="font-bold text-slate-900">{row[Object.keys(row)[0]]}</h4>
                           </div>
                           {/* Highlight key metric if possible */}
                           {row.status && <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">{row.status}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                           {Object.keys(row).slice(1).map((k) => {
                             let v = row[k];
                             let isMonetary = false;
                             
                             if (v instanceof Date || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v))) {
                                v = formatDate(v);
                             } else if (typeof v === 'number' && /amount|value|cost|balance|received|labour|profit/i.test(k)) {
                                v = formatCurrency(v);
                                isMonetary = true;
                             }

                             return (
                               <div key={k} className="flex flex-col space-y-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className={cn(
                                    "text-[13px] font-bold text-slate-700 leading-none",
                                    isMonetary && "font-mono font-black",
                                    (k === 'estimatedProfit' && row[k] < 0) && "text-red-500",
                                    (k === 'estimatedProfit' && row[k] > 0) && "text-emerald-500"
                                  )}>
                                     {v ?? '—'}
                                  </span>
                               </div>
                             );
                           })}
                        </div>
                     </div>
                   ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}
