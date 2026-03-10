import { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { TableSkeleton } from '../../components/shared/TableSkeleton.jsx';
import { Button } from '../../components/ui/button.jsx';
import { getMaterials, createMaterial, updateMaterial } from '../../api/materials.api.js';
import { MaterialForm } from './MaterialForm.jsx';
import { Plus, Pencil } from 'lucide-react';

export function MaterialList() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await getMaterials();
      if (res?.success && res?.data) setMaterials(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(payload) {
    if (editing) {
      const res = await updateMaterial(editing.id, { name: editing.name, unit: payload.unit, minThreshold: payload.minThreshold });
      if (res?.success && res?.data) {
        setMaterials((prev) => prev.map((m) => (m.id === editing.id ? res.data : m)));
        setShowForm(false);
        setEditing(null);
      } else throw new Error(res?.error);
    } else {
      const res = await createMaterial(payload);
      if (res?.success && res?.data) {
        setMaterials((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
        setShowForm(false);
      } else throw new Error(res?.error);
    }
  }

  const isLowStock = (m) => {
    const stock = Number(m.currentStock) || 0;
    const threshold = Number(m.minThreshold) || 0;
    return threshold > 0 && stock < threshold;
  };

  if (loading) return <PageWrapper title="Materials"><TableSkeleton rows={6} cols={5} /></PageWrapper>;

  return (
    <PageWrapper title="Materials Stock">
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="mb-6 flex justify-end">
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="border-b border-gray-200 text-left">
              <th className="p-3 font-medium text-gray-700">Name</th>
              <th className="p-3 font-medium text-gray-700">Unit</th>
              <th className="p-3 font-medium text-gray-700">Current Stock</th>
              <th className="p-3 font-medium text-gray-700">Min Threshold</th>
              <th className="p-3 font-medium text-gray-700">Status</th>
              <th className="p-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, i) => (
              <tr key={m.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3 text-gray-600">{m.unit}</td>
                <td className="p-3">{Number(m.currentStock)}</td>
                <td className="p-3">{Number(m.minThreshold)}</td>
                <td className="p-3">
                  <span className={isLowStock(m) ? 'text-amber-600 font-medium' : 'text-gray-600'}>
                    {isLowStock(m) ? 'Low Stock' : 'OK'}
                  </span>
                </td>
                <td className="p-3">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(m); setShowForm(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {materials.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No materials yet.</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>Add Material</Button>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <MaterialForm
            material={editing}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}
    </PageWrapper>
  );
}
