import { useState, useEffect, Fragment } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { getBills, createBill, updateBill, addBillPayment } from '../../api/bills.api.js';
import { BillForm } from './BillForm.jsx';
import { BillPaymentForm } from './BillPaymentForm.jsx';
import { Plus, ChevronDown, ChevronRight, Receipt, FileText, Banknote, MapPin, ReceiptText, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function ProjectBillsTab({ projectId, onDataChange }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [paymentBill, setPaymentBill] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const res = await getBills({ projectId: Number(projectId) });
        if (cancelled) return;
        if (res?.success && res?.data) setBills(res.data);
        else setError(res?.error ?? 'Failed to load');
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  async function handleSaveBill(payload) {
    const withProject = { ...payload, projectId: Number(projectId) };
    if (editingBill) {
      const res = await updateBill(editingBill.id, withProject);
      if (res?.success && res?.data) {
        setBills((prev) => prev.map((b) => (b.id === editingBill.id ? res.data : b)));
        setEditingBill(null);
        setShowForm(false);
        onDataChange?.();
      } else throw new Error(res?.error);
    } else {
      const res = await createBill(withProject);
      if (res?.success && res?.data) {
        setBills((prev) => [res.data, ...prev]);
        setShowForm(false);
        onDataChange?.();
      } else throw new Error(res?.error);
    }
  }

  async function handleRecordPayment(billId, payload) {
    const res = await addBillPayment(billId, payload);
    if (res?.success && res?.data?.bill) {
      setBills((prev) => prev.map((b) => (b.id === billId ? res.data.bill : b)));
      setPaymentBill(null);
      onDataChange?.();
    } else throw new Error(res?.error);
  }

  const balance = (b) => (Number(b.totalAmount) || 0) - (Number(b.paidAmount) || 0);

  if (loading) {
     return (
       <div className="animate-pulse space-y-4 pt-4">
         <div className="h-10 bg-slate-100 rounded-xl w-32 ml-auto" />
         <div className="space-y-3">
           <div className="h-24 bg-slate-100 rounded-2xl w-full" />
           <div className="h-24 bg-slate-100 rounded-2xl w-full" />
         </div>
       </div>
     );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="hidden sm:flex flex-col">
            <h3 className="text-lg font-bold text-slate-900">Project Bills & Invoices</h3>
            <p className="text-sm font-medium text-slate-500">Manage vendor invoices, service bills, and payments</p>
         </div>

         <div className="flex items-center gap-4 sm:ml-auto">
             <Button 
               onClick={() => { setEditingBill(null); setShowForm(true); }}
               className="hidden sm:flex h-10 px-5 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 font-bold transition-all hover:-translate-y-0.5"
             >
               <Plus className="h-4 w-4" />
               Add New Bill
             </Button>
         </div>
      </div>

      {bills.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-slate-100">
             <ReceiptText className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Bills Recorded</h3>
          <p className="text-slate-500 font-medium max-w-sm mb-6">Create your first bill to start tracking vendor expenses and pending payments.</p>
          <Button 
            className="h-11 px-6 rounded-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm"
            onClick={() => { setEditingBill(null); setShowForm(true); }}
          >
             <Plus className="h-4 w-4 mr-2" />
             Create First Bill
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((b) => {
            const isExpanded = expandedId === b.id;
            const bal = balance(b);

            return (
              <div 
                key={b.id} 
                className={cn(
                  "rounded-2xl border transition-all duration-200 bg-white overflow-hidden shadow-sm hover:shadow-md",
                  isExpanded ? "border-brand-200/60 ring-4 ring-brand-500/5 shadow-md" : "border-slate-200/60"
                )}
              >
                <div className="p-4 sm:p-5 flex flex-col gap-4">
                  {/* Card Header */}
                  <div 
                    className="flex items-start justify-between cursor-pointer select-none"
                    onClick={() => setExpandedId(isExpanded ? null : b.id)}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-700 font-bold shrink-0 shadow-sm">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight truncate">{b.partyName}</h4>
                          {b.billNumber && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold uppercase tracking-widest text-slate-500 border border-slate-200/50">
                              #{b.billNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-sm font-medium text-slate-500">
                          <span>{formatDate(b.billDate)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="truncate">{b.type?.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <button type="button" className="text-slate-300 hover:text-brand-600 transition-colors shrink-0 bg-slate-50 border border-slate-100 p-1.5 rounded-lg ml-2">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 border-y border-slate-50 py-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Bill</span>
                      <span className="text-[13px] sm:text-[15px] font-bold text-slate-700 truncate">{formatCurrency(b.totalAmount)}</span>
                    </div>
                    <div className="flex flex-col border-x border-slate-50 px-2 sm:px-4">
                      <span className="text-[9px] sm:text-[10px] text-emerald-600/70 font-black uppercase tracking-widest mb-1">Paid</span>
                      <span className="text-[13px] sm:text-[15px] font-bold text-emerald-600 truncate">{formatCurrency(b.paidAmount)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Balance</span>
                      <span className={cn(
                        "text-[13px] sm:text-[15px] font-black truncate",
                        bal > 0 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {formatCurrency(bal)}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <StatusBadge status={b.status} />
                    <Button 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); setPaymentBill(b); }}
                      className="h-9 rounded-xl gap-2 bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white font-bold shadow-none border border-brand-100 px-4 transition-all" 
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      Clear Dues
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                     {b.payments?.length > 0 ? (
                       <div className="p-5 pl-14 sm:pl-[5.5rem] overflow-x-auto">
                         <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                           <Banknote className="h-4 w-4 opacity-50" />
                           Payment History
                         </h5>
                         <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                           {/* Desktop Table View */}
                           <div className="hidden lg:block overflow-x-auto">
                             <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-left text-slate-500 border-b border-slate-200/60 font-semibold">
                                    <th className="pb-2 pr-4 font-semibold text-[12px] uppercase tracking-wider">Date Logged</th>
                                    <th className="pb-2 pr-4 font-semibold text-[12px] uppercase tracking-wider">Amount</th>
                                    <th className="pb-2 pr-4 font-semibold text-[12px] uppercase tracking-wider">Mode</th>
                                    <th className="pb-2 font-semibold text-[12px] uppercase tracking-wider">Reference Info</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/60">
                                  {b.payments.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-100/50 transition-colors group">
                                      <td className="py-2.5 pr-4 font-medium text-slate-600">{formatDate(t.paidDate)}</td>
                                      <td className="py-2.5 pr-4 font-bold text-slate-900">{formatCurrency(t.amount)}</td>
                                      <td className="py-2.5 pr-4">
                                         <span className="inline-flex items-center bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
                                           {t.paymentMode?.replace(/_/g, ' ')}
                                         </span>
                                      </td>
                                      <td className="py-2.5 text-slate-500 font-medium italic">{t.referenceNo ?? '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                             </table>
                           </div>

                           {/* Mobile View */}
                           <div className="lg:hidden divide-y divide-slate-100">
                              {b.payments.map((t) => (
                                <div key={t.id} className="p-3 flex justify-between items-center text-xs">
                                   <div className="flex flex-col text-left">
                                      <span className="font-bold text-slate-900">{formatCurrency(t.amount)}</span>
                                      <span className="text-slate-400 font-medium tracking-tight uppercase text-[9px]">{formatDate(t.paidDate)}</span>
                                   </div>
                                   <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-500 uppercase tracking-tighter text-[10px]">
                                      {t.paymentMode?.split('_')[0]}
                                   </span>
                                </div>
                              ))}
                           </div>
                         </div>
                       </div>
                     ) : (
                       <div className="p-8 text-center bg-transparent">
                          <p className="text-sm font-medium text-slate-500">No payment transactions recorded for this bill yet.</p>
                       </div>
                     )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Add Button for Mobile */}
      <Button
        onClick={() => { setEditingBill(null); setShowForm(true); }}
        className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-slate-900 border border-slate-700/50 text-white shadow-2xl transition-all hover:scale-110 active:scale-95 sm:hidden flex items-center justify-center p-0"
        aria-label="Add bill"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => { setShowForm(false); setEditingBill(null); }} />
           <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-md">
             <BillForm 
               bill={editingBill} 
               projectId={projectId} 
               onSave={handleSaveBill} 
               onClose={() => { setShowForm(false); setEditingBill(null); }} 
             />
           </div>
        </div>
      )}
      
      {paymentBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
    </div>
  );
}
