import { Navigate, useLocation } from 'react-router-dom';
import { authStore } from '../store/authStore';

export function ProtectedRoute({ children }) {
  const token = authStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
