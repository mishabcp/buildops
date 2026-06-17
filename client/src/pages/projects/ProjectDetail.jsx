import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Button } from '../../components/ui/button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getProject, getProjectSummary } from '../../api/projects.api.js';
import { cn } from '../../lib/utils.js';
import {
  Pencil,
  LayoutDashboard,
  Layers,
  Users,
  Package,
  Handshake,
  FileText,
  Receipt,
  Building2,
  MapPin,
  TrendingDown,
  TrendingUp,
  Percent,
  WalletCards,
  BookOpen,
  Camera,
} from 'lucide-react';
import { PaymentStages } from '../payments/PaymentStages.jsx';
import { LabourList } from '../labour/LabourList.jsx';
import { ProjectMaterialsTab } from '../materials/ProjectMaterialsTab.jsx';
import { ProjectAssociatesTab } from '../associates/ProjectAssociatesTab.jsx';
import { ProjectBillsTab } from '../bills/ProjectBillsTab.jsx';
import { ProjectExpensesTab } from '../expenses/ProjectExpensesTab.jsx';
import { ProjectDetailGuide } from './ProjectDetailGuide.jsx';
import { ProjectSiteMediaTab } from './ProjectSiteMediaTab.jsx';

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200/80',
  ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-200/60',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200/60',
  ENQUIRY: 'bg-brand-50 text-brand-700 border-brand-200/60',
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'stages', label: 'Payment Stages', icon: Layers },
  { id: 'labour', label: 'Labour', icon: Users },
  { id: 'materials', label: 'Materials', icon: Package },
  { id: 'associates', label: 'Associates', icon: Handshake },
  { id: 'bills', label: 'Bills', icon: FileText },
  { id: 'expenses', label: 'Other Expenses', icon: Receipt },
  { id: 'media', label: 'Site media', icon: Camera },
  { id: 'guide', label: 'Guide', icon: BookOpen },
];

export function ProjectDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [pRes, sRes] = await Promise.all([getProject(id), getProjectSummary(id)]);
      if (pRes?.success && pRes?.data) setProject(pRes.data);
      else setError(pRes?.error ?? 'Failed to load project');
      if (sRes?.success && sRes?.data) setSummary(sRes.data);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <PageWrapper title="Loading Project...">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-slate-100 rounded-3xl" />
          <div className="h-12 bg-slate-100 rounded-xl max-w-2xl" />
          <div className="h-96 bg-slate-100 rounded-3xl" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !project) {
    return (
      <PageWrapper title="Project Error">
        <div className="rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-12 text-center">
          <h3 className="text-lg font-bold text-red-900">Unable to load project</h3>
          <p className="mt-2 text-red-600 font-medium">{error || 'Project not found'}</p>
          <Link to="/projects">
            <Button className="mt-6 bg-red-600 hover:bg-red-700 text-white rounded-xl">Return to Directory</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ── Premium Header Card ── */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm mb-8">
           {/* Abstract Header Background */}
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
          <div className="absolute -top-12 -right-12 h-64 w-64 bg-brand-50/50 rounded-full blur-3xl" />
          
          <div className="relative p-5 sm:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                 <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border text-xs shadow-sm whitespace-nowrap',
                    STATUS_STYLES[project.status] ?? 'bg-slate-100 text-slate-600 border-slate-200/80'
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 sm:mr-2", 
                    project.status === 'ACTIVE' ? "bg-emerald-500" :
                    project.status === 'ON_HOLD' ? "bg-amber-500" :
                    project.status === 'CANCELLED' ? "bg-red-500" :
                    project.status === 'ENQUIRY' ? "bg-brand-500" : "bg-slate-400"
                  )} />
                  {project.status?.replace(/_/g, ' ')}
                </span>
                <span className="text-[12px] sm:text-sm font-semibold text-slate-400 font-mono">#{String(project.id).slice(0,8).toUpperCase()}</span>
              </div>
              
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                {project.name}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-y-2 gap-x-6 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{project.client?.name ?? 'No Client Assigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{project.branch?.name ?? 'Branch Undefined'}</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0">
               <Link to={`/projects/${id}/edit`} className="w-full sm:w-auto">
                <Button className="h-10 sm:h-11 w-full sm:w-auto px-4 sm:px-5 rounded-xl gap-2 font-semibold shadow-sm border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all hover:shadow-md">
                  <Pencil className="h-4 w-4" />
                  <span className="sm:inline">Edit Details</span>
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Sub Navigation / Settings Bar embedded in card */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-8">
            <nav className="-mb-px flex gap-2 overflow-x-auto hide-scrollbar" aria-label="Tabs">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2.5 whitespace-nowrap border-b-2 px-1 py-4 text-[14px] font-semibold transition-all duration-200 outline-none',
                      isActive
                        ? 'border-brand-600 text-brand-700'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    )}
                  >
                    <tab.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-brand-600" : "text-slate-400")} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* ── Tab Content Area ── */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both min-h-[400px]">
          {activeTab === 'overview' && (
            <OverviewTab project={project} summary={summary} />
          )}
          {activeTab === 'stages' && <PaymentStages projectId={id} onDataChange={load} />}
          {activeTab === 'labour' && <LabourList projectId={id} onDataChange={load} />}
          {activeTab === 'materials' && <ProjectMaterialsTab projectId={id} onDataChange={load} />}
          {activeTab === 'associates' && <ProjectAssociatesTab projectId={id} onDataChange={load} />}
          {activeTab === 'bills' && <ProjectBillsTab projectId={id} onDataChange={load} />}
          {activeTab === 'expenses' && <ProjectExpensesTab projectId={id} onDataChange={load} />}
          {activeTab === 'media' && <ProjectSiteMediaTab projectId={id} />}
          {activeTab === 'guide' && <ProjectDetailGuide />}
        </div>
      </div>
    </PageWrapper>
  );
}

function OverviewTab({ project, summary }) {
  if (!summary) return <div className="text-center py-12 text-slate-500 font-medium">Crunching numbers...</div>;

  const isProfitable = summary.estimatedProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Top Level Financials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard 
          label="Contract Value" 
          value={formatCurrency(summary.totalContractValue)} 
          icon={WalletCards}
          accent="from-slate-400 to-slate-500"
          valueClass="text-slate-900"
        />
        <StatCard 
          label="Total Received" 
          value={formatCurrency(summary.totalReceived)} 
          icon={TrendingUp}
          accent="from-emerald-400 to-teal-500"
          valueClass="text-emerald-700"
        />
        <StatCard 
          label="Outstanding Balance" 
          value={formatCurrency(summary.totalOutstanding)} 
          icon={TrendingDown}
          accent="from-orange-400 to-amber-500"
          valueClass="text-orange-700"
        />
        {summary.totalReceivables > 0 && (
          <StatCard 
            label="Other receivables" 
            value={formatCurrency(summary.totalReceivables)} 
            icon={FileText}
            accent="from-violet-400 to-purple-500"
            valueClass="text-violet-700"
          />
        )}
        <StatCard 
          label="Total income" 
          value={formatCurrency(summary.totalIncome ?? summary.totalContractValue)} 
          icon={WalletCards}
          accent="from-slate-500 to-slate-600"
          valueClass="text-slate-800"
        />
        <StatCard 
          label="Total Operating Expenses" 
          value={formatCurrency(summary.totalExpenses)} 
          icon={Receipt}
          accent="from-rose-400 to-red-500"
          valueClass="text-rose-700"
        />
        <StatCard 
          label="Est. Project Profit" 
          value={formatCurrency(summary.estimatedProfit)} 
          icon={LayoutDashboard}
          accent={isProfitable ? "from-brand-400 to-brand-500" : "from-red-400 to-rose-500"}
          valueClass={isProfitable ? "text-brand-700" : "text-red-700"}
        />
        <StatCard 
          label="Gross Profit Margin" 
          value={`${summary.profitMargin?.toFixed(1) ?? 0}%`} 
          icon={Percent}
          accent={isProfitable ? "from-brand-400 to-violet-500" : "from-slate-300 to-slate-400"}
          valueClass={isProfitable ? "text-brand-700" : "text-slate-500"}
        />
      </div>

      {/* Expense Allocation Breakdown */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden mt-8">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
           <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">Expense Allocation Breakdown</h3>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <BreakdownRow label="Labour Costs" value={summary.totalLabourCost} total={summary.totalExpenses} />
            <BreakdownRow label="Material Cost" value={summary.totalMaterialCost} total={summary.totalExpenses} />
            <BreakdownRow label="Associate Fees" value={summary.totalAssociateCost} total={summary.totalExpenses} />
            <BreakdownRow label="Bills Payable (Vendors)" value={summary.totalBillsPayable} total={summary.totalExpenses} />
            <BreakdownRow label="Other Expenses" value={summary.totalOtherExpenses} total={summary.totalExpenses} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, valueClass }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
       {/* Top accent bar */}
       <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${accent} opacity-80`} />
       
       <div className="flex items-start justify-between">
          <div className="pr-2 sm:pr-4">
             <p className="text-[10px] sm:text-[12px] font-bold uppercase tracking-wider text-slate-500/80 mb-1.5 sm:mb-2">{label}</p>
             <p className={cn('text-lg sm:text-2xl font-black font-sans tracking-tight', valueClass)}>{value}</p>
          </div>
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
       </div>
    </div>
  );
}

function BreakdownRow({ label, value, total }) {
   const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
   
   return (
     <div className="flex flex-col gap-2 relative group">
       <div className="flex items-end justify-between text-sm">
         <span className="font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
         <div className="flex items-center gap-3">
             <span className="font-bold text-slate-900 font-mono text-[15px]">{formatCurrency(value)}</span>
             <span className="text-xs font-semibold text-slate-400 w-12 text-right">{percentage}%</span>
         </div>
       </div>
       {/* Mini Progress Bar */}
       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-slate-300 group-hover:bg-brand-400 transition-colors duration-500 rounded-full" 
            style={{ width: `${percentage}%` }} 
          />
       </div>
     </div>
   )
}
