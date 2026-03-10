import { useState, useEffect, Fragment } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { getBills, createBill, updateBill, addBillPayment } from '../../api/bills.api.js';
import { BillForm } from './BillForm.jsx';
import { BillPaymentForm } from './BillPaymentForm.jsx';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';

export function ProjectBillsTab({ projectId, onDataChange }) {
  console.log('[ProjectBillsTab] Render', {
    projectId,
    timestamp: new Date().toISOString(),
  });
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [paymentBill, setPaymentBill] = useState(null);

  useEffect(() => {
    if (!projectId) {
      console.log('[ProjectBillsTab] Effect skipped (no projectId)', { projectId });
      return;
    }
    const effectId = `${projectId}-${Date.now()}`;
    let cancelled = false;
    console.log('[ProjectBillsTab] Effect started: fetch bills for project', {
      projectId: Number(projectId),
      effectId,
      timestamp: new Date().toISOString(),
    });
    setLoading(true);
    setError('');
    (async () => {
      try {
        console.log('[ProjectBillsTab] getBills() request started', { projectId: Number(projectId), effectId });
        const res = await getBills({ projectId: Number(projectId) });
        if (cancelled) {
          console.log('[ProjectBillsTab] getBills() response ignored (effect already cleaned up)', {
            effectId,
            hadSuccess: res?.success,
            dataLength: res?.data?.length ?? 0,
            timestamp: new Date().toISOString(),
          });
          return;
        }
        console.log('[ProjectBillsTab] getBills() response received', {
          effectId,
          success: res?.success,
          error: res?.error ?? null,
          count: Array.isArray(res?.data) ? res.data.length : 0,
          data: res?.data,
          fullResponse: res,
          timestamp: new Date().toISOString(),
        });
        if (res?.success && res?.data) setBills(res.data);
        else setError(res?.error ?? 'Failed to load');
        // Do not call onDataChange here — it triggers parent load() and causes a re-render cascade. Call it only when user adds/edits a bill or records a payment.
      } catch (err) {
        if (!cancelled) {
          console.log('[ProjectBillsTab] getBills() error', {
            effectId,
            message: err?.message,
            response: err?.response?.data,
            timestamp: new Date().toISOString(),
          });
          setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
        }
      } finally {
        if (!cancelled) {
          console.log('[ProjectBillsTab] Effect finished (loading=false)', { effectId, timestamp: new Date().toISOString() });
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      console.log('[ProjectBillsTab] Effect cleanup (unmount/cancel)', { effectId, projectId: Number(projectId), timestamp: new Date().toISOString() });
    };
  }, [projectId]);

  async function loadBills() {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getBills({ projectId: Number(projectId) });
      if (res?.success && res?.data) setBills(res.data);
      else setError(res?.error ?? 'Failed to load');
      onDataChange?.();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveBill(payload) {
    const withProject = { ...payload, projectId: Number(projectId) };
    if (editingBill) {
      const res = await updateBill(editingBill.id, withProject);
      if (res?.success && res?.data) {
        setBills((prev) => prev.map((b) => (b.id === editingBill.id ? res.data : b)));
        setEditingBill(null);
        setShowForm(false);
        onDataChange?.();
      } else throw new Error(res?.error);
    } else {
      const res = await createBill(withProject);
      if (res?.success && res?.data) {
        setBills((prev) => [res.data, ...prev]);
        setShowForm(false);
        onDataChange?.();
      } else throw new Error(res?.error);
    }
  }

  async function handleRecordPayment(billId, payload) {
    const res = await addBillPayment(billId, payload);
    if (res?.success && res?.data?.bill) {
      setBills((prev) => prev.map((b) => (b.id === billId ? res.data.bill : b)));
      setPaymentBill(null);
      onDataChange?.();
    } else throw new Error(res?.error);
  }

  const balance = (b) => (Number(b.totalAmount) || 0) - (Number(b.paidAmount) || 0);

  if (loading && bills.length === 0) return <p className="text-gray-500">Loading bills…</p>;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <Button onClick={() => { setEditingBill(null); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Bill
        </Button>
      </div>
      {bills.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-gray-600">No bills for this project.</p>
          <Button className="mt-3" onClick={() => setShowForm(true)}>Add Bill</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200 text-left">
                <th className="p-3 font-medium text-gray-700 w-8" />
                <th className="p-3 font-medium text-gray-700">Party</th>
                <th className="p-3 font-medium text-gray-700">Type</th>
                <th className="p-3 font-medium text-gray-700">Bill No</th>
                <th className="p-3 font-medium text-gray-700">Date</th>
                <th className="p-3 font-medium text-gray-700">Total</th>
                <th className="p-3 font-medium text-gray-700">Paid</th>
                <th className="p-3 font-medium text-gray-700">Balance</th>
                <th className="p-3 font-medium text-gray-700">Status</th>
                <th className="p-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b, i) => (
                <Fragment key={b.id}>
                  <tr
                    key={b.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                    onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                  >
                    <td className="p-3">{expandedId === b.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                    <td className="p-3 font-medium">{b.partyName}</td>
                    <td className="p-3">{b.type}</td>
                    <td className="p-3">{b.billNumber ?? '—'}</td>
                    <td className="p-3">{formatDate(b.billDate)}</td>
                    <td className="p-3">{formatCurrency(b.totalAmount)}</td>
                    <td className="p-3">{formatCurrency(b.paidAmount)}</td>
                    <td className="p-3">{formatCurrency(balance(b))}</td>
                    <td className="p-3"><StatusBadge status={b.status} /></td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => setPaymentBill(b)}>Record Payment</Button>
                    </td>
                  </tr>
                  {expandedId === b.id && b.payments?.length > 0 && (
                    <tr key={`${b.id}-exp`} className="bg-gray-50">
                      <td colSpan={10} className="p-4 pl-12">
                        <p className="mb-2 text-xs font-medium uppercase text-gray-500">Payment history</p>
                        <table className="w-full text-sm">
                          <thead><tr className="text-left text-gray-600"><th className="pb-1 pr-4">Date</th><th className="pb-1 pr-4">Amount</th><th className="pb-1 pr-4">Mode</th><th className="pb-1">Reference</th></tr></thead>
                          <tbody>
                            {b.payments.map((p) => (
                              <tr key={p.id} className="border-t border-gray-100">
                                <td className="py-2 pr-4">{formatDate(p.paidDate)}</td>
                                <td className="py-2 pr-4">{formatCurrency(p.amount)}</td>
                                <td className="py-2 pr-4">{p.paymentMode?.replace(/_/g, ' ')}</td>
                                <td className="py-2">{p.referenceNo ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <BillForm bill={editingBill} projectId={projectId} onSave={handleSaveBill} onClose={() => { setShowForm(false); setEditingBill(null); }} />
        </div>
      )}
      {paymentBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <BillPaymentForm bill={paymentBill} onSave={(payload) => handleRecordPayment(paymentBill.id, payload)} onClose={() => setPaymentBill(null)} />
        </div>
      )}
    </div>
  );
}
