import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getLabour, createLabour, updateLabour, deleteLabour } from '../../api/labour.api.js';
import { LabourForm } from './LabourForm.jsx';
import { Plus, Pencil, Trash2, HardHat, Pickaxe, Hammer, User } from 'lucide-react';
import { authStore } from '../../store/authStore.js';
import { cn } from '../../lib/utils.js';

export function LabourList({ projectId, onDataChange }) {
  const user = authStore((s) => s.user);
  const isStaff = user?.role === 'STAFF';

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await getLabour(projectId);
      if (res?.success && res?.data) setEntries(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(payload) {
    if (editingEntry) {
      const res = await updateLabour(editingEntry.id, payload);
      if (res?.success && res?.data) {
        setEntries((prev) => prev.map((e) => (e.id === editingEntry.id ? res.data : e)));
        setEditingEntry(null);
        setShowForm(false);
        onDataChange?.();
      } else throw new Error(res?.error);
    } else {
      const res = await createLabour(projectId, payload);
      if (res?.success && res?.data) {
        setEntries((prev) => [res.data, ...prev]);
        setShowForm(false);
        onDataChange?.();
      } else throw new Error(res?.error);
    }
  }

  async function handleDelete(entry) {
    if (!window.confirm(`Are you sure you want to delete the labour entry for "${entry.workerName}"?`)) return;
    try {
      const res = await deleteLabour(entry.id);
      if (res?.success) {
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        onDataChange?.();
      } else setError(res?.error ?? 'Failed to delete');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to delete');
    }
  }

  const balance = (e) => {
    const total = Number(e.totalAmount) || 0;
    const paid = Number(e.paidAmount) || 0;
    return total - paid;
  };

  if (loading) {
     return (
       <div className="animate-pulse space-y-4 pt-4">
         <div className="h-14 bg-slate-100 rounded-xl w-40 ml-auto" />
         <div className="h-64 bg-slate-100 rounded-3xl w-full" />
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

      <div className="flex justify-between items-center">
         <h3 className="text-lg font-bold text-slate-900 hidden sm:block">Labour Directory</h3>
         <Button 
           onClick={() => { setEditingEntry(null); setShowForm(true); }} 
           className="h-10 px-5 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 font-semibold transition-all hover:-translate-y-0.5 ml-auto" 
           disabled={isStaff}
         >
           <Plus className="h-4 w-4" />
           Add Labour Entry
         </Button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-slate-100">
             <HardHat className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Labour Records</h3>
          <p className="text-slate-500 font-medium max-w-sm mb-6">Track workers, tasks, payment days, and outstanding balances.</p>
          <Button 
            className="h-11 px-6 rounded-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm"
            onClick={() => setShowForm(true)} 
            disabled={isStaff}
          >
             <Plus className="h-4 w-4 mr-2" />
             Create Entry
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                <tr className="text-left">
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Worker</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Task Details</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Duration & Rate</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500 tracking-wider text-right">Costs</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                  {!isStaff && <th className="py-4 px-6 w-24"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((e) => {
                  const bal = balance(e);
                  return (
                    <tr key={e.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600 font-bold border border-orange-100 shrink-0">
                             {e.workerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-[14px]">{e.workerName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                         <div className="flex items-center gap-2">
                           {e.workType ? (
                             <>
                               <Pickaxe className="h-3.5 w-3.5 text-slate-400" />
                               <span className="font-medium text-slate-600">{e.workType}</span>
                             </>
                           ) : (
                             <span className="text-slate-400 italic">Not specified</span>
                           )}
                         </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{e.days != null ? `${Number(e.days)} Days` : '—'}</span>
                          <span className="text-[12px] text-slate-500 font-medium">{e.ratePerDay != null ? `${formatCurrency(e.ratePerDay)}/day` : 'Flat Rate'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                         <div className="flex flex-col items-end gap-1">
                           <span className="font-bold text-slate-900">{formatCurrency(e.totalAmount)}</span>
                           {bal > 0 ? (
                             <span className="text-[12px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Bal: {formatCurrency(bal)}</span>
                           ) : (
                             <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Paid in full</span>
                           )}
                         </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={e.status} />
                      </td>
                      {!isStaff && (
                        <td className="py-4 px-6 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button 
                               size="sm" 
                               variant="ghost" 
                               className="h-9 w-9 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" 
                               onClick={() => { setEditingEntry(e); setShowForm(true); }}
                               title="Edit Entry"
                             >
                               <Pencil className="h-4 w-4" />
                             </Button>
                             <Button 
                               size="sm" 
                               variant="ghost" 
                               onClick={() => handleDelete(e)} 
                               className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                               title="Delete Entry"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => { setShowForm(false); setEditingEntry(null); }} />
           <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-lg">
             <LabourForm
               entry={editingEntry}
               onSave={handleSave}
               onClose={() => { setShowForm(false); setEditingEntry(null); }}
             />
           </div>
        </div>
      )}
    </div>
  );
}
