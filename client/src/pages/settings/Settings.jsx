import { useState } from 'react';
import { authStore } from '../../store/authStore.js';
import { BranchSettings } from './BranchSettings.jsx';
import { UserManagement } from './UserManagement.jsx';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Building2, Users, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function Settings() {
  const user = authStore((s) => s.user);
  const [tab, setTab] = useState('branches');
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin) {
    return (
      <PageWrapper title="Settings">
        <div className="flex flex-col items-center justify-center p-12 text-center mt-12">
          <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-500 max-w-sm">You need Super Admin privileges to view and modify system configuration settings.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">System Configuration</h1>
        {/* Header & Tabs */}
        <div className="mb-8">
          <p className="mt-1 text-sm font-medium text-slate-500 mb-6">Manage global application settings, branches, and user access controls.</p>
          
          <div className="border-b border-slate-200/80">
            <nav className="-mb-px flex gap-6" aria-label="Tabs">
              <button
                onClick={() => setTab('branches')}
                className={cn(
                  'flex items-center gap-2.5 whitespace-nowrap border-b-2 py-4 text-[15px] font-semibold transition-all duration-200 outline-none',
                  tab === 'branches'
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                )}
              >
                <Building2 className={cn("h-4 w-4 shrink-0 transition-colors", tab === 'branches' ? "text-brand-600" : "text-slate-400")} />
                Branch Configuration
              </button>
              
              <button
                onClick={() => setTab('users')}
                className={cn(
                  'flex items-center gap-2.5 whitespace-nowrap border-b-2 py-4 text-[15px] font-semibold transition-all duration-200 outline-none',
                  tab === 'users'
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                )}
              >
                <Users className={cn("h-4 w-4 shrink-0 transition-colors", tab === 'users' ? "text-brand-600" : "text-slate-400")} />
                User Management
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-500 fill-mode-both min-h-[400px]">
          {tab === 'branches' && <BranchSettings />}
          {tab === 'users' && <UserManagement />}
        </div>
      </div>
    </PageWrapper>
  );
}
