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
        <aside className="w-full lg:w-[280px] shrink-0 space-y-6">
          {/* Report Selection Navy */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
             <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
               <BarChart3 className="h-5 w-5 text-slate-400" />
               <h3 className="font-bold text-slate-900 leading-none tracking-tight">Report Modules</h3>
             </div>
             <nav className="p-3 space-y-1">
               {REPORT_TYPES.map((r) => {
                 const isActive = reportType === r.id;
                 const Icon = r.icon;
                 return (
                   <button
                     key={r.id}
                     type="button"
                     onClick={() => setReportType(r.id)}
                     className={cn(
                       'w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] font-bold rounded-2xl transition-all duration-200 group relative overflow-hidden',
                       isActive ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200/50' : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                     )}
                   >
                     {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-md bg-blue-600" />}
                     <div className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-all",
                        isActive ? "bg-white text-blue-600 shadow-sm border border-blue-100" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-blue-500 group-hover:shadow-sm"
                     )}>
                        <Icon className="h-4 w-4" />
                     </div>
                     {r.label}
                   </button>
                 );
               })}
             </nav>
          </div>

          {/* Filtering Context */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
               <Filter className="h-5 w-5 text-slate-400" />
               <h3 className="font-bold text-slate-900 leading-none tracking-tight">Data Parameters</h3>
            </div>
            
            <div className="p-5 space-y-5">
              {isSuperAdmin && (
                <div className="space-y-2 relative">
                  <label className="text-[12px] font-bold uppercase tracking-widest text-slate-500">Reporting Branch</label>
                  <div className="relative">
                    <GitBranch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select
                      className="w-full h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
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
               <div className="space-y-2 relative">
                  <label className="text-[12px] font-bold uppercase tracking-widest text-slate-500">Date Range Boundary</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. 2026-01-01,2026-12-31"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {reportType === 'payment-collection' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 relative">
                     <label className="text-[12px] font-bold uppercase tracking-widest text-slate-500">Month</label>
                     <select
                       className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                       value={month}
                       onChange={(e) => setMonth(e.target.value)}
                     >
                       {MONTHS.map((mName, idx) => (
                         <option key={idx + 1} value={idx + 1}>{mName}</option>
                       ))}
                     </select>
                  </div>
                  <div className="space-y-2 relative">
                     <label className="text-[12px] font-bold uppercase tracking-widest text-slate-500">Year</label>
                     <input
                       type="number"
                       min="2020"
                       max="2035"
                       className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
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
        <main className="min-w-0 flex-1 flex flex-col">
          {/* Header & Export Actions */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
             <div className="relative">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{activeReport?.label}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                   {branchId ? `Filtered by ${branches.find(b => b.id == branchId)?.name ?? 'Selected Branch'}` : 'Consolidated view'}
                   {rows.length > 0 && ` • ${rows.length} records generated`}
                </p>
             </div>
             
             <div className="flex items-center gap-3 relative">
               <Button 
                  size="sm" 
                  onClick={() => loadReport()} 
                  className="h-10 w-10 p-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
               <Button 
                  size="sm" 
                  disabled={exporting !== null || rows.length === 0} 
                  onClick={() => handleExport('pdf')}
                  className="h-10 px-4 rounded-xl gap-2 font-bold shadow-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                >
                  <FileDown className="h-4 w-4" />
                  {exporting === 'pdf' ? 'Formatting…' : 'Export PDF'}
               </Button>
               <Button 
                  size="sm" 
                  disabled={exporting !== null || rows.length === 0} 
                  onClick={() => handleExport('excel')}
                  className="h-10 px-4 rounded-xl gap-2 font-bold shadow-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
               >
                 <FileSpreadsheet className="h-4 w-4" />
                 {exporting === 'excel' ? 'Formatting…' : 'Export Excel'}
               </Button>
             </div>
          </div>

          {error && (
             <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
               <p className="text-sm font-medium text-red-800">{error}</p>
             </div>
          )}

          {/* Table Container */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            {loading ? (
              <div className="p-6">
                <TableSkeleton rows={8} cols={6} />
              </div>
            ) : rows.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-16 text-center">
                 <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center shadow-sm mb-5 border border-slate-100">
                    <BarChart3 className="h-10 w-10 text-slate-300" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Insufficient Data Pipeline</h3>
                 <p className="text-slate-500 font-medium max-w-sm">
                   There are no records matching your selected parameters for this report format. 
                 </p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1 custom-scrollbar">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60 text-slate-500 sticky top-0 z-10">
                    <tr className="text-left">
                      {Object.keys(rows[0]).map((k, index) => (
                        <th key={k} className={cn(
                           "py-4 px-5 font-bold text-[11px] uppercase tracking-widest",
                           index === 0 && "pl-6" // extra padding for first col
                        )}>
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, i) => (
                      <tr key={i} className="group transition-colors hover:bg-slate-50/70">
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
                               index === 0 ? "pl-6 font-bold text-slate-900" : "font-medium text-slate-600",
                               isMonetary && "font-mono font-bold tracking-tight text-[15px] text-slate-700",
                               // Profit mapping color logic specifically for P&L column 'estimatedProfit'
                               (k === 'estimatedProfit' && row[k] < 0) && "text-red-600",
                               (k === 'estimatedProfit' && row[k] > 0) && "text-emerald-600"
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
            )}
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}
