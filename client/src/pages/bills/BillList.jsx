import { useState, useEffect, Fragment } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { getBills, createBill, updateBill, addBillPayment } from '../../api/bills.api.js';
import { getBranches } from '../../api/branches.api.js';
import { BillForm } from './BillForm.jsx';
import { BillPaymentForm } from './BillPaymentForm.jsx';
import { TableSkeleton } from '../../components/shared/TableSkeleton.jsx';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { authStore } from '../../store/authStore.js';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'PAYABLE', label: 'Payable' },
  { id: 'RECEIVABLE', label: 'Receivable' },
];

export function BillList() {
  const user = authStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [bills, setBills] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [branchId, setBranchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [paymentBill, setPaymentBill] = useState(null);

  useEffect(() => {
    loadBills();
    if (isSuperAdmin) getBranches().then((r) => r?.success && r?.data && setBranches(r.data));
  }, [tab, branchId, statusFilter, isSuperAdmin]);

  async function loadBills() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (tab !== 'all') params.type = tab;
      if (branchId) params.branchId = branchId;
      if (statusFilter) params.status = statusFilter;
      const res = await getBills(params);
      if (res?.success && res?.data) setBills(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveBill(payload) {
    if (editingBill) {
      const res = await updateBill(editingBill.id, payload);
      if (res?.success && res?.data) {
        setBills((prev) => prev.map((b) => (b.id === editingBill.id ? res.data : b)));
        setEditingBill(null);
        setShowForm(false);
      } else throw new Error(res?.error);
    } else {
      const res = await createBill(payload);
      if (res?.success && res?.data) {
        setBills((prev) => [res.data, ...prev]);
        setShowForm(false);
      } else throw new Error(res?.error);
    }
  }

  async function handleRecordPayment(billId, payload) {
    const res = await addBillPayment(billId, payload);
    if (res?.success && res?.data?.bill) {
      setBills((prev) => prev.map((b) => (b.id === billId ? res.data.bill : b)));
      setPaymentBill(null);
    } else throw new Error(res?.error);
  }

  const balance = (b) => (Number(b.totalAmount) || 0) - (Number(b.paidAmount) || 0);

  if (loading && bills.length === 0) return <PageWrapper title="Bills"><TableSkeleton rows={6} cols={10} /></PageWrapper>;

  return (
    <PageWrapper title="Bills">
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-2 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-4 py-2 text-sm font-medium ${tab === t.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {isSuperAdmin && (
          <select className="h-10 rounded-md border border-gray-300 px-3 py-2 text-sm" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">All branches</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <select className="h-10 rounded-md border border-gray-300 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PARTIALLY_PAID">Partially paid</option>
          <option value="PAID">Paid</option>
        </select>
        <Button onClick={() => { setEditingBill(null); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Bill
        </Button>
      </div>

      {bills.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No bills found.</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>Add Bill</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="border-b border-gray-200 text-left">
                <th className="p-3 font-medium text-gray-700 w-8" />
                <th className="p-3 font-medium text-gray-700">Party</th>
                <th className="p-3 font-medium text-gray-700">Bill No</th>
                <th className="p-3 font-medium text-gray-700">Date</th>
                <th className="p-3 font-medium text-gray-700">Due Date</th>
                <th className="p-3 font-medium text-gray-700">Total</th>
                <th className="p-3 font-medium text-gray-700">Paid</th>
                <th className="p-3 font-medium text-gray-700">Balance</th>
                <th className="p-3 font-medium text-gray-700">Status</th>
                <th className="p-3 font-medium text-gray-700">Project</th>
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
                    <td className="p-3">{b.billNumber ?? '—'}</td>
                    <td className="p-3">{formatDate(b.billDate)}</td>
                    <td className="p-3">{formatDate(b.dueDate)}</td>
                    <td className="p-3">{formatCurrency(b.totalAmount)}</td>
                    <td className="p-3">{formatCurrency(b.paidAmount)}</td>
                    <td className="p-3">{formatCurrency(balance(b))}</td>
                    <td className="p-3"><StatusBadge status={b.status} /></td>
                    <td className="p-3">{b.project?.name ?? '—'}</td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => setPaymentBill(b)}>Record Payment</Button>
                    </td>
                  </tr>
                  {expandedId === b.id && b.payments?.length > 0 && (
                    <tr key={`${b.id}-exp`} className="bg-gray-50">
                      <td colSpan={11} className="p-4 pl-12">
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
          <BillForm bill={editingBill} onSave={handleSaveBill} onClose={() => { setShowForm(false); setEditingBill(null); }} />
        </div>
      )}
      {paymentBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <BillPaymentForm bill={paymentBill} onSave={(payload) => handleRecordPayment(paymentBill.id, payload)} onClose={() => setPaymentBill(null)} />
        </div>
      )}
    </PageWrapper>
  );
}
