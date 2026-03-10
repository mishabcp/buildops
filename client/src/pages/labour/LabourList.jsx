import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getLabour, createLabour, updateLabour, deleteLabour } from '../../api/labour.api.js';
import { LabourForm } from './LabourForm.jsx';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { authStore } from '../../store/authStore.js';

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
    if (!window.confirm(`Delete labour entry for "${entry.workerName}"?`)) return;
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

  if (loading) return <p className="text-gray-500">Loading labour entries…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingEntry(null); setShowForm(true); }} className="gap-2" disabled={isStaff}>
          <Plus className="h-4 w-4" />
          Add Labour Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No labour entries yet.</p>
          <Button className="mt-4" onClick={() => setShowForm(true)} disabled={isStaff}>Add Labour Entry</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="border-b border-gray-200 text-left">
                <th className="p-3 font-medium text-gray-700">Worker</th>
                <th className="p-3 font-medium text-gray-700">Work Type</th>
                <th className="p-3 font-medium text-gray-700">Days</th>
                <th className="p-3 font-medium text-gray-700">Rate</th>
                <th className="p-3 font-medium text-gray-700">Total</th>
                <th className="p-3 font-medium text-gray-700">Paid</th>
                <th className="p-3 font-medium text-gray-700">Balance</th>
                <th className="p-3 font-medium text-gray-700">Status</th>
                {!isStaff && <th className="p-3 font-medium text-gray-700">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="p-3 font-medium">{e.workerName}</td>
                  <td className="p-3 text-gray-600">{e.workType ?? '—'}</td>
                  <td className="p-3">{e.days != null ? Number(e.days) : '—'}</td>
                  <td className="p-3">{e.ratePerDay != null ? formatCurrency(e.ratePerDay) : '—'}</td>
                  <td className="p-3">{formatCurrency(e.totalAmount)}</td>
                  <td className="p-3">{formatCurrency(e.paidAmount)}</td>
                  <td className="p-3">{formatCurrency(balance(e))}</td>
                  <td className="p-3"><StatusBadge status={e.status} /></td>
                  {!isStaff && (
                    <td className="p-3">
                      <Button size="sm" variant="outline" className="mr-2" onClick={() => { setEditingEntry(e); setShowForm(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(e)} className="text-red-600 hover:text-red-700">
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
          <LabourForm
            entry={editingEntry}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingEntry(null); }}
          />
        </div>
      )}
    </div>
  );
}
