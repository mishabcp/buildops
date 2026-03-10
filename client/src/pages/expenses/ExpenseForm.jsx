import { useState } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';

const PAYMENT_MODES = [
  { value: '', label: '— None —' },
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'UPI', label: 'UPI' },
];

export function ExpenseForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMode: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.description.trim()) {
      setError('Description is required');
      return;
    }
    const amt = Number(form.amount);
    if (!form.amount || Number.isNaN(amt) || amt < 0) {
      setError('Valid amount is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        description: form.description.trim(),
        amount: amt,
        date: form.date,
        paymentMode: form.paymentMode || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add Other Expense</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Description *</label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required rows={2} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Amount (₹) *</label>
            <Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date *</label>
            <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Payment mode</label>
            <select className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.paymentMode} onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}>
              {PAYMENT_MODES.map((m) => <option key={m.value || 'none'} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
