import { authStore } from '../../store/authStore';
import { Button } from '../ui/button.jsx';
import { LogOut } from 'lucide-react';

export function Topbar() {
  const user = authStore((s) => s.user);
  const logout = authStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4" />
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm text-gray-600">
              {user.name}
              {user.role && <span className="ml-1 text-gray-400">({user.role})</span>}
            </span>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
