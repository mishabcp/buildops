import { authStore } from '../../store/authStore';
import { LogOut, Menu } from 'lucide-react';
import { uiStore } from '../../store/uiStore';

export function Topbar() {
  const user = authStore((s) => s.user);
  const logout = authStore((s) => s.logout);
  const setSidebarOpen = uiStore((s) => s.setSidebarOpen);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          onClick={() => setSidebarOpen()}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <img src="/logo.png" alt="Buildops" className="h-9 w-9 object-contain" />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <>
            <div className="hidden text-right xs:block sm:block">
              <p className="max-w-[160px] truncate text-[13px] font-bold leading-none text-brand-950">
                {user.name}
              </p>
              {user.role && (
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-accent-500">
                  {user.role.replace(/_/g, ' ')}
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800 text-sm font-black text-white shadow-brand">
              {initials}
            </div>
            <button
              onClick={logout}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 active:scale-90"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
