'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, refreshSession } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Sliding expiration: keep active users logged in during normal use.
    refreshSession();
  }, [hasHydrated, isAuthenticated, refreshSession, router]);

  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
