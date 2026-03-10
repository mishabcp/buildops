import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Login } from './pages/auth/Login.jsx';
import { Dashboard } from './pages/dashboard/Dashboard.jsx';
import { Settings } from './pages/settings/Settings.jsx';
import { ProjectList } from './pages/projects/ProjectList.jsx';
import { ProjectForm } from './pages/projects/ProjectForm.jsx';
import { ProjectDetail } from './pages/projects/ProjectDetail.jsx';
import { MaterialList } from './pages/materials/MaterialList.jsx';
import { BillList } from './pages/bills/BillList.jsx';
import { Reports } from './pages/reports/Reports.jsx';

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
    <Routes>
      <Route path="/login" element={<Login />} />
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
        <Route path="materials" element={<MaterialList />} />
        <Route path="bills" element={<BillList />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
