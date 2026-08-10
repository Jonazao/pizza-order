import { ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { RequireRole } from '@/components/require-role';

export default function BrowseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 min-h-screen bg-stone-50 flex flex-col">
      <AppHeader />
      <RequireRole allowed={['guest', 'Customer']} fallback="/employee/orders">
        {children}
      </RequireRole>
    </div>
  );
}
