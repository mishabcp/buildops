import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { getClients } from '../../api/clients.api.js';
import { getBranches } from '../../api/branches.api.js';
import { getProject, createProject, updateProject } from '../../api/projects.api.js';
import { authStore } from '../../store/authStore.js';
import { toastStore } from '../../store/toastStore.js';
import { cn } from '../../lib/utils.js';
import {
  FolderOpen,
  Building2,
  MapPin,
  CircleDashed,
  WalletCards,
  Calendar,
  AlignLeft,
  ChevronLeft,
  Search,
  CheckCircle2,
  Info
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ENQUIRY', label: 'Enquiry', color: 'text-blue-600' },
  { value: 'ACTIVE', label: 'Active', color: 'text-emerald-600' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'text-amber-600' },
  { value: 'COMPLETED', label: 'Completed', color: 'text-slate-600' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'text-red-600' },
];

export function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = authStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const isEdit = id && id !== 'new';
  const [loading, setLoading] = useState(!!isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    clientId: '',
    branchId: user?.branchId ?? '',
    location: '',
    status: 'ENQUIRY',
    contractValue: '',
    startDate: '',
    estimatedEndDate: '',
    description: '',
  });

  // Handle clicking outside the client search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadClients();
    if (isSuperAdmin) loadBranches();
    else if (user?.branchId) setBranches([{ id: user.branchId, name: user.branch?.name ?? 'Your branch' }]);
    if (isEdit) loadProject();
  }, [isEdit, id, isSuperAdmin]);

  async function loadClients() {
    try {
      const res = await getClients();
      if (res?.success && res?.data) setClients(res.data);
    } catch (_) {}
  }

  async function loadBranches() {
    try {
      const res = await getBranches();
      if (res?.success && res?.data) setBranches(res.data);
    } catch (_) {}
  }

  async function loadProject() {
    setLoading(true);
    setError('');
    try {
      const res = await getProject(id);
      if (res?.success && res?.data) {
        const p = res.data;
        setForm({
          name: p.name ?? '',
          clientId: String(p.clientId ?? ''),
          branchId: String(p.branchId ?? ''),
          location: p.location ?? '',
          status: p.status ?? 'ENQUIRY',
          contractValue: p.contractValue != null ? String(p.contractValue) : '',
          startDate: p.startDate ? p.startDate.slice(0, 10) : '',
          estimatedEndDate: p.estimatedEndDate ? p.estimatedEndDate.slice(0, 10) : '',
          description: p.description ?? '',
        });
        setClientSearch(p.client?.name ?? '');
      } else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = clientSearch.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase())) ||
          (c.phone && c.phone.includes(clientSearch))
      )
    : clients;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        clientId: Number(form.clientId),
        branchId: Number(form.branchId),
        location: form.location.trim() || null,
        status: form.status,
        contractValue: form.contractValue ? Number(form.contractValue) : 0,
        startDate: form.startDate || null,
        estimatedEndDate: form.estimatedEndDate || null,
        description: form.description.trim() || null,
      };
      if (isEdit) {
        const res = await updateProject(id, payload);
        if (res?.success && res?.data) {
          toastStore.getState().success('Project updated');
          navigate(`/projects/${id}`);
        } else {
          setError(res?.error ?? 'Failed to update');
        }
      } else {
        const res = await createProject(payload);
        if (res?.success && res?.data) {
          toastStore.getState().success('Project created');
          navigate(`/projects/${res.data.id}`);
        } else {
          setError(res?.error ?? 'Failed to create');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error ?? err.message ?? 'Failed to save';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
     return (
       <PageWrapper>
         <div className="animate-pulse max-w-4xl mx-auto space-y-6">
           <h1 className="text-2xl font-bold tracking-tight text-slate-900">{isEdit ? 'Edit Project' : 'New Project'}</h1>
           <div className="h-10 bg-slate-100 rounded-xl w-32" />
           <div className="h-[600px] bg-slate-100 rounded-3xl w-full" />
         </div>
       </PageWrapper>
     );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">{isEdit ? 'Edit Project Details' : 'Start a New Project'}</h1>
        
        {/* Navigation / Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 group-hover:bg-slate-50 group-hover:border-slate-300 transition-all">
               <ChevronLeft className="h-4 w-4" />
            </div>
            Back to previous page
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm flex items-start gap-3">
             <Info className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-xl shadow-slate-200/20 overflow-visible relative">
           
           {/* Section Header */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-5 sm:px-8 py-5 sm:py-6 rounded-t-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
             <div className="relative flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white border border-slate-200 shadow-sm text-blue-600">
                   {isEdit ? <FolderOpen className="h-6 w-6" /> : <FolderOpen className="h-6 w-6" />}
                </div>
                <div>
                   <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                     {isEdit ? 'Project Configuration' : 'Project Setup'}
                   </h2>
                   <p className="text-sm font-medium text-slate-500 mt-1">
                     {isEdit ? 'Update core parameters and assignment details.' : 'Define parameters to initialize this project.'}
                   </p>
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Left Column: Core Identity */}
              <div className="space-y-6">
                <div>
                   <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Identity & Assignment</h3>
                </div>
                
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Project Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      value={form.name} 
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
                      className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                      placeholder="e.g. Skyline Renovation Phase 1"
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2 relative" ref={dropdownRef}>
                  <label className="text-sm font-bold text-slate-700">Client / Organization <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search to assign client..."
                      className={cn(
                        "pl-10 h-12 rounded-xl border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all",
                        form.clientId ? "bg-white border-blue-200 ring-4 ring-blue-500/5" : "bg-slate-50"
                      )}
                      value={form.clientId && !showClientDropdown ? (clients.find((c) => c.id === Number(form.clientId))?.name ?? clientSearch) : clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setShowClientDropdown(true);
                        if (!e.target.value) setForm((f) => ({ ...f, clientId: '' }));
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                    />
                     {form.clientId && !showClientDropdown && (
                        <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                     )}
                  </div>
                  
                  {/* Custom Client Dropdown */}
                  {showClientDropdown && (clientSearch.trim() || !form.clientId) && (
                    <div className="absolute z-10 mt-2 w-full max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 py-2">
                       {filteredClients.length === 0 ? (
                         <div className="px-4 py-3 text-sm text-slate-500 text-center font-medium">No clients found matching search.</div>
                       ) : (
                         <ul className="space-y-1 px-2">
                            {filteredClients.slice(0, 20).map((c) => (
                              <li
                                key={c.id}
                                className={cn(
                                  "cursor-pointer px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3",
                                  form.clientId === String(c.id) ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-slate-50 text-slate-700 font-medium"
                                )}
                                onClick={() => {
                                  setForm((f) => ({ ...f, clientId: String(c.id) }));
                                  setClientSearch(c.name);
                                  setShowClientDropdown(false);
                                }}
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold shrink-0 border border-slate-200">
                                   {c.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate">
                                   <div className="truncate">{c.name}</div>
                                   {c.phone && <div className="text-xs text-slate-400 font-normal">{c.phone}</div>}
                                </div>
                              </li>
                            ))}
                         </ul>
                       )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Assigned Branch <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select
                      className="w-full h-12 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2 text-[15px] font-medium text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      value={form.branchId}
                      onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                      required
                      disabled={!isSuperAdmin && !!user?.branchId}
                    >
                      <option value="">— Select branch —</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      value={form.location} 
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} 
                      className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                      placeholder="Physical site location"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Details & Financials */}
              <div className="space-y-6">
                <div>
                   <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Financials & Timeline</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 relative col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">Contract Value (₹) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <WalletCards className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        value={form.contractValue} 
                        onChange={(e) => setForm((f) => ({ ...f, contractValue: e.target.value }))} 
                        className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-mono text-[16px] transition-all"
                        placeholder="0.00"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2 relative col-span-2 sm:col-span-1">
                    <label className="text-sm font-bold text-slate-700">Current Status</label>
                    <div className="relative">
                      <CircleDashed className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <select
                        className="w-full h-12 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2 text-[15px] font-semibold text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value} className={o.color}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-700">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                      <Input 
                        type="date" 
                        value={form.startDate} 
                        onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} 
                        className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-700">Est. Completion</label>
                    <div className="relative">
                       {/* Input type="date" handles its own calendar icon in some browsers, but we keep styling consistent */}
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                      <Input 
                        type="date" 
                        value={form.estimatedEndDate} 
                        onChange={(e) => setForm((f) => ({ ...f, estimatedEndDate: e.target.value }))} 
                        className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 h-full">
                  <label className="text-sm font-bold text-slate-700">Additional Notes</label>
                  <textarea
                    className="flex min-h-[140px] w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-4 py-3 text-[15px] font-medium transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-y"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Enter project scope or any internal notes here..."
                  />
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="h-12 px-6 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 w-full sm:w-auto"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="h-12 px-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all font-bold hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto"
              >
                {saving ? 'Processing…' : isEdit ? 'Save Changes' : 'Initialize Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
