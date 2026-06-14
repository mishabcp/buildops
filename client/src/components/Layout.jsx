import { useEffect, useRef } from 'react';
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
  const meFetchedRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    if (user) return;
    if (meFetchedRef.current) return;
    meFetchedRef.current = true;
    me()
      .then((res) => {
        if (res?.success && res?.data) setUser(res.data);
      })
      .catch(() => logout())
      .finally(() => {
        meFetchedRef.current = false;
      });
  }, [token, user, setUser, logout]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
