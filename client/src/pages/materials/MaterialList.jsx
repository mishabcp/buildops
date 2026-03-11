import { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { TableSkeleton } from '../../components/shared/TableSkeleton.jsx';
import { Button } from '../../components/ui/button.jsx';
import { getMaterials, createMaterial, updateMaterial } from '../../api/materials.api.js';
import { MaterialForm } from './MaterialForm.jsx';
import { Plus, Pencil, PackageOpen, AlertTriangle, Search, Boxes } from 'lucide-react';
import { cn } from '../../lib/utils.js';

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

  if (loading) return <PageWrapper title="Materials Directory"><TableSkeleton rows={6} cols={6} /></PageWrapper>;

  return (
    <PageWrapper title="Materials Directory">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Top Banner and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
             <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                 <Boxes className="h-5 w-5" />
             </div>
             <div>
                <p className="text-sm font-bold text-slate-900 leading-none">Master Inventory</p>
                <p className="text-[12px] font-medium text-slate-500 mt-1">Configure global material catalog</p>
             </div>
         </div>
         <Button 
            onClick={() => { setEditing(null); setShowForm(true); }} 
            className="h-11 px-6 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 font-bold transition-all hover:-translate-y-0.5"
         >
            <Plus className="h-4 w-4" />
            Add New Material
         </Button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
        {materials.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center flex flex-col items-center justify-center">
            <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-5 border border-slate-100">
              <PackageOpen className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Materials Configured</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-6">Create global material definitions to track stock and requisition supplies.</p>
            <Button 
              className="h-11 px-6 rounded-xl font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Configure First Item
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 sticky top-0">
                  <tr>
                    <th className="px-5 py-4 font-bold text-[11px] uppercase tracking-widest">Material Name</th>
                    <th className="px-5 py-4 font-bold text-[11px] uppercase tracking-widest text-center">Unit of Measure</th>
                    <th className="px-5 py-4 font-bold text-[11px] uppercase tracking-widest text-center">Current Total Stock</th>
                    <th className="px-5 py-4 font-bold text-[11px] uppercase tracking-widest text-center">Min Threshold</th>
                    <th className="px-5 py-4 font-bold text-[11px] uppercase tracking-widest text-center">Status</th>
                    <th className="px-5 py-4 font-bold text-[11px] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {materials.map((m, i) => {
                    const low = isLowStock(m);
                    return (
                      <tr key={m.id} className={cn("group transition-colors hover:bg-slate-50/70", i % 2 === 1 && "bg-slate-50/30")}>
                        <td className="px-5 py-4 font-bold text-slate-900 text-[15px]">{m.name}</td>
                        <td className="px-5 py-4 text-center text-slate-500 font-medium">
                           <span className="bg-slate-100 px-2 py-1 rounded-md text-[12px] font-bold text-slate-600 border border-slate-200">
                              {m.unit}
                           </span>
                        </td>
                        <td className="px-5 py-4 text-center font-bold font-mono tracking-tight text-[15px]">{Number(m.currentStock).toLocaleString()}</td>
                        <td className="px-5 py-4 text-center font-bold font-mono tracking-tight text-[15px] text-slate-500">{Number(m.minThreshold).toLocaleString()}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={cn(
                             "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold tracking-wide border",
                             low ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          )}>
                            {low ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
                            {low ? 'Critical Low' : 'Optimal'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => { setEditing(m); setShowForm(true); }}
                            className="h-9 w-9 p-0 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border hover:border-blue-200"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => { setShowForm(false); setEditing(null); }} />
           <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-md">
              <MaterialForm
                material={editing}
                onSave={handleSave}
                onClose={() => { setShowForm(false); setEditing(null); }}
              />
           </div>
        </div>
      )}
    </PageWrapper>
  );
}
