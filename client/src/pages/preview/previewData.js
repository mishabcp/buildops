import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Users,
  Wallet,
} from 'lucide-react';

/**
 * Shared data + config for the Dashboard design-preview gallery.
 *
 * Designs receive a normalized `data` object with the same shape the real
 * dashboard API returns. SAMPLE_DASHBOARD is used as a fallback so each design
 * always renders even without a backend.
 */

export const SAMPLE_DASHBOARD = {
  activeProjects: 6,
  totalReceivedThisMonth: 45410000,
  totalOutstandingFromClients: 74090000,
  totalPendingToVendors: 1170000,
  totalPendingToLabour: 349200,
  totalPendingToAssociates: 2880000,
  lowStockMaterials: [
    { id: 1, name: 'Portland Cement', currentStock: 35, minThreshold: 120, unit: 'bags' },
    { id: 2, name: 'TMT Steel 12mm', currentStock: 4, minThreshold: 20, unit: 'tonnes' },
    { id: 3, name: 'River Sand', currentStock: 8, minThreshold: 30, unit: 'units' },
  ],
  recentProjects: [
    { id: 101, name: 'Skyline Residency — Tower B', client: { name: 'Mehta Constructions' }, branch: { name: 'Pune' }, status: 'ACTIVE', contractValue: 6300000 },
    { id: 102, name: 'Coastal Villa Renovation', client: { name: 'Anand Group' }, branch: { name: 'Mumbai' }, status: 'ON_HOLD', contractValue: 2150000 },
    { id: 103, name: 'TechPark Phase 2', client: { name: 'Innovate Realty' }, branch: { name: 'Pune' }, status: 'ENQUIRY', contractValue: 18900000 },
    { id: 104, name: 'Lakeview Apartments', client: { name: 'Greenfield Devs' }, branch: { name: 'Nashik' }, status: 'COMPLETED', contractValue: 9450000 },
    { id: 105, name: 'Metro Mall Fit-out', client: { name: 'Urban Spaces' }, branch: { name: 'Mumbai' }, status: 'ACTIVE', contractValue: 12750000 },
  ],
  collectionsByMonth: [
    { label: 'Jan', received: 3200000 },
    { label: 'Feb', received: 4100000 },
    { label: 'Mar', received: 2800000 },
    { label: 'Apr', received: 5200000 },
    { label: 'May', received: 3900000 },
    { label: 'Jun', received: 4541000 },
  ],
  projectStatusCounts: [
    { status: 'ACTIVE', count: 6 },
    { status: 'ENQUIRY', count: 2 },
    { status: 'ON_HOLD', count: 1 },
    { status: 'COMPLETED', count: 4 },
  ],
  pendingBreakdown: [
    { name: 'Vendors', value: 1170000 },
    { name: 'Labour', value: 349200 },
    { name: 'Associates', value: 2880000 },
  ],
  expenseBreakdown: [
    { name: 'Materials', value: 5400000 },
    { name: 'Labour', value: 2300000 },
    { name: 'Associates', value: 1800000 },
    { name: 'Misc', value: 650000 },
  ],
};

/** Merge API data over the sample so designs always have complete content. */
export function normalizeDashboard(apiData) {
  if (!apiData) return SAMPLE_DASHBOARD;
  return {
    ...SAMPLE_DASHBOARD,
    ...apiData,
    lowStockMaterials: apiData.lowStockMaterials?.length ? apiData.lowStockMaterials : SAMPLE_DASHBOARD.lowStockMaterials,
    recentProjects: apiData.recentProjects?.length ? apiData.recentProjects : SAMPLE_DASHBOARD.recentProjects,
    collectionsByMonth: apiData.collectionsByMonth?.length ? apiData.collectionsByMonth : SAMPLE_DASHBOARD.collectionsByMonth,
    projectStatusCounts: apiData.projectStatusCounts?.length ? apiData.projectStatusCounts : SAMPLE_DASHBOARD.projectStatusCounts,
    pendingBreakdown: apiData.pendingBreakdown?.length ? apiData.pendingBreakdown : SAMPLE_DASHBOARD.pendingBreakdown,
    expenseBreakdown: apiData.expenseBreakdown?.length ? apiData.expenseBreakdown : SAMPLE_DASHBOARD.expenseBreakdown,
  };
}

/** KPI cards shown in every design. `money` flags currency formatting. */
export const KPIS = [
  { key: 'activeProjects', label: 'Active Projects', icon: LayoutDashboard, money: false, tone: 'brand' },
  { key: 'totalReceivedThisMonth', label: 'Received This Month', icon: TrendingUp, money: true, tone: 'emerald' },
  { key: 'totalOutstandingFromClients', label: 'Outstanding (Clients)', icon: FileText, money: true, tone: 'accent' },
  { key: 'totalPendingToVendors', label: 'Pending to Vendors', icon: Wallet, money: true, tone: 'rose' },
  { key: 'totalPendingToLabour', label: 'Pending to Labour', icon: Users, money: true, tone: 'amber' },
  { key: 'totalPendingToAssociates', label: 'Pending to Associates', icon: Users, money: true, tone: 'brand' },
];

export const TONE = {
  brand: { text: 'text-brand-700', bg: 'bg-brand-50', ring: 'ring-brand-200', dot: 'bg-brand-500', solid: 'bg-brand-600', hex: '#1f5288' },
  accent: { text: 'text-accent-600', bg: 'bg-accent-50', ring: 'ring-accent-200', dot: 'bg-accent-500', solid: 'bg-accent-500', hex: '#ff7a00' },
  emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', dot: 'bg-emerald-500', solid: 'bg-emerald-600', hex: '#059669' },
  rose: { text: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200', dot: 'bg-rose-500', solid: 'bg-rose-600', hex: '#e11d48' },
  amber: { text: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', dot: 'bg-amber-500', solid: 'bg-amber-600', hex: '#d97706' },
};

export const STATUS_COLORS = {
  ACTIVE: { text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  ENQUIRY: { text: 'text-brand-700', bg: 'bg-brand-50', dot: 'bg-brand-500' },
  ON_HOLD: { text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  COMPLETED: { text: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  CANCELLED: { text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
};
