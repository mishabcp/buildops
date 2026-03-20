import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils.js';
import { uiStore } from '../../store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft
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

  const closeSidebar = () => setSidebarOpen(false);

  const closeSidebarOnNav = () => {
    if (window.innerWidth < 1024) closeSidebar();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>


      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 border-r border-slate-200 bg-white text-slate-900 transition-all duration-300 ease-in-out lg:w-64 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-100 px-6">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-black text-slate-950 tracking-tighter uppercase whitespace-nowrap">Buildops</span>
           </div>
           {/* Mobile Close Button */}
           <button 
             onClick={closeSidebar}
             className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
           >
             <ChevronLeft className="h-5 w-5" />
           </button>
        </div>
        <nav className="flex flex-col gap-1.5 p-4">
          {nav.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={closeSidebarOnNav}
                className={cn(
                  'flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-bold transition-all group relative',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950 hover:translate-x-1'
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                <span className="tracking-tight uppercase text-xs">{label}</span>
                {isActive && (
                   <motion.div 
                     layoutId="sidebarActiveGlow"
                     className="absolute -right-1 top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-l-full shadow-lg shadow-blue-500/50"
                   />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
