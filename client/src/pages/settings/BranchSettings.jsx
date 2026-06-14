import { useState, useEffect } from 'react';
import { authStore } from '../../store/authStore.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { getBranches, updateBranch } from '../../api/branches.api.js';
import { Building2, Save, X, Pencil, MapPin } from 'lucide-react';

export function BranchSettings() {
  const user = authStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');

  useEffect(() => {
    if (isSuperAdmin) load();
    else setLoading(false);
  }, [isSuperAdmin]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await getBranches();
      if (res?.success && res?.data) setBranches(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(branch) {
    setEditingId(branch.id);
    setEditName(branch.name);
    setEditLocation(branch.location ?? '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditLocation('');
  }

  async function saveEdit() {
    if (editingId == null) return;
    setError('');
    try {
      const res = await updateBranch(editingId, { name: editName.trim(), location: editLocation.trim() || null });
      if (res?.success && res?.data) {
        setBranches((prev) => prev.map((b) => (b.id === editingId ? res.data : b)));
        cancelEdit();
      } else {
        setError(res?.error ?? 'Failed to update');
      }
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to update');
    }
  }

  if (!isSuperAdmin) return null;

  if (loading) {
     return (
       <div className="animate-pulse space-y-4">
         <div className="h-24 bg-slate-100 rounded-2xl w-full" />
         <div className="h-24 bg-slate-100 rounded-2xl w-full" />
         <div className="h-24 bg-slate-100 rounded-2xl w-full" />
       </div>
     )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}
      
      <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 sm:px-8 py-5">
          <div className="flex items-center gap-3">
             <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-100/50 text-brand-600">
                <Building2 className="h-5 w-5" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active Branches</h3>
                <p className="text-sm text-slate-500 font-medium">Manage and organize your company branch locations</p>
             </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="space-y-4">
            {branches.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-500 font-medium">No branches configured.</p>
              </div>
            ) : (
              branches.map((branch) => (
                <div
                  key={branch.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 transition-all hover:shadow-md hover:border-slate-300/80"
                >
                  {editingId === branch.id ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex-1 space-y-3">
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Branch Name (e.g. Headquarters)"
                            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 text-[15px] font-medium rounded-xl transition-all"
                            autoFocus
                          />
                        </div>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            placeholder="Location (Optional)"
                            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-500/10 text-[15px] font-medium rounded-xl transition-all"
                          />
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                        <Button 
                          onClick={saveEdit}
                          className="flex-1 sm:flex-none h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2 font-semibold shadow-md hover:-translate-y-0.5 transition-all"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelEdit}
                          className="flex-1 sm:flex-none h-11 rounded-xl gap-2 font-medium hover:bg-slate-50"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
                           <Building2 className="h-6 w-6 text-slate-400 group-hover:text-brand-500 transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-[16px] font-bold text-slate-900 tracking-tight">{branch.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-slate-500">
                             <MapPin className="h-3.5 w-3.5" />
                             {branch.location || <span className="italic opacity-70">Location not specified</span>}
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        onClick={() => startEdit(branch)}
                        className="h-10 w-10 sm:w-auto shrink-0 rounded-xl px-0 sm:px-4 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors self-end sm:self-center opacity-0 group-hover:opacity-100 sm:opacity-100"
                        title="Edit Branch"
                      >
                        <Pencil className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline font-semibold">Edit</span>
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
