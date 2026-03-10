import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Button } from '../../components/ui/button.jsx';
import { StatusBadge } from '../../components/shared/StatusBadge.jsx';
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
} from 'lucide-react';
import { PaymentStages } from '../payments/PaymentStages.jsx';
import { LabourList } from '../labour/LabourList.jsx';
import { ProjectMaterialsTab } from '../materials/ProjectMaterialsTab.jsx';
import { ProjectAssociatesTab } from '../associates/ProjectAssociatesTab.jsx';
import { ProjectBillsTab } from '../bills/ProjectBillsTab.jsx';
import { ProjectExpensesTab } from '../expenses/ProjectExpensesTab.jsx';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'stages', label: 'Payment Stages', icon: Layers },
  { id: 'labour', label: 'Labour', icon: Users },
  { id: 'materials', label: 'Materials', icon: Package },
  { id: 'associates', label: 'Associates', icon: Handshake },
  { id: 'bills', label: 'Bills', icon: FileText },
  { id: 'expenses', label: 'Other Expenses', icon: Receipt },
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

  if (loading) return <PageWrapper title="Project"><p className="text-gray-500">Loading…</p></PageWrapper>;
  if (error || !project) return <PageWrapper title="Project"><p className="text-red-600">{error || 'Project not found'}</p></PageWrapper>;

  return (
    <PageWrapper>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
          <p className="text-gray-600">{project.client?.name} · {project.branch?.name}</p>
          <StatusBadge status={project.status} className="mt-2" />
        </div>
        <Link to={`/projects/${id}/edit`}>
          <Button variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab project={project} summary={summary} />
        )}
        {activeTab === 'stages' && <PaymentStages projectId={id} onDataChange={load} />}
        {activeTab === 'labour' && <LabourList projectId={id} onDataChange={load} />}
        {activeTab === 'materials' && <ProjectMaterialsTab projectId={id} onDataChange={load} />}
        {activeTab === 'associates' && <ProjectAssociatesTab projectId={id} onDataChange={load} />}
        {activeTab === 'bills' && <ProjectBillsTab projectId={id} onDataChange={load} />}
        {activeTab === 'expenses' && <ProjectExpensesTab projectId={id} onDataChange={load} />}
      </div>
    </PageWrapper>
  );
}

function OverviewTab({ project, summary }) {
  if (!summary) return <p className="text-gray-500">Loading summary…</p>;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Contract Value" value={formatCurrency(summary.totalContractValue)} />
        <StatCard label="Total Received" value={formatCurrency(summary.totalReceived)} />
        <StatCard label="Outstanding" value={formatCurrency(summary.totalOutstanding)} />
        <StatCard label="Total Expenses" value={formatCurrency(summary.totalExpenses)} />
        <StatCard
          label="Est. Profit"
          value={formatCurrency(summary.estimatedProfit)}
          valueClassName={summary.estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <StatCard label="Profit Margin" value={`${summary.profitMargin?.toFixed(1) ?? 0}%`} />
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-medium text-gray-700">Breakdown</h3>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          <li>Labour: {formatCurrency(summary.totalLabourCost)}</li>
          <li>Materials: {formatCurrency(summary.totalMaterialCost)}</li>
          <li>Associates: {formatCurrency(summary.totalAssociateCost)}</li>
          <li>Bills payable: {formatCurrency(summary.totalBillsPayable)}</li>
          <li>Other expenses: {formatCurrency(summary.totalOtherExpenses)}</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, valueClassName = '' }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={cn('mt-1 text-lg font-semibold text-gray-900', valueClassName)}>{value}</p>
    </div>
  );
}

function TabPlaceholder({ title }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <p className="text-gray-600">{title} content will be built in the next steps.</p>
    </div>
  );
}
