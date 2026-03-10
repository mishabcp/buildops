import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { X, Building2, AlignLeft, Hash, Calendar, Banknote, ShieldAlert, Type, FolderOpen } from 'lucide-react';
import { getProjects } from '../../api/projects.api.js';

export function BillForm({ bill, projectId: initialProjectId, onSave, onClose }) {
  const isEdit = !!bill;
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    projectId: bill?.projectId ?? initialProjectId ?? '',
    type: bill?.type ?? 'PAYABLE',
    partyName: bill?.partyName ?? '',
    billNumber: bill?.billNumber ?? '',
    billDate: bill?.billDate ? bill.billDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    dueDate: bill?.dueDate ? bill.dueDate.slice(0, 10) : '',
    totalAmount: bill?.totalAmount != null ? String(bill.totalAmount) : '',
    description: bill?.description ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProjects().then((res) => {
      if (res?.success && res?.data) setProjects(res.data);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.partyName.trim()) {
      setError('Party name is required');
      return;
    }
    const total = Number(form.totalAmount);
    if (Number.isNaN(total) || total < 0) {
      setError('Valid total amount is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        projectId: form.projectId === '' ? null : Number(form.projectId),
        type: form.type,
        partyName: form.partyName.trim(),
        billNumber: form.billNumber.trim() || null,
        billDate: form.billDate,
        dueDate: form.dueDate || null,
        totalAmount: total,
        description: form.description.trim() || null,
      });
      // onClose handled by parent
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative w-full bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900 leading-tight">
          {isEdit ? 'Update Bill Details' : 'Record New Bill'}
        </h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors mt-1 self-start">
          <X className="h-5 w-5" />
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
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Bill Type <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                     <select 
                       className="w-full h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-[14px] font-semibold text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer" 
                       value={form.type} 
                       onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                     >
                        <option value="PAYABLE">Accounts Payable (We owe)</option>
                        <option value="RECEIVABLE">Accounts Receivable (They owe)</option>
                     </select>
                  </div>
               </div>

               <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Link to Project</label>
                  <div className="relative">
                     <FolderOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                     <select 
                       className="w-full h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-[14px] font-semibold text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer" 
                       value={form.projectId} 
                       onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                     >
                        <option value="">— Unassigned General Bill —</option>
                        {projects.map((p) => (
                           <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                     </select>
                  </div>
               </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700">Party / Vendor Name <span className="text-red-500">*</span></label>
              <div className="relative">
                 <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input 
                   value={form.partyName} 
                   onChange={(e) => setForm((f) => ({ ...f, partyName: e.target.value }))} 
                   className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-bold text-[15px] transition-all"
                   placeholder="e.g. ABC Suppliers Ltd."
                   required 
                   autoFocus
                 />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Bill / Invoice No.</label>
                <div className="relative">
                   <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <Input 
                     value={form.billNumber} 
                     onChange={(e) => setForm((f) => ({ ...f, billNumber: e.target.value }))} 
                     className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                     placeholder="INV-2024-001"
                   />
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Total Amount (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                   <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <Input 
                     type="number" 
                     step="0.01" 
                     min="0" 
                     value={form.totalAmount} 
                     onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))} 
                     className="pl-10 h-11 rounded-xl bg-emerald-50/50 border-emerald-200/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 font-bold text-[15px] text-emerald-900 transition-all"
                     placeholder="0.00"
                     required 
                   />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Bill Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                     <Input 
                        type="date" 
                        value={form.billDate} 
                        onChange={(e) => setForm((f) => ({ ...f, billDate: e.target.value }))} 
                        className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                        required 
                     />
                  </div>
               </div>

               <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Due Date</label>
                  <div className="relative">
                     <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                     <Input 
                        type="date" 
                        value={form.dueDate} 
                        onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} 
                        className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                     />
                  </div>
               </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700 block">Description / Notes</label>
              <div className="relative">
                 <AlignLeft className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                 <textarea 
                   className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-10 py-2.5 text-[14px] font-medium transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-y" 
                   value={form.description} 
                   onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
                   rows={2} 
                   placeholder="Describe what this bill is for..."
                 />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-3">
             <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl font-bold hover:bg-slate-50 border-slate-200 text-slate-600"
                disabled={saving}
             >
                Cancel
             </Button>
             <Button 
                type="submit" 
                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all font-bold hover:shadow-xl hover:-translate-y-0.5"
                disabled={saving}
             >
                {saving ? 'Processing…' : isEdit ? 'Update Details' : 'Save Bill Info'}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
