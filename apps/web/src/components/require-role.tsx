'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/lib/api/auth';

type AllowedRoles = 'any' | Array<UserRole | 'guest'>;

export function RequireRole({
  allowed,
  fallback,
  children,
}: {
  allowed: AllowedRoles;
  fallback?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    let isAllowed: boolean;
    if (allowed === 'any') {
      isAllowed = !!user;
    } else {
      const role: UserRole | 'guest' = user?.role ?? 'guest';
      isAllowed = allowed.includes(role);
    }

    if (isAllowed) return;

    const target = user ? (fallback ?? '/') : '/login';
    router.replace(target);
  }, [isLoading, user, allowed, fallback, router]);

  return <>{children}</>;
}
