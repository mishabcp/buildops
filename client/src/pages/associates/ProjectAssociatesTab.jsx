import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { Input } from '../../components/ui/input.jsx';
import {
  getAssociates,
  createAssociate,
  getProjectAssociates,
  assignAssociateToProject,
  recordAssociatePayment,
} from '../../api/associates.api.js';
import { AssociateForm } from './AssociateForm.jsx';
import { AssociatePaymentForm } from './AssociatePaymentForm.jsx';
import { Plus, ChevronDown, ChevronRight, Receipt, BriefcaseBusiness, Users, User, ShieldAlert, FileText, IndianRupee, Banknote, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function ProjectAssociatesTab({ projectId, onDataChange }) {
  const [payments, setPayments] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showNewAssociateForm, setShowNewAssociateForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadPayments();
      loadAssociates();
    }
  }, [projectId]);

  async function loadPayments() {
    setLoading(true);
    setError('');
    try {
      const res = await getProjectAssociates(projectId);
      if (res?.success && res?.data) setPayments(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function loadAssociates() {
    try {
      const res = await getAssociates();
      if (res?.success && res?.data) setAssociates(res.data);
    } catch (_) {}
  }

  async function handleAssign(payload) {
    const res = await assignAssociateToProject(projectId, payload);
    if (res?.success && res?.data) {
      setPayments((prev) => [...prev, res.data]);
      setShowAssignForm(false);
      onDataChange?.();
    } else throw new Error(res?.error);
  }

  async function handleCreateAssociate(payload) {
    const res = await createAssociate(payload);
    if (res?.success && res?.data) {
      setAssociates((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setShowNewAssociateForm(false);
    } else throw new Error(res?.error);
  }

  async function handleRecordPayment(paymentId, payload) {
    const res = await recordAssociatePayment(paymentId, payload);
    if (res?.success && res?.data) {
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? res.data : p)));
      setPaymentForm(null);
      onDataChange?.();
    } else throw new Error(res?.error);
  }

  const balance = (p) => (Number(p.agreedAmount) || 0) - (Number(p.paidAmount) || 0);

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
            <h3 className="text-lg font-bold text-slate-900">Project Associates</h3>
            <p className="text-sm font-medium text-slate-500">Manage subcontractors, consultants, and independent agencies</p>
         </div>

         <div className="flex items-center gap-4 sm:ml-auto">
             <Button 
               onClick={() => setShowAssignForm(true)} 
               className="hidden sm:flex h-10 px-5 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 font-bold transition-all hover:-translate-y-0.5"
             >
               <Plus className="h-4 w-4" />
               Assign Associate
             </Button>
         </div>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-slate-100">
             <BriefcaseBusiness className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Associates Assigned</h3>
          <p className="text-slate-500 font-medium max-w-sm mb-6">Assign subcontractors or agencies and track their contractual milestones.</p>
          <Button 
            className="h-11 px-6 rounded-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm"
            onClick={() => setShowAssignForm(true)} 
          >
             <Plus className="h-4 w-4 mr-2" />
             Assign First Associate
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const isExpanded = expandedId === p.id;
            const bal = balance(p);

            return (
              <div 
                key={p.id} 
                className={cn(
                  "rounded-2xl border transition-all duration-200 bg-white overflow-hidden shadow-sm hover:shadow-md",
                  isExpanded ? "border-brand-200/60 ring-4 ring-brand-500/5 shadow-md" : "border-slate-200/60"
                )}
              >
                <div className="p-4 sm:p-5 flex flex-col gap-4">
                  {/* Card Header */}
                  <div 
                    className="flex items-start justify-between cursor-pointer select-none"
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold shrink-0 shadow-sm">
                        {p.associate?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight truncate">{p.associate?.name}</h4>
                          {p.associate?.workType && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold uppercase tracking-widest text-slate-500 border border-slate-200/50">
                              {p.associate.workType}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-500 line-clamp-1 mt-0.5">{p.scopeOfWork ?? 'No scope defined'}</p>
                      </div>
                    </div>
                    <button type="button" className="text-slate-300 hover:text-brand-600 transition-colors shrink-0 bg-slate-50 border border-slate-100 p-1.5 rounded-lg ml-2">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 border-y border-slate-50 py-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Contract</span>
                      <span className="text-[13px] sm:text-[15px] font-bold text-slate-700 truncate">{formatCurrency(p.agreedAmount)}</span>
                    </div>
                    <div className="flex flex-col border-x border-slate-50 px-2 sm:px-4">
                      <span className="text-[9px] sm:text-[10px] text-emerald-600/70 font-black uppercase tracking-widest mb-1">Paid Out</span>
                      <span className="text-[13px] sm:text-[15px] font-bold text-emerald-600 truncate">{formatCurrency(p.paidAmount)}</span>
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
                    <StatusBadge status={p.status} />
                    <Button 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); setPaymentForm(p); }}
                      className="h-9 rounded-xl gap-2 bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white font-bold shadow-none border border-brand-100 px-4 transition-all" 
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      Make Payment
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                     {p.transactions?.length > 0 ? (
                       <div className="p-5 pl-14 sm:pl-[5.5rem] overflow-x-auto">
                         <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                           <Banknote className="h-4 w-4 opacity-50" />
                           Transaction History
                         </h5>
                         
                         <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                              <table className="w-full text-sm">
                                 <thead>
                                   <tr className="text-left text-slate-500 border-b border-slate-200/60 font-semibold">
                                     <th className="pb-2 pr-4 pl-4 pt-2 font-semibold text-[12px] uppercase tracking-wider">Date Logged</th>
                                     <th className="pb-2 pr-4 pt-2 font-semibold text-[12px] uppercase tracking-wider">Amount</th>
                                     <th className="pb-2 pr-4 pt-2 font-semibold text-[12px] uppercase tracking-wider">Mode</th>
                                     <th className="pb-2 pr-4 pt-2 font-semibold text-[12px] uppercase tracking-wider">Reference Info</th>
                                   </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100/60">
                                   {p.transactions.map((t) => (
                                     <tr key={t.id} className="hover:bg-slate-100/50 transition-colors group">
                                       <td className="py-2.5 pr-4 pl-4 font-medium text-slate-600">{formatDate(t.paidDate)}</td>
                                       <td className="py-2.5 pr-4 font-bold text-slate-900">{formatCurrency(t.amount)}</td>
                                       <td className="py-2.5 pr-4">
                                          <span className="inline-flex items-center bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
                                            {t.paymentMode?.replace(/_/g, ' ')}
                                          </span>
                                       </td>
                                       <td className="py-2.5 pr-4 text-slate-500 font-medium italic">{t.referenceNo ?? '—'}</td>
                                     </tr>
                                   ))}
                                 </tbody>
                              </table>
                            </div>

                            {/* Mobile View */}
                            <div className="lg:hidden divide-y divide-slate-100">
                               {p.transactions.map((t) => (
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
                          <p className="text-sm font-medium text-slate-500">No payment transactions recorded for this associate yet.</p>
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
        onClick={() => setShowAssignForm(true)}
        className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-slate-900 border border-slate-700/50 text-white shadow-2xl transition-all hover:scale-110 active:scale-95 sm:hidden flex items-center justify-center p-0"
        aria-label="Assign associate"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {showAssignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setShowAssignForm(false)} />
           <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-md">
            <AssignAssociateModal
              associates={associates}
              assignedIds={payments.map((p) => p.associateId)}
              onAssign={handleAssign}
              onClose={() => setShowAssignForm(false)}
              onNewAssociate={() => { setShowNewAssociateForm(true); }}
            />
          </div>
        </div>
      )}

      {showNewAssociateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowNewAssociateForm(false)} />
          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <AssociateForm onSave={handleCreateAssociate} onClose={() => setShowNewAssociateForm(false)} />
          </div>
        </div>
      )}

      {paymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setPaymentForm(null)} />
           <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-md">
            <AssociatePaymentForm
              payment={paymentForm}
              onSave={(payload) => handleRecordPayment(paymentForm.id, payload)}
              onClose={() => setPaymentForm(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AssignAssociateModal({ associates, assignedIds, onAssign, onClose, onNewAssociate }) {
  const [form, setForm] = useState({ associateId: '', scopeOfWork: '', agreedAmount: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const available = associates.filter((a) => !assignedIds.includes(a.id));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.associateId) {
      setError('Select an associate');
      return;
    }
    const agreed = Number(form.agreedAmount);
    if (Number.isNaN(agreed) || agreed < 0) {
      setError('Valid agreed amount is required');
      return;
    }
    setSaving(true);
    try {
      await onAssign({
        associateId: Number(form.associateId),
        scopeOfWork: form.scopeOfWork.trim() || null,
        agreedAmount: agreed,
      });
      // onClose handled by parent
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to assign');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden relative">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900 leading-tight">Assign Associate</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors mt-1 self-start">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                 <label className="text-sm font-bold text-slate-700">Select Associate <span className="text-red-500">*</span></label>
                 <button type="button" onClick={onNewAssociate} className="text-[12px] font-bold text-brand-600 hover:text-brand-800 hover:underline flex items-center gap-1 bg-brand-50 px-2 py-0.5 rounded-md">
                   <Plus className="h-3 w-3" /> New
                 </button>
              </div>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  className="w-full h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-[14px] font-semibold text-slate-700 shadow-sm transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 cursor-pointer"
                  value={form.associateId}
                  onChange={(e) => setForm((f) => ({ ...f, associateId: e.target.value }))}
                  required
                >
                  <option value="">Select from directory...</option>
                  {available.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} {a.workType ? `— ${a.workType}` : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700">Scope of Work</label>
              <div className="relative">
                 <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input
                   placeholder="e.g. Electrical wiring for phase 2"
                   className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-medium transition-all"
                   value={form.scopeOfWork}
                   onChange={(e) => setForm((f) => ({ ...f, scopeOfWork: e.target.value }))}
                 />
              </div>
            </div>
            
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700">Agreed Contract Value (₹) <span className="text-red-500">*</span></label>
              <div className="relative">
                 <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input
                   type="number"
                   step="0.01"
                   min="0"
                   className="pl-10 h-11 rounded-xl bg-emerald-50/50 border-emerald-200/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-bold text-emerald-900 transition-all text-[15px]"
                   placeholder="0.00"
                   value={form.agreedAmount}
                   onChange={(e) => setForm((f) => ({ ...f, agreedAmount: e.target.value }))}
                   required
                 />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex gap-3">
             <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl font-bold hover:bg-slate-50 border-slate-200 text-slate-600"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 h-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 transition-all font-bold hover:shadow-xl hover:-translate-y-0.5" disabled={saving}>
                {saving ? 'Processing…' : 'Finalize Assignment'}
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
