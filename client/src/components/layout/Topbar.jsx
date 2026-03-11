import { authStore } from '../../store/authStore';
import { Button } from '../ui/button.jsx';
import { LogOut, Menu } from 'lucide-react';
import { uiStore } from '../../store/uiStore';

export function Topbar() {
  const user = authStore((s) => s.user);
  const logout = authStore((s) => s.logout);
  const setSidebarOpen = uiStore((s) => s.setSidebarOpen);

  return (
    <header className="sticky top-0 z-20 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          onClick={() => setSidebarOpen()}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden xs:block">
              <p className="text-[13px] font-bold text-slate-900 leading-none truncate max-w-[120px] sm:max-w-none">
                {user.name}
              </p>
              {user.role && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {user.role.replace('_', ' ')}
                </p>
              )}
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout} 
                className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-all active:scale-90" 
                aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
