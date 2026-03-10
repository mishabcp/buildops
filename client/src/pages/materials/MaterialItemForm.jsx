import { useState } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { X, PackagePlus, Box, Calendar, IndianRupee, Truck, FileText, WalletCards, Activity, ShieldAlert } from 'lucide-react';

export function MaterialItemForm({ type, materials, onSave, onClose }) {
  const isPurchase = type === 'PURCHASE';
  const [form, setForm] = useState({
    materialId: '',
    quantity: '',
    ratePerUnit: isPurchase ? '' : '',
    totalCost: isPurchase ? '' : '',
    supplierName: isPurchase ? '' : '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalFromRate = () => {
    const q = Number(form.quantity) || 0;
    const r = Number(form.ratePerUnit) || 0;
    return q * r;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const qty = Number(form.quantity);
    if (!form.materialId || Number.isNaN(qty) || qty <= 0) {
      setError('Select material and enter valid quantity');
      return;
    }
    if (isPurchase && Number(form.ratePerUnit) < 0) {
      setError('Valid rate is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        materialId: Number(form.materialId),
        type,
        quantity: qty,
        date: form.date,
        notes: form.notes.trim() || null,
      };
      if (isPurchase) {
        payload.ratePerUnit = form.ratePerUnit ? Number(form.ratePerUnit) : null;
        payload.totalCost = form.totalCost ? Number(form.totalCost) : totalFromRate();
        payload.supplierName = form.supplierName.trim() || null;
      }
      await onSave(payload);
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
          {isPurchase ? 'Record Material Purchase' : 'Log Material Usage'}
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
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700">Select Material <span className="text-red-500">*</span></label>
              <div className="relative">
                <Box className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  className="w-full h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-[14px] font-semibold text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                  value={form.materialId}
                  onChange={(e) => setForm((f) => ({ ...f, materialId: e.target.value }))}
                  required
                >
                  <option value="">Select a material from inventory...</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit}) — Current Stock: {Number(m.currentStock)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Quantity {isPurchase ? 'Bought' : 'Used'} <span className="text-red-500">*</span></label>
                <div className="relative">
                  {isPurchase ? (
                     <PackagePlus className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  ) : (
                     <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  )}
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0.01" 
                    value={form.quantity} 
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-bold text-[15px] transition-all"
                    placeholder="0.0"
                    required 
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
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                    required 
                  />
                </div>
              </div>
            </div>

            {isPurchase && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 mb-2">Cost & Supplier</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-700">Rate per Unit (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        value={form.ratePerUnit} 
                        onChange={(e) => setForm((f) => ({ ...f, ratePerUnit: e.target.value }))} 
                        className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-700">Total Cost (₹)</label>
                    <div className="relative">
                      <WalletCards className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        value={form.totalCost || totalFromRate()} 
                        onChange={(e) => setForm((f) => ({ ...f, totalCost: e.target.value }))} 
                        className="pl-10 h-11 rounded-xl bg-emerald-50/50 border-emerald-200/50 focus:bg-white focus:ring-4 focus:emerald-500/10 font-bold text-emerald-900 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Supplier Name</label>
                  <div className="relative">
                    <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      value={form.supplierName} 
                      onChange={(e) => setForm((f) => ({ ...f, supplierName: e.target.value }))} 
                      className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                      placeholder="Vendor or shop name..."
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <label className="text-sm font-bold text-slate-700 mb-2 block">Additional Notes</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <textarea 
                  className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-10 py-2.5 text-[14px] font-medium transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-y" 
                  value={form.notes} 
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} 
                  rows={2} 
                  placeholder={isPurchase ? "Invoice details, delivery comments..." : "Where exactly was this used?"}
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
              className={`flex-1 h-12 rounded-xl text-white shadow-lg transition-all font-bold hover:shadow-xl hover:-translate-y-0.5 ${
                isPurchase ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
              }`}
              disabled={saving}
            >
              {saving ? 'Processing…' : (isPurchase ? 'Save Purchase' : 'Save Usage')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
