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
import { FileDown, FileSpreadsheet } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'project-pl', label: 'Project P&L', params: ['branchId', 'dateRange'] },
  { id: 'payment-collection', label: 'Payment Collection', params: ['branchId', 'month', 'year'] },
  { id: 'pending-bills', label: 'Pending Bills', params: ['branchId'] },
  { id: 'labour-cost', label: 'Labour Cost', params: ['branchId'] },
  { id: 'material-usage', label: 'Material Usage', params: ['branchId'] },
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
      if (res && !res.success) setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
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
      setError(err.response?.data?.error ?? err.message ?? 'Export failed');
    } finally {
      setExporting(null);
    }
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <PageWrapper title="Reports">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <nav className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-2">
            {REPORT_TYPES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReportType(r.id)}
                className={cn(
                  'w-full rounded-md px-3 py-2 text-left text-sm font-medium',
                  reportType === r.id ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'
                )}
              >
                {r.label}
              </button>
            ))}
          </nav>
          <div className="mt-4 space-y-3">
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                >
                  <option value="">All branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            {reportType === 'project-pl' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Date range (start,end)</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-01-01,2026-12-31"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                />
              </div>
            )}
            {reportType === 'payment-collection' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Month</label>
                  <select
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input
                    type="number"
                    min="2020"
                    max="2030"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <div className="mb-3 flex gap-2">
            <Button size="sm" variant="outline" disabled={exporting !== null} onClick={() => handleExport('pdf')}>
              <FileDown className="mr-1 h-4 w-4" />
              {exporting === 'pdf' ? '…' : 'Export PDF'}
            </Button>
            <Button size="sm" variant="outline" disabled={exporting !== null} onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="mr-1 h-4 w-4" />
              {exporting === 'excel' ? '…' : 'Export Excel'}
            </Button>
          </div>
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : rows.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">No data for this report.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-200 text-left">
                    {Object.keys(rows[0]).map((k) => (
                      <th key={k} className="p-3 font-medium text-gray-700 capitalize">
                        {k.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={cn('border-b border-gray-100', i % 2 === 1 && 'bg-gray-50/50')}>
                      {Object.keys(rows[0]).map((k) => {
                        let v = row[k];
                        if (v instanceof Date || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v))) v = formatDate(v);
                        else if (typeof v === 'number' && /amount|value|cost|balance|received|labour|profit/i.test(k)) v = formatCurrency(v);
                        return (
                          <td key={k} className="p-3">
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
        </main>
      </div>
    </PageWrapper>
  );
}
