import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { getProjectExpenses, createExpense, deleteExpense } from '../../api/expenses.api.js';
import { ExpenseForm } from './ExpenseForm.jsx';
import { authStore } from '../../store/authStore.js';
import { Plus, Trash2 } from 'lucide-react';

export function ProjectExpensesTab({ projectId, onDataChange }) {
  const user = authStore((s) => s.user);
  const isStaff = user?.role === 'STAFF';
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);

  async function load() {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getProjectExpenses(projectId);
      if (res?.success && res?.data) setExpenses(res.data);
      else setError(res?.error ?? 'Failed to load');
      onDataChange?.();
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
    if (!confirm('Delete this expense?')) return;
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

  if (loading && expenses.length === 0) return <p className="text-gray-500">Loading expenses…</p>;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Total: {formatCurrency(total)}</p>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>
      {expenses.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-gray-600">No other expenses recorded.</p>
          <Button className="mt-3" onClick={() => setShowForm(true)}>Add Expense</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200 text-left">
                <th className="p-3 font-medium text-gray-700">Description</th>
                <th className="p-3 font-medium text-gray-700">Date</th>
                <th className="p-3 font-medium text-gray-700">Amount</th>
                <th className="p-3 font-medium text-gray-700">Payment mode</th>
                {!isStaff && <th className="p-3 font-medium text-gray-700 w-24">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => (
                <tr key={e.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="p-3">{e.description}</td>
                  <td className="p-3">{formatDate(e.date)}</td>
                  <td className="p-3">{formatCurrency(e.amount)}</td>
                  <td className="p-3">{e.paymentMode?.replace(/_/g, ' ') ?? '—'}</td>
                  {!isStaff && (
                    <td className="p-3">
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" disabled={deletingId === e.id} onClick={() => handleDelete(e.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <ExpenseForm onSave={handleAdd} onClose={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
}
