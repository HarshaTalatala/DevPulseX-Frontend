'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { isDemoMode } from '@/lib/demoMode';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, refreshSession } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (isDemoMode()) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Sliding expiration: keep active users logged in during normal use.
    refreshSession();
  }, [hasHydrated, isAuthenticated, refreshSession, router]);

  if (!hasHydrated || (!isAuthenticated && !isDemoMode())) {
    return null;
  }

  return <>{children}</>;
}
