import { useState } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { X, Layers, Hash, Calendar, WalletCards, ShieldAlert } from 'lucide-react';

export function PaymentStageForm({ stage, onSave, onClose }) {
  const isEdit = !!stage;
  const [form, setForm] = useState({
    stageName: stage?.stageName ?? '',
    stageNumber: stage?.stageNumber ?? '',
    expectedAmount: stage?.expectedAmount != null ? String(stage.expectedAmount) : '',
    dueDate: stage?.dueDate ? stage.dueDate.slice(0, 10) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({
        stageName: form.stageName.trim(),
        ...(form.stageNumber !== '' && { stageNumber: Number(form.stageNumber) }),
        expectedAmount: form.expectedAmount ? Number(form.expectedAmount) : 0,
        dueDate: form.dueDate || null,
      });
      // onClose is handled by the parent after save success
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative w-full bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900">
          {isEdit ? 'Edit Payment Stage' : 'Create Payment Stage'}
        </h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2 relative">
            <label className="text-sm font-bold text-slate-700">Stage Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                value={form.stageName} 
                onChange={(e) => setForm((f) => ({ ...f, stageName: e.target.value }))} 
                className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                placeholder="e.g. Milestone 1"
                required 
                autoFocus
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700">Sequence <span className="text-slate-400 font-normal">(Auto)</span></label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="number" 
                  min="1" 
                  value={form.stageNumber} 
                  onChange={(e) => setForm((f) => ({ ...f, stageNumber: e.target.value }))} 
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                  placeholder="Auto" 
                />
              </div>
            </div>
            
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700">Target Date</label>
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

          <div className="space-y-2 relative pt-1">
            <label className="text-sm font-bold text-slate-700">Expected Amount (₹) <span className="text-red-500">*</span></label>
            <div className="relative">
              <WalletCards className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                type="number" 
                step="0.01" 
                min="0" 
                value={form.expectedAmount} 
                onChange={(e) => setForm((f) => ({ ...f, expectedAmount: e.target.value }))} 
                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-mono text-[16px] transition-all"
                placeholder="0.00"
                required 
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
            {saving ? 'Processing…' : isEdit ? 'Save Changes' : 'Create Stage'}
          </Button>
        </div>
      </form>
    </div>
  );
}
