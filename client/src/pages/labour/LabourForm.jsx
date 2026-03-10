import { useState } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';

const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'UPI', label: 'UPI' },
];

export function LabourForm({ entry, onSave, onClose }) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    workerName: entry?.workerName ?? '',
    workType: entry?.workType ?? '',
    days: entry?.days != null ? String(entry.days) : '',
    ratePerDay: entry?.ratePerDay != null ? String(entry.ratePerDay) : '',
    totalAmount: entry?.totalAmount != null ? String(entry.totalAmount) : '',
    paidAmount: entry?.paidAmount != null ? String(entry.paidAmount) : '0',
    paymentDate: entry?.paymentDate ? entry.paymentDate.slice(0, 10) : '',
    paymentMode: entry?.paymentMode ?? 'CASH',
    notes: entry?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const total = form.totalAmount ? Number(form.totalAmount) : 0;
    const paid = form.paidAmount ? Number(form.paidAmount) : 0;
    if (!form.workerName.trim()) {
      setError('Worker name is required');
      return;
    }
    if (Number.isNaN(total) || total < 0) {
      setError('Valid total amount is required');
      return;
    }
    if (Number.isNaN(paid) || paid < 0) {
      setError('Paid amount must be non-negative');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        workerName: form.workerName.trim(),
        workType: form.workType.trim() || null,
        days: form.days ? Number(form.days) : null,
        ratePerDay: form.ratePerDay ? Number(form.ratePerDay) : null,
        totalAmount: total,
        paidAmount: paid,
        paymentDate: form.paymentDate || null,
        paymentMode: form.paymentMode,
        notes: form.notes.trim() || null,
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
        <CardTitle>{isEdit ? 'Edit Labour Entry' : 'Add Labour Entry'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Worker name *</label>
            <Input value={form.workerName} onChange={(e) => setForm((f) => ({ ...f, workerName: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Work type</label>
            <Input value={form.workType} onChange={(e) => setForm((f) => ({ ...f, workType: e.target.value }))} placeholder="e.g. Mason, Helper" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Days</label>
              <Input type="number" step="0.01" min="0" value={form.days} onChange={(e) => setForm((f) => ({ ...f, days: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Rate per day (₹)</label>
              <Input type="number" step="0.01" min="0" value={form.ratePerDay} onChange={(e) => setForm((f) => ({ ...f, ratePerDay: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Total amount (₹) *</label>
              <Input type="number" step="0.01" min="0" value={form.totalAmount} onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Paid amount (₹)</label>
              <Input type="number" step="0.01" min="0" value={form.paidAmount} onChange={(e) => setForm((f) => ({ ...f, paidAmount: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Payment date</label>
              <Input type="date" value={form.paymentDate} onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Payment mode</label>
              <select className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.paymentMode} onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}>
                {PAYMENT_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update' : 'Add'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
