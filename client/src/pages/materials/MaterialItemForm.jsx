import { useState } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';

export function MaterialItemForm({ type, materials, onSave, onClose }) {
  const isPurchase = type === 'PURCHASE';
  const [form, setForm] = useState({
    materialId: '',
    quantity: '',
    ratePerUnit: isPurchase ? '' : '',
    totalCost: isPurchase ? '' : '',
    supplierName: isPurchase ? '' : '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalFromRate = () => {
    const q = Number(form.quantity) || 0;
    const r = Number(form.ratePerUnit) || 0;
    return q * r;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const qty = Number(form.quantity);
    if (!form.materialId || Number.isNaN(qty) || qty <= 0) {
      setError('Select material and enter valid quantity');
      return;
    }
    if (isPurchase && Number(form.ratePerUnit) < 0) {
      setError('Valid rate is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        materialId: Number(form.materialId),
        type,
        quantity: qty,
        date: form.date,
        notes: form.notes.trim() || null,
      };
      if (isPurchase) {
        payload.ratePerUnit = form.ratePerUnit ? Number(form.ratePerUnit) : null;
        payload.totalCost = form.totalCost ? Number(form.totalCost) : totalFromRate();
        payload.supplierName = form.supplierName.trim() || null;
      }
      await onSave(payload);
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
        <CardTitle>{isPurchase ? 'Add Purchase' : 'Add Usage'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Material *</label>
            <select
              className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.materialId}
              onChange={(e) => setForm((f) => ({ ...f, materialId: e.target.value }))}
              required
            >
              <option value="">Select material</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.unit}) — stock: {Number(m.currentStock)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Quantity *</label>
            <Input type="number" step="0.01" min="0.01" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date *</label>
            <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </div>
          {isPurchase && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Rate per unit (₹)</label>
                <Input type="number" step="0.01" min="0" value={form.ratePerUnit} onChange={(e) => setForm((f) => ({ ...f, ratePerUnit: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Total cost (₹)</label>
                <Input type="number" step="0.01" min="0" value={form.totalCost || totalFromRate()} onChange={(e) => setForm((f) => ({ ...f, totalCost: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Supplier</label>
                <Input value={form.supplierName} onChange={(e) => setForm((f) => ({ ...f, supplierName: e.target.value }))} />
              </div>
            </>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
