import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getProjects } from '../../api/projects.api.js';
import { getBranches } from '../../api/branches.api.js';
import { authStore } from '../../store/authStore.js';
import { TableSkeleton } from '../../components/shared/TableSkeleton.jsx';
import { Plus, Search, Filter, AlertTriangle, ArrowRight, GitBranch } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200/80',
  ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-200/60',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200/60',
  ENQUIRY: 'bg-brand-50 text-brand-700 border-brand-200/60',
};

export function ProjectList() {
  const user = authStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [projects, setProjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProjects();
    if (isSuperAdmin) loadBranches();
  }, [branchId, status, search, isSuperAdmin]);

  async function loadBranches() {
    try {
      const res = await getBranches();
      if (res?.success && res?.data) setBranches(res.data);
    } catch (_) {}
  }

  async function loadProjects() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (branchId) params.branchId = branchId;
      if (status) params.status = status;
      if (search.trim()) params.search = search.trim();
      const res = await getProjects(params);
      if (res?.success && res?.data) setProjects(res.data);
      else setError(res?.error ?? 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Projects Directory</h1>
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* ── Header & Filters ── */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:max-w-md group">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
              <Input
                placeholder="Search projects or clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-white border-slate-200/80 shadow-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all rounded-xl w-full text-[15px] font-medium"
              />
            </div>
            
            <div className="flex w-full sm:w-auto items-center gap-3">
              <div className="relative group flex-1 sm:flex-none">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-brand-500">
                  <Filter className="h-4 w-4" />
                </div>
                <select
                  className="w-full sm:w-auto appearance-none h-11 rounded-xl border border-slate-200/80 bg-white pl-9 pr-10 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 hover:border-slate-300 cursor-pointer"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="ENQUIRY">Enquiry</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {isSuperAdmin && (
                <div className="relative group flex-1 sm:flex-none">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-brand-500">
                    <GitBranch className="h-4 w-4" />
                  </div>
                  <select
                    className="w-full sm:w-auto appearance-none h-11 rounded-xl border border-slate-200/80 bg-white pl-9 pr-10 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 hover:border-slate-300 cursor-pointer"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <Link to="/projects/new" className="hidden md:block">
            <Button className="h-11 px-6 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/30 font-semibold">
              <Plus className="h-4 w-4" />
              Start Project
            </Button>
          </Link>
          
          {/* Mobile floating action button */}
          <Link to="/projects/new" className="md:hidden fixed bottom-6 right-6 z-50">
             <Button size="icon" className="h-14 w-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-900/30 transition-all hover:-translate-y-1">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>

        {/* ── Data Display ── */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
          {loading ? (
             <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm">
                <TableSkeleton rows={8} cols={isSuperAdmin ? 8 : 7} />
             </div>
          ) : projects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 mb-6">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">No projects found</h3>
              <p className="mt-2 text-base text-slate-500 max-w-sm mx-auto">
                {search || status || branchId 
                  ? "We couldn't find any projects matching your current filters. Try adjusting them." 
                  : "You don't have any projects yet. Start by creating your first one."}
              </p>
              {!(search || status || branchId) && (
                <Link to="/projects/new" className="mt-8 inline-block">
                  <Button className="h-12 px-6 rounded-xl gap-2 font-semibold shadow-md min-w-[160px]">
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80 text-left">
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Project Details</th>
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Client</th>
                      {isSuperAdmin && <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Branch</th>}
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Contract Value</th>
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Received</th>
                      <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Balance</th>
                      <th className="py-4 px-5 w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {projects.map((p) => (
                      <tr key={p.id} className="group transition-colors hover:bg-slate-50/70 border-b border-slate-50 last:border-0">
                        <td className="py-4 px-5">
                          <Link to={`/projects/${p.id}`} className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-[15px]">
                            {p.name}
                          </Link>
                        </td>
                        <td className="py-4 px-5 font-medium text-slate-500">{p.client?.name ?? '—'}</td>
                        {isSuperAdmin && (
                          <td className="py-4 px-5">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                               {p.branch?.name ?? '—'}
                            </span>
                          </td>
                        )}
                        <td className="py-4 px-5">
                          <span className={cn(
                              'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border',
                              STATUS_STYLES[p.status] ?? 'bg-slate-100 text-slate-600 border-slate-200/80'
                            )}
                          >
                            {p.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                           <span className="font-bold text-slate-700 font-mono tracking-tight text-[15px]">
                              {formatCurrency(p.contractValue)}
                           </span>
                        </td>
                        <td className="py-4 px-5 text-right font-medium text-slate-500 font-mono tracking-tight text-[14px]">
                          {formatCurrency(p.totalReceived)}
                        </td>
                        <td className="py-4 px-5 text-right">
                           <span className={cn(
                             "font-bold font-mono tracking-tight text-[15px]",
                             p.balance > 0 ? "text-orange-600" : "text-emerald-600"
                           )}>
                              {formatCurrency(p.balance)}
                           </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Link 
                            to={`/projects/${p.id}`}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-brand-600 hover:shadow-sm ring-1 ring-slate-200/0 hover:ring-slate-200"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-slate-100">
                {projects.map((p) => (
                  <Link key={p.id} to={`/projects/${p.id}`} className="block p-5 active:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-slate-900 text-base leading-tight pr-4">{p.name}</h4>
                       <span className={cn('shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border', STATUS_STYLES[p.status] ?? 'bg-slate-100 text-slate-600 border-slate-200/80')}>
                         {p.status?.replace(/_/g, ' ')}
                       </span>
                    </div>
                    <div className="space-y-2">
                       <p className="text-xs font-semibold text-slate-500 uppercase tracking-tight">{p.client?.name ?? 'Individual Client'}</p>
                       <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-400 font-medium">{isSuperAdmin ? p.branch?.name : 'Global Branch'}</span>
                          <span className="font-mono font-bold text-slate-900">{formatCurrency(p.contractValue)}</span>
                       </div>
                       <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                          <div className="flex flex-col">
                             <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Balance Due</span>
                             <span className={cn("text-sm font-black font-mono", p.balance > 0 ? "text-orange-600" : "text-emerald-600")}>
                                {formatCurrency(p.balance)}
                             </span>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                             <ArrowRight className="h-4 w-4" />
                          </div>
                       </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
