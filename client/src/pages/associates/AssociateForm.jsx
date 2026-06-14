import { useState } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { X, User, Phone, Mail, ShieldAlert, BadgeCheck } from 'lucide-react';

export function AssociateForm({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', workType: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        workType: form.workType.trim() || null,
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
          New Associate
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
              <label className="text-sm font-bold text-slate-700">Full Name / Organization <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-bold text-[15px] transition-all"
                  placeholder="e.g. John Doe / Apex Constructions"
                  required 
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={form.phone} 
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-medium transition-all"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-medium transition-all"
                    placeholder="e.g. name@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-slate-700 block">Work Type / Specialization</label>
              <div className="relative">
                <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  value={form.workType} 
                  onChange={(e) => setForm((f) => ({ ...f, workType: e.target.value }))} 
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 font-medium transition-all"
                  placeholder="e.g. Electrical, Plumbing, HVAC"
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
              {saving ? 'Processing…' : 'Register Associate'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
