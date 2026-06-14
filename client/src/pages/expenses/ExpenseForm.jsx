import { useState } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { X, ReceiptText, Banknote, Calendar, CreditCard, ShieldAlert } from 'lucide-react';

const PAYMENT_MODES = [
  { value: '', label: '— None —' },
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'UPI', label: 'UPI' },
];

export function ExpenseForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMode: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.description.trim()) {
      setError('Description is required');
      return;
    }
    const amt = Number(form.amount);
    if (!form.amount || Number.isNaN(amt) || amt < 0) {
      setError('Valid amount is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        description: form.description.trim(),
        amount: amt,
        date: form.date,
        paymentMode: form.paymentMode || null,
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
          Log Miscellaneous Expense
        </h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors mt-1 self-start">
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

          <div className="space-y-5">
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700 block">Expense Description <span className="text-red-500">*</span></label>
              <div className="relative">
                <ReceiptText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                <textarea 
                  className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-10 py-2.5 text-[14px] font-medium transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 resize-y" 
                  value={form.description} 
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
                  required 
                  rows={2} 
                  placeholder="What was this expense for?"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Amount (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={form.amount} 
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-orange-50/50 border-orange-200/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 font-bold text-[15px] text-orange-900 transition-all"
                    required 
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                  <Input 
                    type="date" 
                    value={form.date} 
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-medium transition-all"
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700 block">Payment Mode</label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select 
                  className="w-full h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-[14px] font-semibold text-slate-700 shadow-sm transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 cursor-pointer" 
                  value={form.paymentMode} 
                  onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}
                >
                  {PAYMENT_MODES.map((m) => <option key={m.value || 'none'} value={m.value}>{m.label}</option>)}
                </select>
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
              {saving ? 'Processing…' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
