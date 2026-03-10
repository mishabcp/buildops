import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { getProjectExpenses, createExpense, deleteExpense } from '../../api/expenses.api.js';
import { ExpenseForm } from './ExpenseForm.jsx';
import { authStore } from '../../store/authStore.js';
import { Plus, Trash2, Receipt, ReceiptText, Banknote } from 'lucide-react';

export function ProjectExpensesTab({ projectId, onDataChange }) {
  const user = authStore((s) => s.user);
  const isStaff = user?.role === 'STAFF';
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const res = await getProjectExpenses(projectId);
        if (cancelled) return;
        if (res?.success && res?.data) setExpenses(res.data);
        else setError(res?.error ?? 'Failed to load');
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  async function load() {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getProjectExpenses(projectId);
      if (res?.success && res?.data) setExpenses(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(payload) {
    const res = await createExpense(projectId, payload);
    if (res?.success && res?.data) {
      setExpenses((prev) => [res.data, ...prev]);
      setShowForm(false);
      onDataChange?.();
    } else throw new Error(res?.error);
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    setDeletingId(id);
    try {
      const res = await deleteExpense(id);
      if (res?.success) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        onDataChange?.();
      } else throw new Error(res?.error);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  if (loading && expenses.length === 0) {
     return (
       <div className="animate-pulse space-y-4 pt-4">
         <div className="h-10 bg-slate-100 rounded-xl w-32 ml-auto" />
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="hidden sm:flex flex-col">
            <h3 className="text-lg font-bold text-slate-900">Miscellaneous Expenses</h3>
            <p className="text-sm font-medium text-slate-500">Track fuel, site maintenance, and other costs</p>
         </div>

         <div className="flex items-center gap-4 sm:ml-auto">
             <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Expenses</span>
                <span className="font-bold text-slate-900 text-[16px]">{formatCurrency(total)}</span>
             </div>
             <Button 
               onClick={() => setShowForm(true)} 
               disabled={isStaff} 
               className="h-10 px-5 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 font-bold transition-all hover:-translate-y-0.5"
             >
               <Plus className="h-4 w-4" />
               Log Expense
             </Button>
         </div>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-slate-100">
             <Receipt className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Additional Expenses</h3>
          <p className="text-slate-500 font-medium max-w-sm mb-6">Record any project expenses that aren't labour or materials.</p>
          <Button 
            className="h-11 px-6 rounded-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm"
            onClick={() => setShowForm(true)} 
            disabled={isStaff}
          >
             <Plus className="h-4 w-4 mr-2" />
             Log First Expense
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                <tr className="text-left">
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-[40%]">Expense Details</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Date Logged</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Payment Mode</th>
                  <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Amount</th>
                  {!isStaff && <th className="py-4 px-6 w-16"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 min-w-[200px]">
                        <div className="flex items-start gap-3">
                           <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0 mt-0.5">
                             <ReceiptText className="h-4 w-4 text-indigo-600" />
                           </div>
                           <p className="font-bold text-slate-900 whitespace-normal line-clamp-2 leading-relaxed">{e.description}</p>
                        </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">{formatDate(e.date)}</td>
                    <td className="py-4 px-6">
                       <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/50 text-[12px]">
                         <Banknote className="h-3.5 w-3.5 opacity-70" />
                         {e.paymentMode?.replace(/_/g, ' ') ?? '—'}
                       </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                       <span className="font-bold text-slate-900 text-[15px]">{formatCurrency(e.amount)}</span>
                    </td>
                    {!isStaff && (
                      <td className="py-4 px-6 text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" 
                          disabled={deletingId === e.id} 
                          onClick={() => handleDelete(e.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setShowForm(false)} />
           <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-md">
             <ExpenseForm onSave={handleAdd} onClose={() => setShowForm(false)} />
           </div>
        </div>
      )}
    </div>
  );
}
