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

export function ReceiptForm({ stage, onSave, onClose }) {
  const [form, setForm] = useState({
    amount: '',
    receivedDate: new Date().toISOString().slice(0, 10),
    paymentMode: 'CASH',
    referenceNo: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const amountNum = Number(form.amount);
    if (!form.amount || Number.isNaN(amountNum) || amountNum <= 0) {
      setError('Valid amount is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        amount: amountNum,
        receivedDate: form.receivedDate,
        paymentMode: form.paymentMode,
        referenceNo: form.referenceNo.trim() || null,
        notes: form.notes.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to record');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Record Payment</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </CardHeader>
      <CardContent>
        {stage && <p className="mb-3 text-sm text-gray-600">Stage: {stage.stageName}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Amount (₹) *</label>
            <Input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date *</label>
            <Input type="date" value={form.receivedDate} onChange={(e) => setForm((f) => ({ ...f, receivedDate: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Payment mode *</label>
            <select className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.paymentMode} onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}>
              {PAYMENT_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reference (cheque no / transaction id)</label>
            <Input value={form.referenceNo} onChange={(e) => setForm((f) => ({ ...f, referenceNo: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Record'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
