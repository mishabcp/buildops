import { useState } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';

export function MaterialForm({ material, onSave, onClose }) {
  const isEdit = !!material;
  const [form, setForm] = useState({
    name: material?.name ?? '',
    unit: material?.unit ?? '',
    currentStock: material?.currentStock != null ? String(material.currentStock) : '0',
    minThreshold: material?.minThreshold != null ? String(material.minThreshold) : '0',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const stock = Number(form.currentStock);
    const threshold = Number(form.minThreshold);
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.unit.trim()) {
      setError('Unit is required');
      return;
    }
    if (Number.isNaN(stock) || stock < 0 || Number.isNaN(threshold) || threshold < 0) {
      setError('Valid stock and threshold are required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        unit: form.unit.trim(),
        currentStock: stock,
        minThreshold: threshold,
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
        <CardTitle>{isEdit ? 'Edit Material' : 'Add Material'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name *</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required disabled={isEdit} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Unit *</label>
            <Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="e.g. bags, kg, MT, nos" required />
          </div>
          {!isEdit && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Current stock</label>
                <Input type="number" step="0.01" min="0" value={form.currentStock} onChange={(e) => setForm((f) => ({ ...f, currentStock: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Min threshold</label>
                <Input type="number" step="0.01" min="0" value={form.minThreshold} onChange={(e) => setForm((f) => ({ ...f, minThreshold: e.target.value }))} />
              </div>
            </>
          )}
          {isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium">Min threshold</label>
              <Input type="number" step="0.01" min="0" value={form.minThreshold} onChange={(e) => setForm((f) => ({ ...f, minThreshold: e.target.value }))} />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update' : 'Add'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
