import { useMemo } from 'react';
import { authStore } from '../store/authStore';

export function useAuth() {
  const token = authStore((s) => s.token);
  const user = authStore((s) => s.user);
  const setAuth = authStore((s) => s.setAuth);
  const logout = authStore((s) => s.logout);
  const setUser = authStore((s) => s.setUser);

  const isAuthenticated = useMemo(() => !!token, [token]);

  return { user, token, setAuth, logout, setUser, isAuthenticated };
}
