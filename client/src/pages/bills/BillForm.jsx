import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { getProjects } from '../../api/projects.api.js';

export function BillForm({ bill, projectId: initialProjectId, onSave, onClose }) {
  const isEdit = !!bill;
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    projectId: bill?.projectId ?? initialProjectId ?? '',
    type: bill?.type ?? 'PAYABLE',
    partyName: bill?.partyName ?? '',
    billNumber: bill?.billNumber ?? '',
    billDate: bill?.billDate ? bill.billDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    dueDate: bill?.dueDate ? bill.dueDate.slice(0, 10) : '',
    totalAmount: bill?.totalAmount != null ? String(bill.totalAmount) : '',
    description: bill?.description ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProjects().then((res) => {
      if (res?.success && res?.data) setProjects(res.data);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.partyName.trim()) {
      setError('Party name is required');
      return;
    }
    const total = Number(form.totalAmount);
    if (Number.isNaN(total) || total < 0) {
      setError('Valid total amount is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        projectId: form.projectId === '' ? null : Number(form.projectId),
        type: form.type,
        partyName: form.partyName.trim(),
        billNumber: form.billNumber.trim() || null,
        billDate: form.billDate,
        dueDate: form.dueDate || null,
        totalAmount: total,
        description: form.description.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isEdit ? 'Edit Bill' : 'Add Bill'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Type *</label>
            <select className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="PAYABLE">Payable</option>
              <option value="RECEIVABLE">Receivable</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Party name *</label>
            <Input value={form.partyName} onChange={(e) => setForm((f) => ({ ...f, partyName: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Project</label>
            <select className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}>
              <option value="">— None —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Bill number</label>
            <Input value={form.billNumber} onChange={(e) => setForm((f) => ({ ...f, billNumber: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Bill date *</label>
              <Input type="date" value={form.billDate} onChange={(e) => setForm((f) => ({ ...f, billDate: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Due date</label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Total amount (₹) *</label>
            <Input type="number" step="0.01" min="0" value={form.totalAmount} onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update' : 'Add'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
