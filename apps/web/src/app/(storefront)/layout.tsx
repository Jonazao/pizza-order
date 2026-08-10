import { ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader';

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 min-h-screen bg-stone-50 flex flex-col">
      <AppHeader />
      {children}
    </div>
  );
}
