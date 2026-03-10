import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar.jsx';
import { Topbar } from './layout/Topbar.jsx';
import { Toaster } from './shared/Toaster.jsx';
import { authStore } from '../store/authStore.js';
import { me } from '../api/auth.api.js';

export function Layout() {
  const token = authStore((s) => s.token);
  const user = authStore((s) => s.user);
  const setUser = authStore((s) => s.setUser);
  const logout = authStore((s) => s.logout);

  useEffect(() => {
    if (!token) return;
    if (user) return;
    me()
      .then((res) => {
        if (res?.success && res?.data) setUser(res.data);
      })
      .catch(() => logout());
  }, [token, user, setUser, logout]);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main>
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
