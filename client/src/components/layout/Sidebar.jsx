import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils.js';
import { uiStore } from '../../store/uiStore';
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  FileText,
  Package,
  CircleDollarSign,
  Settings,
  Menu,
  BookOpen,
} from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Building2 },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/materials', label: 'Materials', icon: Package },
  { to: '/bills', label: 'Bills', icon: FileText },
  { to: '/reports', label: 'Reports', icon: CircleDollarSign },
  { to: '/guide', label: 'Guide', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const sidebarOpen = uiStore((s) => s.sidebarOpen);
  const setSidebarOpen = uiStore((s) => s.setSidebarOpen);

  const closeSidebarOnNav = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="fixed left-2 top-4 z-50 rounded p-2 text-white hover:bg-gray-800 lg:hidden"
        onClick={() => setSidebarOpen()}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64 border-r border-gray-800 bg-gray-900 text-white transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-4">
          <span className="font-semibold">CBMS</span>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={closeSidebarOnNav}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
