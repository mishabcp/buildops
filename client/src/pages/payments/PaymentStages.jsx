import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
import { PaymentBar } from '../../components/shared/PaymentBar.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import {
  getStages,
  createStage,
  updateStage,
  deleteStage,
  createReceipt,
} from '../../api/payments.api.js';
import { PaymentStageForm } from './PaymentStageForm.jsx';
import { ReceiptForm } from './ReceiptForm.jsx';
import { Plus, ChevronDown, ChevronRight, Receipt, Pencil, Trash2, Wallet, Calendar, FileText, IndianRupee } from 'lucide-react';
import { authStore } from '../../store/authStore.js';
import { cn } from '../../lib/utils.js';

export function PaymentStages({ projectId, onDataChange }) {
  const user = authStore((s) => s.user);
  const isStaff = user?.role === 'STAFF';

  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showStageForm, setShowStageForm] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [receiptStage, setReceiptStage] = useState(null);

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await getStages(projectId);
      if (res?.success && res?.data) setStages(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveStage(payload) {
    if (editingStage) {
      const res = await updateStage(editingStage.id, payload);
      if (res?.success && res?.data) {
        setStages((prev) => prev.map((s) => (s.id === editingStage.id ? res.data : s)));
        setEditingStage(null);
        setShowStageForm(false);
        onDataChange?.();
      } else throw new Error(res?.error);
    } else {
      const res = await createStage(projectId, payload);
      if (res?.success && res?.data) {
        setStages((prev) => [...prev, res.data].sort((a, b) => a.stageNumber - b.stageNumber));
        setShowStageForm(false);
        onDataChange?.();
      } else throw new Error(res?.error);
    }
  }

  async function handleDeleteStage(stage) {
    if (!window.confirm(`Are you sure you want to delete stage "${stage.stageName}"? This action cannot be undone.`)) return;
    try {
      const res = await deleteStage(stage.id);
      if (res?.success) {
        setStages((prev) => prev.filter((s) => s.id !== stage.id));
        setExpandedId(null);
        onDataChange?.();
      } else setError(res?.error ?? 'Failed to delete');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to delete');
    }
  }

  async function handleSaveReceipt(stageId, payload) {
    const res = await createReceipt(stageId, payload);
    if (res?.success && res?.data?.stage) {
      setStages((prev) => prev.map((s) => (s.id === stageId ? res.data.stage : s)));
      setReceiptStage(null);
      onDataChange?.();
    } else throw new Error(res?.error ?? 'Failed to record');
  }

  if (loading) {
     return (
       <div className="animate-pulse space-y-4 pt-4">
         <div className="h-20 bg-slate-100 rounded-2xl w-full" />
         <div className="h-20 bg-slate-100 rounded-2xl w-full" />
       </div>
     );
  }
  if (error) return <p className="text-red-600 font-medium py-4">{error}</p>;

  const paidAmount = (stage) => stage.paidAmount ?? stage.receipts?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;
  const expectedAmount = (stage) => Number(stage.expectedAmount) ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center sm:hidden">
         <h3 className="text-lg font-bold text-slate-900">Payment Schedule</h3>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => { setEditingStage(null); setShowStageForm(true); }} 
          className="h-10 px-5 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 font-semibold transition-all hover:-translate-y-0.5" 
          disabled={isStaff}
        >
          <Plus className="h-4 w-4" />
          Add Payment Stage
        </Button>
      </div>

      {stages.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-slate-100">
             <Wallet className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Payment Stages</h3>
          <p className="text-slate-500 font-medium max-w-sm mb-6">Create your first payment stage to start tracking expected and received project funds.</p>
          <Button 
            className="h-11 px-6 rounded-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm"
            onClick={() => setShowStageForm(true)} 
            disabled={isStaff}
          >
             <Plus className="h-4 w-4 mr-2" />
             Create Stage
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map((stage) => {
            const paid = paidAmount(stage);
            const expected = expectedAmount(stage);
            const isExpanded = expandedId === stage.id;
            return (
              <div 
                key={stage.id} 
                className={cn(
                  "rounded-2xl border transition-all duration-200 overflow-hidden group",
                  isExpanded ? "border-blue-200/60 bg-white shadow-lg shadow-blue-900/5" : "border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-md"
                )}
              >
                <div
                  className={cn(
                    "flex flex-col lg:flex-row lg:items-center gap-4 p-5 cursor-pointer select-none transition-colors",
                    isExpanded ? "bg-slate-50/50" : "hover:bg-slate-50/50"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : stage.id)}
                >
                  <div className="flex items-center gap-3">
                     <button 
                       type="button" 
                       className={cn(
                         "flex items-center justify-center h-8 w-8 rounded-lg transition-colors border",
                         isExpanded ? "bg-white border-slate-200 text-slate-700 shadow-sm" : "bg-transparent border-transparent text-slate-400 group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm"
                       )}
                     >
                       <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-90")} />
                     </button>
                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold tracking-tight border border-blue-100/50 shrink-0">
                        S{stage.stageNumber}
                     </div>
                     <div className="min-w-0 mr-4">
                       <h4 className="font-bold text-slate-900 text-[15px] truncate">{stage.stageName}</h4>
                       <div className="flex items-center gap-1.5 mt-0.5 text-[13px] font-medium text-slate-500">
                         <Calendar className="h-3.5 w-3.5" />
                         {formatDate(stage.dueDate)}
                       </div>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-wrap lg:grid lg:grid-cols-4 items-center gap-4 lg:gap-8 ml-11 lg:ml-0">
                     <div className="flex flex-col gap-1 w-full lg:col-span-1">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Target</span>
                        <span className="font-bold text-slate-900 text-[15px]">{formatCurrency(expected)}</span>
                     </div>
                     <div className="flex flex-col gap-1 w-full lg:col-span-1">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Received</span>
                        <span className={cn("font-bold text-[15px]", paid > 0 ? "text-emerald-600" : "text-slate-900")}>{formatCurrency(paid)}</span>
                     </div>
                     <div className="flex flex-col justify-center w-full lg:col-span-2 space-y-2">
                        <div className="flex justify-between items-center w-full max-w-[200px] lg:max-w-none">
                           <StatusBadge status={stage.status} />
                           <span className="text-xs font-bold text-slate-400">
                             {expected > 0 ? Math.round((paid / expected) * 100) : 0}%
                           </span>
                        </div>
                        <div className="w-full max-w-[200px] lg:max-w-none">
                          <PaymentBar paid={paid} total={expected} />
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 ml-11 lg:ml-auto w-full lg:w-auto justify-start border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0 mt-3 lg:mt-0" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      size="sm" 
                      onClick={() => setReceiptStage(stage)} 
                      className="h-9 rounded-lg gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/50 font-semibold px-3"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      Record
                    </Button>
                    {!isStaff && (
                      <div className="flex gap-1 ml-auto lg:ml-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => { setEditingStage(stage); setShowStageForm(true); }}
                          className="h-9 w-9 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteStage(stage)} 
                          className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Receipts Section */}
                <div 
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-slate-100 bg-slate-50/50 p-5 pl-[4.5rem]">
                      <div className="flex items-center gap-2 mb-4">
                         <FileText className="h-4 w-4 text-slate-400" />
                         <h5 className="text-[12px] font-bold uppercase tracking-widest text-slate-500">Transaction History</h5>
                      </div>
                      
                      {stage.receipts?.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-sm whitespace-nowrap">
                            <thead>
                              <tr className="border-b border-slate-100 text-left bg-slate-50/80">
                                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Amount</th>
                                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Method</th>
                                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Reference / Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {stage.receipts.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3 px-4 font-medium text-slate-600">
                                    {formatDate(r.receivedDate)}
                                  </td>
                                  <td className="py-3 px-4">
                                     <span className="inline-flex items-center font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                       {formatCurrency(r.amount)}
                                     </span>
                                  </td>
                                  <td className="py-3 px-4">
                                     <span className="text-[12px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                        {r.paymentMode?.replace(/_/g, ' ')}
                                     </span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-500">
                                    <div className="truncate max-w-[200px]">
                                      {r.referenceNo ? <span className="font-mono text-xs">{r.referenceNo}</span> : <span className="italic opacity-50">No ref</span>}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                         <div className="text-sm font-medium text-slate-400 italic bg-white/50 border border-slate-200/60 rounded-xl p-4 text-center">
                           No payments recorded for this stage yet.
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showStageForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => { setShowStageForm(false); setEditingStage(null); }} />
           <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-md">
              <PaymentStageForm
                stage={editingStage}
                onSave={handleSaveStage}
                onClose={() => { setShowStageForm(false); setEditingStage(null); }}
              />
           </div>
        </div>
      )}

      {receiptStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setReceiptStage(null)} />
           <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-md">
              <ReceiptForm
                stage={receiptStage}
                onSave={(payload) => handleSaveReceipt(receiptStage.id, payload)}
                onClose={() => setReceiptStage(null)}
              />
           </div>
        </div>
      )}
    </div>
  );
}
