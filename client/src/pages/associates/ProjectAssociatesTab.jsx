import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import {
  getAssociates,
  createAssociate,
  getProjectAssociates,
  assignAssociateToProject,
  recordAssociatePayment,
} from '../../api/associates.api.js';
import { AssociateForm } from './AssociateForm.jsx';
import { AssociatePaymentForm } from './AssociatePaymentForm.jsx';
import { Plus, ChevronDown, ChevronRight, Receipt } from 'lucide-react';

export function ProjectAssociatesTab({ projectId, onDataChange }) {
  const [payments, setPayments] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showNewAssociateForm, setShowNewAssociateForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadPayments();
      loadAssociates();
    }
  }, [projectId]);

  async function loadPayments() {
    setLoading(true);
    setError('');
    try {
      const res = await getProjectAssociates(projectId);
      if (res?.success && res?.data) setPayments(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function loadAssociates() {
    try {
      const res = await getAssociates();
      if (res?.success && res?.data) setAssociates(res.data);
    } catch (_) {}
  }

  async function handleAssign(payload) {
    const res = await assignAssociateToProject(projectId, payload);
    if (res?.success && res?.data) {
      setPayments((prev) => [...prev, res.data]);
      setShowAssignForm(false);
      onDataChange?.();
    } else throw new Error(res?.error);
  }

  async function handleCreateAssociate(payload) {
    const res = await createAssociate(payload);
    if (res?.success && res?.data) {
      setAssociates((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setShowNewAssociateForm(false);
    } else throw new Error(res?.error);
  }

  async function handleRecordPayment(paymentId, payload) {
    const res = await recordAssociatePayment(paymentId, payload);
    if (res?.success && res?.data) {
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? res.data : p)));
      setPaymentForm(null);
      onDataChange?.();
    } else throw new Error(res?.error);
  }

  const balance = (p) => (Number(p.agreedAmount) || 0) - (Number(p.paidAmount) || 0);

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowAssignForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Associate
        </Button>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No associates assigned yet.</p>
          <Button className="mt-4" onClick={() => setShowAssignForm(true)}>Add Associate</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => {
            const isExpanded = expandedId === p.id;
            return (
              <div key={p.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div
                  className="flex flex-wrap items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                >
                  <button type="button" className="text-gray-500" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900">{p.associate?.name}</span>
                    {p.associate?.workType && <span className="ml-2 text-gray-500">— {p.associate.workType}</span>}
                  </div>
                  <div className="text-sm text-gray-600">{p.scopeOfWork ?? '—'}</div>
                  <div className="text-sm">
                    <span className="text-gray-600">Agreed </span>
                    <span className="font-medium">{formatCurrency(p.agreedAmount)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Paid </span>
                    <span className="font-medium">{formatCurrency(p.paidAmount)}</span>
                  </div>
                  <div className="text-sm font-medium">{formatCurrency(balance(p))}</div>
                  <StatusBadge status={p.status} />
                  <Button size="sm" variant="outline" className="gap-1" onClick={(e) => { e.stopPropagation(); setPaymentForm(p); }}>
                    <Receipt className="h-4 w-4" />
                    Record Payment
                  </Button>
                </div>
                {isExpanded && p.transactions?.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 pl-14">
                    <p className="mb-2 text-xs font-medium uppercase text-gray-500">Transactions</p>
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
                        {p.transactions.map((t) => (
                          <tr key={t.id} className="border-t border-gray-100">
                            <td className="py-2 pr-4">{formatDate(t.paidDate)}</td>
                            <td className="py-2 pr-4">{formatCurrency(t.amount)}</td>
                            <td className="py-2 pr-4">{t.paymentMode?.replace(/_/g, ' ')}</td>
                            <td className="py-2">{t.referenceNo ?? '—'}</td>
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

      {showAssignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <AssignAssociateModal
            associates={associates}
            assignedIds={payments.map((p) => p.associateId)}
            onAssign={handleAssign}
            onClose={() => setShowAssignForm(false)}
            onNewAssociate={() => { setShowNewAssociateForm(true); }}
          />
        </div>
      )}

      {showNewAssociateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <AssociateForm onSave={handleCreateAssociate} onClose={() => setShowNewAssociateForm(false)} />
        </div>
      )}

      {paymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <AssociatePaymentForm
            payment={paymentForm}
            onSave={(payload) => handleRecordPayment(paymentForm.id, payload)}
            onClose={() => setPaymentForm(null)}
          />
        </div>
      )}
    </div>
  );
}

function AssignAssociateModal({ associates, assignedIds, onAssign, onClose, onNewAssociate }) {
  const [form, setForm] = useState({ associateId: '', scopeOfWork: '', agreedAmount: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const available = associates.filter((a) => !assignedIds.includes(a.id));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.associateId) {
      setError('Select an associate');
      return;
    }
    const agreed = Number(form.agreedAmount);
    if (Number.isNaN(agreed) || agreed < 0) {
      setError('Valid agreed amount is required');
      return;
    }
    setSaving(true);
    try {
      await onAssign({
        associateId: Number(form.associateId),
        scopeOfWork: form.scopeOfWork.trim() || null,
        agreedAmount: agreed,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to assign');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Assign Associate to Project</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Associate *</label>
          <select
            className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.associateId}
            onChange={(e) => setForm((f) => ({ ...f, associateId: e.target.value }))}
            required
          >
            <option value="">Select associate</option>
            {available.map((a) => (
              <option key={a.id} value={a.id}>{a.name} {a.workType ? `— ${a.workType}` : ''}</option>
            ))}
          </select>
          <button type="button" onClick={onNewAssociate} className="mt-1 text-sm text-blue-600 hover:underline">
            + New associate
          </button>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Scope of work</label>
          <input
            className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.scopeOfWork}
            onChange={(e) => setForm((f) => ({ ...f, scopeOfWork: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Agreed amount (₹) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.agreedAmount}
            onChange={(e) => setForm((f) => ({ ...f, agreedAmount: e.target.value }))}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Assign'}</Button>
      </form>
    </div>
  );
}
