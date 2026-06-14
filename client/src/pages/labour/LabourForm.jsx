import { useState } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { X, User, Pickaxe, CalendarRange, Coins, WalletCards, Calendar, CreditCard, FileText, ShieldAlert } from 'lucide-react';

const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'UPI', label: 'UPI' },
];

export function LabourForm({ entry, onSave, onClose }) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    workerName: entry?.workerName ?? '',
    workType: entry?.workType ?? '',
    days: entry?.days != null ? String(entry.days) : '',
    ratePerDay: entry?.ratePerDay != null ? String(entry.ratePerDay) : '',
    totalAmount: entry?.totalAmount != null ? String(entry.totalAmount) : '',
    paidAmount: entry?.paidAmount != null ? String(entry.paidAmount) : '0',
    paymentDate: entry?.paymentDate ? entry.paymentDate.slice(0, 10) : '',
    paymentMode: entry?.paymentMode ?? 'CASH',
    notes: entry?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const total = form.totalAmount ? Number(form.totalAmount) : 0;
    const paid = form.paidAmount ? Number(form.paidAmount) : 0;
    if (!form.workerName.trim()) {
      setError('Worker name is required');
      return;
    }
    if (Number.isNaN(total) || total < 0) {
      setError('Valid total amount is required');
      return;
    }
    if (Number.isNaN(paid) || paid < 0) {
      setError('Paid amount must be non-negative');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        workerName: form.workerName.trim(),
        workType: form.workType.trim() || null,
        days: form.days ? Number(form.days) : null,
        ratePerDay: form.ratePerDay ? Number(form.ratePerDay) : null,
        totalAmount: total,
        paidAmount: paid,
        paymentDate: form.paymentDate || null,
        paymentMode: form.paymentMode,
        notes: form.notes.trim() || null,
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
          {isEdit ? 'Edit Labour Entry' : 'Create Labour Entry'}
        </h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-2">
               <User className="h-3.5 w-3.5" /> Identity & Task
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 relative col-span-1">
                <label className="text-sm font-bold text-slate-700">Worker Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={form.workerName} 
                    onChange={(e) => setForm((f) => ({ ...f, workerName: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-medium transition-all"
                    placeholder="e.g. Ram Kumar"
                    required 
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2 relative col-span-1">
                <label className="text-sm font-bold text-slate-700">Work Type</label>
                <div className="relative">
                  <Pickaxe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={form.workType} 
                    onChange={(e) => setForm((f) => ({ ...f, workType: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-medium transition-all"
                    placeholder="e.g. Mason, Helper..." 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-2">
               <CalendarRange className="h-3.5 w-3.5" /> Duration & Compensation
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Days Worked</label>
                <div className="relative">
                  <CalendarRange className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={form.days} 
                    onChange={(e) => setForm((f) => ({ ...f, days: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-medium transition-all"
                    placeholder="0.0" 
                  />
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Rate per Day (₹)</label>
                <div className="relative">
                  <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={form.ratePerDay} 
                    onChange={(e) => setForm((f) => ({ ...f, ratePerDay: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-medium transition-all"
                    placeholder="0.00" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Total Amount (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <WalletCards className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={form.totalAmount} 
                    onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-brand-50/50 border-brand-200/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-bold text-brand-900 transition-all"
                    placeholder="0.00" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Amount Paid (₹)</label>
                <div className="relative">
                  <WalletCards className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={form.paidAmount} 
                    onChange={(e) => setForm((f) => ({ ...f, paidAmount: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-emerald-50/50 border-emerald-200/50 focus:bg-white focus:ring-4 focus:emerald-500/10 font-bold text-emerald-900 transition-all"
                    placeholder="0.00" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-2">
               <CreditCard className="h-3.5 w-3.5" /> Payment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 relative col-span-1">
                <label className="text-sm font-bold text-slate-700">Payment Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                  <Input 
                    type="date" 
                    value={form.paymentDate} 
                    onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-medium transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2 relative col-span-1">
                <label className="text-sm font-bold text-slate-700">Payment Mode</label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select 
                    className="w-full h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-[14px] font-semibold text-slate-700 shadow-sm transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 cursor-pointer" 
                    value={form.paymentMode} 
                    onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}
                  >
                    {PAYMENT_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700">Additional Notes</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <textarea 
                  className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-10 py-2.5 text-[14px] font-medium transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 resize-y" 
                  value={form.notes} 
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} 
                  rows={2} 
                  placeholder="Any specific comments..."
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
              className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all font-bold hover:shadow-xl hover:-translate-y-0.5"
              disabled={saving}
            >
              {saving ? 'Processing…' : isEdit ? 'Save Changes' : 'Create Entry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
