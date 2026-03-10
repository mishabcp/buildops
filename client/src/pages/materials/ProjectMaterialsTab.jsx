import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { getProjectMaterials, createMaterialItem, deleteMaterialItem } from '../../api/materials.api.js';
import { getMaterials } from '../../api/materials.api.js';
import { MaterialItemForm } from './MaterialItemForm.jsx';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { authStore } from '../../store/authStore.js';

export function ProjectMaterialsTab({ projectId, onDataChange }) {
  const user = authStore((s) => s.user);
  const isStaff = user?.role === 'STAFF';

  const [items, setItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subTab, setSubTab] = useState('purchases');
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showUsageForm, setShowUsageForm] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadItems();
      loadMaterials();
    }
  }, [projectId]);

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const res = await getProjectMaterials(projectId);
      if (res?.success && res?.data) setItems(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function loadMaterials() {
    try {
      const res = await getMaterials();
      if (res?.success && res?.data) setMaterials(res.data);
    } catch (_) {}
  }

  async function handleAddItem(payload) {
    const res = await createMaterialItem(projectId, payload);
    if (res?.success && res?.data) {
      setItems((prev) => [res.data, ...prev]);
      setShowPurchaseForm(false);
      setShowUsageForm(false);
      loadMaterials();
      onDataChange?.();
    } else throw new Error(res?.error);
  }

  async function handleDelete(item) {
    if (!window.confirm('Remove this entry? Stock will be adjusted.')) return;
    try {
      const res = await deleteMaterialItem(item.id);
      if (res?.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        loadMaterials();
        onDataChange?.();
      } else setError(res?.error ?? 'Failed to delete');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to delete');
    }
  }

  const purchases = items.filter((i) => i.type === 'PURCHASE');
  const usage = items.filter((i) => i.type === 'USAGE');
  const totalCost = purchases.reduce((s, i) => s + (Number(i.totalCost) || 0), 0);

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setSubTab('purchases')}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium',
              subTab === 'purchases' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Purchases
          </button>
          <button
            type="button"
            onClick={() => setSubTab('usage')}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium',
              subTab === 'usage' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Usage
          </button>
        </div>
        <p className="text-sm text-gray-600">Total cost (purchases): <span className="font-medium">{formatCurrency(totalCost)}</span></p>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowPurchaseForm(true)} disabled={isStaff} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Purchase
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowUsageForm(true)} disabled={isStaff} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Usage
          </Button>
        </div>
      </div>

      {subTab === 'purchases' && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200 text-left">
                <th className="p-3 font-medium text-gray-700">Date</th>
                <th className="p-3 font-medium text-gray-700">Material</th>
                <th className="p-3 font-medium text-gray-700">Qty</th>
                <th className="p-3 font-medium text-gray-700">Rate</th>
                <th className="p-3 font-medium text-gray-700">Total</th>
                <th className="p-3 font-medium text-gray-700">Supplier</th>
                {!isStaff && <th className="p-3 font-medium text-gray-700">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-gray-500">No purchases yet.</td></tr>
              ) : (
                purchases.map((i) => (
                  <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">{formatDate(i.date)}</td>
                    <td className="p-3">{i.material?.name}</td>
                    <td className="p-3">{Number(i.quantity)} {i.material?.unit}</td>
                    <td className="p-3">{formatCurrency(i.ratePerUnit)}</td>
                    <td className="p-3">{formatCurrency(i.totalCost)}</td>
                    <td className="p-3">{i.supplierName ?? '—'}</td>
                    {!isStaff && (
                      <td className="p-3">
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(i)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'usage' && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200 text-left">
                <th className="p-3 font-medium text-gray-700">Date</th>
                <th className="p-3 font-medium text-gray-700">Material</th>
                <th className="p-3 font-medium text-gray-700">Quantity</th>
                {!isStaff && <th className="p-3 font-medium text-gray-700">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {usage.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-gray-500">No usage entries yet.</td></tr>
              ) : (
                usage.map((i) => (
                  <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">{formatDate(i.date)}</td>
                    <td className="p-3">{i.material?.name}</td>
                    <td className="p-3">{Number(i.quantity)} {i.material?.unit}</td>
                    {!isStaff && (
                      <td className="p-3">
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(i)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showPurchaseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <MaterialItemForm type="PURCHASE" materials={materials} onSave={handleAddItem} onClose={() => setShowPurchaseForm(false)} />
        </div>
      )}
      {showUsageForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <MaterialItemForm type="USAGE" materials={materials} onSave={handleAddItem} onClose={() => setShowUsageForm(false)} />
        </div>
      )}
    </div>
  );
}
