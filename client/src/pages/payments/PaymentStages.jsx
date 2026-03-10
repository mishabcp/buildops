import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
import { PaymentBar } from '../../components/shared/PaymentBar.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import {
  getStages,
  createStage,
  updateStage,
  deleteStage,
  createReceipt,
} from '../../api/payments.api.js';
import { PaymentStageForm } from './PaymentStageForm.jsx';
import { ReceiptForm } from './ReceiptForm.jsx';
import { Plus, ChevronDown, ChevronRight, Receipt, Pencil, Trash2 } from 'lucide-react';
import { authStore } from '../../store/authStore.js';

export function PaymentStages({ projectId, onDataChange }) {
  const user = authStore((s) => s.user);
  const isStaff = user?.role === 'STAFF';

  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showStageForm, setShowStageForm] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [receiptStage, setReceiptStage] = useState(null);

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await getStages(projectId);
      if (res?.success && res?.data) setStages(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveStage(payload) {
    if (editingStage) {
      const res = await updateStage(editingStage.id, payload);
      if (res?.success && res?.data) {
        setStages((prev) => prev.map((s) => (s.id === editingStage.id ? res.data : s)));
        setEditingStage(null);
        setShowStageForm(false);
        onDataChange?.();
      } else throw new Error(res?.error);
    } else {
      const res = await createStage(projectId, payload);
      if (res?.success && res?.data) {
        setStages((prev) => [...prev, res.data].sort((a, b) => a.stageNumber - b.stageNumber));
        setShowStageForm(false);
        onDataChange?.();
      } else throw new Error(res?.error);
    }
  }

  async function handleDeleteStage(stage) {
    if (!window.confirm(`Delete stage "${stage.stageName}"?`)) return;
    try {
      const res = await deleteStage(stage.id);
      if (res?.success) {
        setStages((prev) => prev.filter((s) => s.id !== stage.id));
        setExpandedId(null);
        onDataChange?.();
      } else setError(res?.error ?? 'Failed to delete');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to delete');
    }
  }

  async function handleSaveReceipt(stageId, payload) {
    const res = await createReceipt(stageId, payload);
    if (res?.success && res?.data?.stage) {
      setStages((prev) => prev.map((s) => (s.id === stageId ? res.data.stage : s)));
      setReceiptStage(null);
      onDataChange?.();
    } else throw new Error(res?.error ?? 'Failed to record');
  }

  if (loading) return <p className="text-gray-500">Loading stages…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const paidAmount = (stage) => stage.paidAmount ?? stage.receipts?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;
  const expectedAmount = (stage) => Number(stage.expectedAmount) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingStage(null); setShowStageForm(true); }} className="gap-2" disabled={isStaff}>
          <Plus className="h-4 w-4" />
          Add Stage
        </Button>
      </div>

      {stages.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No payment stages yet.</p>
          <Button className="mt-4" onClick={() => setShowStageForm(true)} disabled={isStaff}>Add Stage</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {stages.map((stage) => {
            const paid = paidAmount(stage);
            const expected = expectedAmount(stage);
            const isExpanded = expandedId === stage.id;
            return (
              <div key={stage.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div
                  className="flex flex-wrap items-center gap-4 p-4 hover:bg-gray-50"
                  onClick={() => setExpandedId(isExpanded ? null : stage.id)}
                >
                  <button type="button" className="text-gray-500 hover:text-gray-700" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900">Stage {stage.stageNumber}</span>
                    <span className="ml-2 text-gray-600">— {stage.stageName}</span>
                  </div>
                  <div className="text-sm text-gray-600">{formatDate(stage.dueDate)}</div>
                  <div className="text-sm">
                    <span className="text-gray-600">Expected </span>
                    <span className="font-medium">{formatCurrency(expected)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Paid </span>
                    <span className="font-medium">{formatCurrency(paid)}</span>
                  </div>
                  <StatusBadge status={stage.status} />
                  <div className="w-24">
                    <PaymentBar paid={paid} total={expected} />
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" onClick={() => setReceiptStage(stage)} className="gap-1">
                      <Receipt className="h-4 w-4" />
                      Record Payment
                    </Button>
                    {!isStaff && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingStage(stage); setShowStageForm(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteStage(stage)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {isExpanded && stage.receipts?.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 pl-14">
                    <p className="mb-2 text-xs font-medium uppercase text-gray-500">Receipts</p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="pb-1 pr-4">Date</th>
                          <th className="pb-1 pr-4">Amount</th>
                          <th className="pb-1 pr-4">Mode</th>
                          <th className="pb-1">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stage.receipts.map((r) => (
                          <tr key={r.id} className="border-t border-gray-100">
                            <td className="py-2 pr-4">{formatDate(r.receivedDate)}</td>
                            <td className="py-2 pr-4">{formatCurrency(r.amount)}</td>
                            <td className="py-2 pr-4">{r.paymentMode?.replace(/_/g, ' ')}</td>
                            <td className="py-2">{r.referenceNo ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showStageForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <PaymentStageForm
            stage={editingStage}
            onSave={handleSaveStage}
            onClose={() => { setShowStageForm(false); setEditingStage(null); }}
          />
        </div>
      )}

      {receiptStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <ReceiptForm
            stage={receiptStage}
            onSave={(payload) => handleSaveReceipt(receiptStage.id, payload)}
            onClose={() => setReceiptStage(null)}
          />
        </div>
      )}
    </div>
  );
}
