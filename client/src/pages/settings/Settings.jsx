import { useState } from 'react';
import { authStore } from '../../store/authStore.js';
import { BranchSettings } from './BranchSettings.jsx';
import { UserManagement } from './UserManagement.jsx';
import { PageWrapper } from '../../components/layout/PageWrapper.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Building2, Users } from 'lucide-react';

export function Settings() {
  const user = authStore((s) => s.user);
  const [tab, setTab] = useState('branches');
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin) {
    return (
      <PageWrapper title="Settings">
        <p className="text-gray-600">You don&apos;t have access to settings.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Settings">
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <Button
          variant={tab === 'branches' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTab('branches')}
          className="gap-2"
        >
          <Building2 className="h-4 w-4" />
          Branch Settings
        </Button>
        <Button
            variant={tab === 'users' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab('users')}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            User Management
          </Button>
      </div>
      {tab === 'branches' && <BranchSettings />}
      {tab === 'users' && <UserManagement />}
    </PageWrapper>
  );
}
