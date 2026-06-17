import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { getProjectMaterials, createMaterialItem, deleteMaterialItem } from '../../api/materials.api.js';
import { getMaterials } from '../../api/materials.api.js';
import { MaterialItemForm } from './MaterialItemForm.jsx';
import { Plus, Trash2, Package, ShoppingCart, Activity, PackageOpen, Boxes, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { authStore } from '../../store/authStore.js';
import { LinkedMediaPanel } from '../../components/media/LinkedMediaPanel.jsx';

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
    if (!window.confirm('Are you sure you want to remove this entry? Global stock levels will be adjusted accordingly.')) return;
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

  if (loading) {
     return (
       <div className="animate-pulse space-y-4 pt-4">
         <div className="flex gap-4">
            <div className="h-10 w-32 bg-slate-100 rounded-lg" />
            <div className="h-10 w-32 bg-slate-100 rounded-lg" />
         </div>
         <div className="h-64 bg-slate-100 rounded-3xl w-full" />
       </div>
     );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Premium Tab Switcher */}
        <div className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-100/80 p-1 text-slate-500 shadow-inner">
          <button
            type="button"
            onClick={() => setSubTab('purchases')}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-bold ring-offset-white transition-all h-full gap-2',
              subTab === 'purchases' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'hover:text-slate-700 hover:bg-slate-200/50'
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            Purchases
            <span className="ml-1.5 text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{purchases.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('usage')}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-bold ring-offset-white transition-all h-full gap-2',
              subTab === 'usage' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'hover:text-slate-700 hover:bg-slate-200/50'
            )}
          >
            <Activity className="h-4 w-4" />
            Usage Log
            <span className="ml-1.5 text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{usage.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 sm:ml-auto">
          {subTab === 'purchases' && (
             <div className="hidden lg:flex flex-col items-end mr-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Spent</span>
                <span className="font-bold text-slate-900 text-[15px]">{formatCurrency(totalCost)}</span>
             </div>
          )}
          
          <div className="flex gap-2">
            {subTab === 'purchases' ? (
              <Button 
                onClick={() => setShowPurchaseForm(true)} 
                disabled={isStaff} 
                className="hidden sm:flex h-10 px-5 rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/10 font-bold transition-all hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                Add Purchase
              </Button>
            ) : (
              <Button 
                onClick={() => setShowUsageForm(true)} 
                disabled={isStaff} 
                className="hidden sm:flex h-10 px-5 rounded-xl gap-2 bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-900/10 font-bold transition-all hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                Log Usage
              </Button>
            )}
          </div>
        </div>
      </div>

      {subTab === 'purchases' && (
        <div className="animate-in slide-in-from-right-2 duration-300">
          {purchases.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center mt-4">
              <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                 <Package className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Material Purchases</h3>
              <p className="text-slate-500 font-medium max-w-sm mb-6">Record materials bought specifically for this project.</p>
              <Button 
                className="h-11 px-6 rounded-xl font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 shadow-sm"
                onClick={() => setShowPurchaseForm(true)} 
                disabled={isStaff}
              >
                 <Plus className="h-4 w-4 mr-2" />
                 Log First Purchase
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden mt-4">
              {/* Desktop Table View - Only on large screens */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80">
                    <tr className="text-left">
                      <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Date Logged</th>
                      <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Material & Qty</th>
                      <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Rate</th>
                      <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Total Info</th>
                      <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Supplier</th>
                      {!isStaff && <th className="py-4 px-6 w-16"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchases.map((i) => (
                      <tr key={i.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-medium text-slate-600">{formatDate(i.date)}</td>
                        <td className="py-4 px-6">
                           <div className="flex items-center gap-3">
                             <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0">
                               <Boxes className="h-4 w-4 text-orange-600" />
                             </div>
                             <div>
                               <p className="font-bold text-slate-900">{i.material?.name}</p>
                               <p className="text-[12px] font-bold text-slate-500">{Number(i.quantity)} <span className="uppercase">{i.material?.unit}</span></p>
                             </div>
                           </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-700">{formatCurrency(i.ratePerUnit)}</td>
                        <td className="py-4 px-6">
                           <span className="inline-flex items-center font-bold text-slate-900 bg-slate-100/80 px-2 py-1 rounded-lg border border-slate-200/50">
                             {formatCurrency(i.totalCost)}
                           </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-slate-600 font-medium">{i.supplierName ?? '—'}</span>
                        </td>
                        {!isStaff && (
                          <td className="py-4 px-6 text-right">
                             <Button 
                               size="sm" 
                               variant="ghost" 
                               onClick={() => handleDelete(i)} 
                               className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card View - For Tablets and Mobiles */}
              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:gap-px bg-slate-100/40">
                {purchases.map((i) => (
                <div key={i.id} className="p-4 sm:p-5 flex flex-col gap-4 bg-white hover:bg-slate-50/50 transition-colors">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0 shadow-sm">
                        <Boxes className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight truncate">{i.material?.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="truncate">{i.material?.category || 'General'}</span>
                        </div>
                      </div>
                    </div>
                    {!isStaff && (
                      <div className="flex gap-2 shrink-0 ml-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDelete(i)} 
                          className="h-9 w-9 p-0 text-slate-400 border border-slate-100 bg-slate-50 hover:border-red-200 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Material Details Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 border-y border-slate-50 py-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Quantity</span>
                      <span className="text-[12px] sm:text-[14px] font-bold text-slate-700 truncate">{Number(i.quantity)} {i.material?.unit}</span>
                    </div>
                    <div className="flex flex-col border-x border-slate-50 px-2 sm:px-4">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Rate</span>
                      <span className="text-[12px] sm:text-[14px] font-bold text-slate-700 truncate">{formatCurrency(i.ratePerUnit)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] sm:text-[10px] text-brand-600/70 font-black uppercase tracking-widest mb-1">Total Cost</span>
                      <span className="text-[12px] sm:text-[14px] font-black text-brand-600 truncate">
                        {formatCurrency(i.totalCost)}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                       <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Supplier:</span>
                       <span className="text-[11px] font-bold truncate max-w-[120px]">{i.supplierName ?? 'Not stated'}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                       <Calendar className="h-3.5 w-3.5 text-slate-300" />
                       {formatDate(i.date)}
                    </div>
                  </div>
                  <LinkedMediaPanel projectId={projectId} linkType="MATERIAL_ITEM" linkId={i.id} />
                </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'usage' && (
        <div className="animate-in slide-in-from-left-2 duration-300">
           {usage.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center mt-4">
              <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                 <PackageOpen className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Usage Logs</h3>
              <p className="text-slate-500 font-medium max-w-sm mb-6">Track materials withdrawn from inventory for this project.</p>
              <Button 
                className="h-11 px-6 rounded-xl font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/50 shadow-sm"
                onClick={() => setShowUsageForm(true)} 
                disabled={isStaff}
              >
                 <Plus className="h-4 w-4 mr-2" />
                 Log First Usage
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden mt-4">
              {/* Desktop Table View - Only on large screens */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80">
                    <tr className="text-left">
                      <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500 w-48">Date Logged</th>
                      <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Material Consumed</th>
                      <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Quantity Used</th>
                      {!isStaff && <th className="py-4 px-6 w-16"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usage.map((i) => (
                      <tr key={i.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-medium text-slate-600">{formatDate(i.date)}</td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center border border-brand-100 shrink-0">
                                 <Activity className="h-3.5 w-3.5 text-brand-600" />
                               </div>
                               {i.material?.name}
                            </div>
                        </td>
                        <td className="py-4 px-6">
                           <span className="inline-flex items-center font-bold text-brand-800 bg-brand-50 px-3 py-1 rounded-lg border border-brand-100/50">
                             {Number(i.quantity)} <span className="text-[10px] ml-1 uppercase">{i.material?.unit}</span>
                           </span>
                        </td>
                        {!isStaff && (
                          <td className="py-4 px-6 text-right">
                             <Button 
                               size="sm" 
                               variant="ghost" 
                               onClick={() => handleDelete(i)} 
                               className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card View - For Tablets and Mobiles */}
              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:gap-px bg-slate-100/40">
                {usage.map((i) => (
                  <div key={i.id} className="p-4 sm:p-5 flex flex-col gap-4 bg-white hover:bg-slate-50/50 transition-colors">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold shrink-0 shadow-sm">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight truncate">{i.material?.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="truncate">{i.material?.category || 'General'}</span>
                          </div>
                        </div>
                      </div>
                      {!isStaff && (
                        <div className="flex gap-2 shrink-0 ml-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(i)} 
                            className="h-9 w-9 p-0 text-slate-400 border border-slate-100 bg-slate-50 hover:border-red-200 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Usage Details */}
                    <div className="grid grid-cols-2 gap-4 border-y border-slate-50 py-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Quantity Logged</span>
                        <span className="text-[14px] sm:text-[16px] font-bold text-brand-700 truncate leading-none">
                          {Number(i.quantity)} <span className="text-[10px] uppercase opacity-60">{i.material?.unit}</span>
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                         <span className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Status</span>
                         <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-none">Logged</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                         <Calendar className="h-3.5 w-3.5 text-slate-300" />
                         {formatDate(i.date)}
                      </div>
                      <span className="text-[10px] font-mono text-slate-300">#{String(i.id).slice(-6).toUpperCase()}</span>
                    </div>
                    <LinkedMediaPanel projectId={projectId} linkType="MATERIAL_ITEM" linkId={i.id} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Add Button for Mobile */}
      {!isStaff && (
        <Button
          onClick={() => subTab === 'purchases' ? setShowPurchaseForm(true) : setShowUsageForm(true)}
          className={cn(
            "fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full border border-white/20 text-white shadow-2xl transition-all hover:scale-110 active:scale-95 sm:hidden flex items-center justify-center p-0",
            subTab === 'purchases' ? "bg-emerald-600" : "bg-brand-600"
          )}
          aria-label={subTab === 'purchases' ? "Add purchase" : "Log usage"}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {showPurchaseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setShowPurchaseForm(false)} />
          <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-md">
             <MaterialItemForm type="PURCHASE" materials={materials} onSave={handleAddItem} onClose={() => setShowPurchaseForm(false)} />
          </div>
        </div>
      )}
      {showUsageForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setShowUsageForm(false)} />
          <div className="relative animate-in fade-in zoom-in-95 duration-200 w-full max-w-md">
             <MaterialItemForm type="USAGE" materials={materials} onSave={handleAddItem} onClose={() => setShowUsageForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
