import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { PageLoader } from './components/shared/PageLoader.jsx';

const lazyPage = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));

const Login = lazyPage(() => import('./pages/auth/Login.jsx'), 'Login');
const Guide = lazyPage(() => import('./pages/guide/Guide.jsx'), 'Guide');
const GuideDetailed = lazyPage(() => import('./pages/guide/GuideDetailed.jsx'), 'GuideDetailed');
const GuideWorkflow = lazyPage(() => import('./pages/guide/GuideWorkflow.jsx'), 'GuideWorkflow');
const Dashboard = lazyPage(() => import('./pages/dashboard/Dashboard.jsx'), 'Dashboard');
const Settings = lazyPage(() => import('./pages/settings/Settings.jsx'), 'Settings');
const DashboardPreview = lazyPage(() => import('./pages/preview/DashboardPreview.jsx'), 'DashboardPreview');
const ProjectList = lazyPage(() => import('./pages/projects/ProjectList.jsx'), 'ProjectList');
const ProjectForm = lazyPage(() => import('./pages/projects/ProjectForm.jsx'), 'ProjectForm');
const ProjectDetail = lazyPage(() => import('./pages/projects/ProjectDetail.jsx'), 'ProjectDetail');
const MaterialList = lazyPage(() => import('./pages/materials/MaterialList.jsx'), 'MaterialList');
const BillList = lazyPage(() => import('./pages/bills/BillList.jsx'), 'BillList');
const ClientList = lazyPage(() => import('./pages/clients/ClientList.jsx'), 'ClientList');
const Reports = lazyPage(() => import('./pages/reports/Reports.jsx'), 'Reports');

function Placeholder({ name }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
      <p className="mt-2 text-gray-600">Coming soon</p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/guide/detailed" element={<GuideDetailed />} />
      <Route path="/guide/workflow" element={<GuideWorkflow />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects">
          <Route index element={<ProjectList />} />
          <Route path="new" element={<ProjectForm />} />
          <Route path=":id/edit" element={<ProjectForm />} />
          <Route path=":id" element={<ProjectDetail />} />
        </Route>
        <Route path="clients" element={<ClientList />} />
        <Route path="materials" element={<MaterialList />} />
        <Route path="bills" element={<BillList />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="dashboard-preview" element={<DashboardPreview />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
