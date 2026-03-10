import { useState } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';

export function PaymentStageForm({ stage, onSave, onClose }) {
  const isEdit = !!stage;
  const [form, setForm] = useState({
    stageName: stage?.stageName ?? '',
    stageNumber: stage?.stageNumber ?? '',
    expectedAmount: stage?.expectedAmount != null ? String(stage.expectedAmount) : '',
    dueDate: stage?.dueDate ? stage.dueDate.slice(0, 10) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({
        stageName: form.stageName.trim(),
        ...(form.stageNumber !== '' && { stageNumber: Number(form.stageNumber) }),
        expectedAmount: form.expectedAmount ? Number(form.expectedAmount) : 0,
        dueDate: form.dueDate || null,
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
        <CardTitle>{isEdit ? 'Edit Stage' : 'Add Stage'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Stage name *</label>
            <Input value={form.stageName} onChange={(e) => setForm((f) => ({ ...f, stageName: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Stage number</label>
            <Input type="number" min="1" value={form.stageNumber} onChange={(e) => setForm((f) => ({ ...f, stageNumber: e.target.value }))} placeholder="Auto" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Expected amount (₹) *</label>
            <Input type="number" step="0.01" min="0" value={form.expectedAmount} onChange={(e) => setForm((f) => ({ ...f, expectedAmount: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Due date</label>
            <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update' : 'Add'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
