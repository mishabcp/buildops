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
  BookOpen,
  ChevronLeft,
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
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-brand-950/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-brand-900 text-slate-300 transition-all duration-300 ease-in-out lg:w-64 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-24 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />

        {/* Brand */}
        <div className="relative flex h-20 items-center justify-between gap-2 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-brand-950/40 ring-1 ring-white/20">
              <img src="/logo.png" alt="Buildops logo" className="h-10 w-10 object-contain" />
            </div>
            <div className="leading-none">
              <span className="block text-lg font-black uppercase tracking-tight text-white">Buildops</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-accent-400">
                Construction OS
              </span>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Menu</p>
          {nav.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={closeSidebarOnNav}
                className={cn(
                  'group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-bold transition-all',
                  isActive
                    ? 'bg-white text-brand-900 shadow-lg shadow-brand-950/30'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-accent-500' : 'text-slate-400 group-hover:text-accent-400'
                  )}
                />
                <span className="text-xs uppercase tracking-wide">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveBar"
                    className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-accent-400"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <p className="text-[11px] font-bold text-white">Buildops MVP</p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-400">Manage projects, money & materials.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
