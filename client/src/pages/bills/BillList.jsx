import { useState, useEffect, Fragment } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { getBills, createBill, updateBill, addBillPayment } from '../../api/bills.api.js';
import { getBranches } from '../../api/branches.api.js';
import { BillForm } from './BillForm.jsx';
import { BillPaymentForm } from './BillPaymentForm.jsx';
import { TableSkeleton } from '../../components/shared/TableSkeleton.jsx';
import { Plus, ChevronDown, ChevronRight, ReceiptText, Banknote, Search, Filter } from 'lucide-react';
import { authStore } from '../../store/authStore.js';
import { cn } from '../../lib/utils.js';

const TABS = [
  { id: 'all', label: 'All Bills' },
  { id: 'PAYABLE', label: 'Accounts Payable' },
  { id: 'RECEIVABLE', label: 'Accounts Receivable' },
];

export function BillList() {
  const user = authStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [bills, setBills] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [branchId, setBranchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [paymentBill, setPaymentBill] = useState(null);

  useEffect(() => {
    loadBills();
    if (isSuperAdmin) getBranches().then((r) => r?.success && r?.data && setBranches(r.data));
  }, [tab, branchId, statusFilter, isSuperAdmin]);

  async function loadBills() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (tab !== 'all') params.type = tab;
      if (branchId) params.branchId = branchId;
      if (statusFilter) params.status = statusFilter;
      const res = await getBills(params);
      if (res?.success && res?.data) setBills(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveBill(payload) {
    if (editingBill) {
      const res = await updateBill(editingBill.id, payload);
      if (res?.success && res?.data) {
        setBills((prev) => prev.map((b) => (b.id === editingBill.id ? res.data : b)));
        setEditingBill(null);
        setShowForm(false);
      } else throw new Error(res?.error);
    } else {
      const res = await createBill(payload);
      if (res?.success && res?.data) {
        setBills((prev) => [res.data, ...prev]);
        setShowForm(false);
      } else throw new Error(res?.error);
    }
  }

  async function handleRecordPayment(billId, payload) {
    const res = await addBillPayment(billId, payload);
    if (res?.success && res?.data?.bill) {
      setBills((prev) => prev.map((b) => (b.id === billId ? res.data.bill : b)));
      setPaymentBill(null);
    } else throw new Error(res?.error);
  }

  const balance = (b) => (Number(b.totalAmount) || 0) - (Number(b.paidAmount) || 0);

  if (loading && bills.length === 0) return <PageWrapper title="Bills Directory"><TableSkeleton rows={6} cols={10} /></PageWrapper>;

  return (
    <PageWrapper title="Bills Directory">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Top Banner and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
           <div className="flex bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto overflow-x-auto custom-scrollbar">
             {TABS.map((t) => (
               <button
                 key={t.id}
                 type="button"
                 onClick={() => setTab(t.id)}
                 className={cn(
                   "px-5 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap",
                   tab === t.id 
                    ? "bg-white text-brand-700 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                 )}
               >
                 {t.label}
               </button>
             ))}
           </div>

           <div className="flex flex-wrap items-center gap-3">
              {isSuperAdmin && (
                <div className="relative min-w-[160px]">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select 
                    className="w-full h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-[13px] font-semibold text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" 
                    value={branchId} 
                    onChange={(e) => setBranchId(e.target.value)}
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              
              <div className="relative min-w-[150px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select 
                  className="w-full h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-[13px] font-semibold text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PAID">Fully Paid</option>
                </select>
              </div>

              <Button 
                onClick={() => { setEditingBill(null); setShowForm(true); }} 
                className="hidden sm:flex h-10 px-5 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 font-bold transition-all hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                Record Bill
              </Button>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {bills.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center flex flex-col items-center justify-center">
            <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-5 border border-slate-100">
               <ReceiptText className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Bills Found</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-6">There are no bills matching your current filter criteria.</p>
            <Button 
              className="h-11 px-6 rounded-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm"
              onClick={() => setShowForm(true)}
            >
               <Plus className="h-4 w-4 mr-2" />
               Record First Bill
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="p-4 font-bold text-[12px] uppercase tracking-wider w-10 text-center"></th>
                    <th className="p-4 font-bold text-[12px] uppercase tracking-wider">Vendor / Party</th>
                    <th className="p-4 font-bold text-[12px] uppercase tracking-wider">Bill Reference</th>
                    <th className="p-4 font-bold text-[12px] uppercase tracking-wider">Bill Date</th>
                    <th className="p-4 font-bold text-[12px] uppercase tracking-wider">Due Date</th>
                    <th className="p-4 font-bold text-[12px] uppercase tracking-wider">Total Value</th>
                    <th className="p-4 font-bold text-[12px] uppercase tracking-wider">Paid</th>
                    <th className="p-4 font-bold text-[12px] uppercase tracking-wider">Balance</th>
                    <th className="p-4 font-bold text-[12px] uppercase tracking-wider">Linked Project</th>
                    <th className="p-4 font-bold text-[12px] uppercase tracking-wider">Status</th>
                    <th className="p-4 font-bold text-[12px] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bills.map((b) => {
                    const isExpanded = expandedId === b.id;
                    const bal = balance(b);
                    
                    return (
                      <Fragment key={b.id}>
                        <tr 
                          className={cn(
                             "group transition-colors cursor-pointer",
                             isExpanded ? "bg-brand-50/50" : "hover:bg-slate-50/80"
                          )}
                          onClick={() => setExpandedId(isExpanded ? null : b.id)}
                        >
                          <td className="p-4 text-center">
                            <button className="text-slate-400 hover:text-brand-600 transition-colors bg-white hover:bg-brand-50 p-1 rounded-md shadow-sm border border-slate-200">
                               {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="p-4">
                             <div className="font-bold text-slate-900">{b.partyName}</div>
                             <div className="text-[11px] font-semibold text-slate-400">{b.type?.replace(/_/g, ' ')}</div>
                          </td>
                          <td className="p-4 font-medium text-slate-600">
                             {b.billNumber ? (
                               <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200 shadow-sm">
                                 #{b.billNumber}
                               </span>
                             ) : <span className="text-slate-400 italic">No Ref</span>}
                          </td>
                          <td className="p-4 font-medium text-slate-600">{formatDate(b.billDate)}</td>
                          <td className="p-4">
                             {b.dueDate ? (
                               <span className={cn(
                                 "font-medium",
                                 new Date(b.dueDate) < new Date() && bal > 0 ? "text-red-600 font-bold" : "text-slate-600"
                               )}>
                                 {formatDate(b.dueDate)}
                               </span>
                             ) : <span className="text-slate-400">—</span>}
                          </td>
                          <td className="p-4 font-bold text-slate-900">{formatCurrency(b.totalAmount)}</td>
                          <td className="p-4 font-semibold text-emerald-600">{formatCurrency(b.paidAmount)}</td>
                          <td className="p-4 font-bold">
                             <span className={bal > 0 ? "text-amber-600" : "text-emerald-600"}>
                               {formatCurrency(bal)}
                             </span>
                          </td>
                          <td className="p-4 font-medium text-slate-600">
                             {b.project?.name ? (
                                <span className="truncate max-w-[150px] inline-block" title={b.project.name}>{b.project.name}</span>
                             ) : (
                                <span className="text-slate-400 italic">General</span>
                             )}
                          </td>
                          <td className="p-4"><StatusBadge status={b.status} /></td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                             <Button 
                               size="sm" 
                               className="h-8 rounded-lg gap-1.5 bg-white text-slate-700 hover:bg-slate-50 hover:text-brand-700 font-semibold shadow-sm border border-slate-200"
                               onClick={() => setPaymentBill(b)}
                             >
                               <Banknote className="h-3.5 w-3.5" />
                               Pay
                             </Button>
                          </td>
                        </tr>
                        
                        {isExpanded && (
                          <tr className="bg-slate-50/80 border-t-0">
                            <td colSpan={11} className="p-0">
                               <div className="px-6 py-5 ml-12 border-l-2 border-slate-200 animate-in slide-in-from-top-2 duration-200">
                                 <div className="flex items-center gap-2 mb-3">
                                   <ReceiptText className="h-4 w-4 text-slate-400" />
                                   <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                     Payment History Overview
                                   </h5>
                                 </div>
                                 
                                 {b.payments?.length > 0 ? (
                                   <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm max-w-3xl">
                                     <table className="w-full text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200/60">
                                          <tr className="text-left">
                                            <th className="px-4 py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-500">Date Logged</th>
                                            <th className="px-4 py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-500">Amount Paid</th>
                                            <th className="px-4 py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-500">Method</th>
                                            <th className="px-4 py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-500">Reference Info</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {b.payments.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50">
                                              <td className="px-4 py-3 font-medium text-slate-600">{formatDate(p.paidDate)}</td>
                                              <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                                              <td className="px-4 py-3">
                                                 <span className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5 text-xs font-semibold text-slate-600">
                                                   {p.paymentMode?.replace(/_/g, ' ')}
                                                 </span>
                                              </td>
                                              <td className="px-4 py-3 text-slate-500 font-medium italic">{p.referenceNo ?? '—'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                   </div>
                                 ) : (
                                   <div className="py-6 px-4 bg-white rounded-xl border border-slate-200/60 flex flex-col items-center justify-center max-w-3xl shadow-sm text-center">
                                      <p className="text-sm font-medium text-slate-500">No payment transactions recorded for this bill.</p>
                                   </div>
                                 )}
                               </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-slate-100">
               {bills.map((b) => {
                 const isExpanded = expandedId === b.id;
                 const bal = balance(b);
                 return (
                   <div key={b.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start" onClick={() => setExpandedId(isExpanded ? null : b.id)}>
                         <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center border border-violet-100 shrink-0">
                               <ReceiptText className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                               <p className="font-bold text-slate-900 text-sm">{b.partyName}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-black uppercase text-slate-400">#{b.billNumber || 'NO-REF'}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">{b.type?.replace(/_/g, ' ')}</span>
                               </div>
                            </div>
                         </div>
                         <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : b.id); }}>
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                         </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Bill</span>
                            <span className="font-bold text-slate-900 text-sm">{formatCurrency(b.totalAmount)}</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Balance</span>
                            <span className={cn("font-black text-sm", bal > 0 ? "text-amber-600" : "text-emerald-600")}>
                               {formatCurrency(bal)}
                            </span>
                         </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                         <StatusBadge status={b.status} />
                         <Button 
                           size="sm" 
                           className="h-8 rounded-lg gap-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/50 shadow-none font-bold"
                           onClick={(e) => { e.stopPropagation(); setPaymentBill(b); }}
                         >
                           <Banknote className="h-3.5 w-3.5" />
                           Pay
                         </Button>
                      </div>

                      {isExpanded && (
                         <div className="mt-4 pt-4 border-l-4 border-slate-100 pl-3 space-y-3 animate-in fade-in slide-in-from-left-2">
                            <h6 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Logs</h6>
                            {b.payments?.length > 0 ? (
                               b.payments.map((p) => (
                                 <div key={p.id} className="flex justify-between items-center text-xs bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                                    <div className="flex flex-col">
                                       <span className="font-bold text-slate-700">{formatCurrency(p.amount)}</span>
                                       <span className="text-[9px] text-slate-400 font-medium">{formatDate(p.paidDate)}</span>
                                    </div>
                                    <span className="bg-white px-1.5 py-0.5 rounded font-bold text-slate-500 uppercase text-[9px] border border-slate-200">
                                       {p.paymentMode?.split('_')[0]}
                                    </span>
                                 </div>
                               ))
                            ) : (
                               <p className="text-[10px] font-medium text-slate-400 italic">No payments yet</p>
                            )}
                         </div>
                      )}
                   </div>
                 );
               })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button for Mobile */}
      <Button
        onClick={() => { setEditingBill(null); setShowForm(true); }}
        className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-slate-900 border border-slate-700/50 text-white shadow-2xl transition-all hover:scale-110 active:scale-95 sm:hidden flex items-center justify-center p-0"
        aria-label="Record bill"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => { setShowForm(false); setEditingBill(null); }} />
           <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-lg">
             <BillForm 
               bill={editingBill} 
               onSave={handleSaveBill} 
               onClose={() => { setShowForm(false); setEditingBill(null); }} 
             />
           </div>
        </div>
      )}

      {paymentBill && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setPaymentBill(null)} />
           <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-md">
             <BillPaymentForm 
               bill={paymentBill} 
               onSave={(payload) => handleRecordPayment(paymentBill.id, payload)} 
               onClose={() => setPaymentBill(null)} 
             />
           </div>
        </div>
      )}
    </PageWrapper>
  );
}
