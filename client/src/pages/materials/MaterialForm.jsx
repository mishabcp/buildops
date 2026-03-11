import { useState } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { X, PackageOpen, Scale, Hash, ShieldAlert, BarChart } from 'lucide-react';

export function MaterialForm({ material, onSave, onClose }) {
  const isEdit = !!material;
  const [form, setForm] = useState({
    name: material?.name ?? '',
    unit: material?.unit ?? '',
    currentStock: material?.currentStock != null ? String(material.currentStock) : '0',
    minThreshold: material?.minThreshold != null ? String(material.minThreshold) : '0',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const stock = Number(form.currentStock);
    const threshold = Number(form.minThreshold);
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.unit.trim()) {
      setError('Unit is required');
      return;
    }
    if (Number.isNaN(stock) || stock < 0 || Number.isNaN(threshold) || threshold < 0) {
      setError('Valid stock and threshold are required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        unit: form.unit.trim(),
        currentStock: stock,
        minThreshold: threshold,
      });
      // onClose handled by parent on success
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative w-full bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden mt-8 md:mt-0 max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-white border border-slate-200 shadow-sm rounded-xl flex items-center justify-center text-blue-600">
             <PackageOpen className="h-5 w-5" />
           </div>
           <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {isEdit ? 'Edit Material Config' : 'New Material Config'}
              </h2>
              <p className="text-[12px] font-semibold text-slate-500 mt-0.5">Master directory item</p>
           </div>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors self-start mt-1">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <form id="material-form" onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700">Material Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <PackageOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-900 transition-all disabled:opacity-60"
                  placeholder="e.g. Portland Cement, River Sand..."
                  required 
                  disabled={isEdit}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700">Unit of Measurement <span className="text-red-500">*</span></label>
              <div className="relative">
                <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  value={form.unit} 
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} 
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                  placeholder="e.g. bags, kg, MT, nos" 
                  required 
                />
              </div>
            </div>

            {!isEdit ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Initial Stock</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={form.currentStock} 
                      onChange={(e) => setForm((f) => ({ ...f, currentStock: e.target.value }))} 
                      className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-mono text-[14px] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Min Threshold</label>
                  <div className="relative">
                    <BarChart className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={form.minThreshold} 
                      onChange={(e) => setForm((f) => ({ ...f, minThreshold: e.target.value }))} 
                      className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-mono text-[14px] transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Low Stock Target Threshold</label>
                <div className="relative">
                  <BarChart className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={form.minThreshold} 
                    onChange={(e) => setForm((f) => ({ ...f, minThreshold: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-mono text-[14px] transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="flex gap-3">
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
            form="material-form"
            className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all font-bold hover:shadow-xl hover:-translate-y-0.5"
            disabled={saving}
          >
            {saving ? 'Processing…' : isEdit ? 'Save Config' : 'Create Material'}
          </Button>
        </div>
      </div>
    </div>
  );
}
