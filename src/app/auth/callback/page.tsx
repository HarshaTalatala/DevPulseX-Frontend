'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const code = params.get('code');
    if (!code) {
      toast.error('Missing authorization code.');
      router.replace('/');
      return;
    }
    (async () => {
      try {
        const resp = await authApi.githubLogin(code);
        setAuth(resp.user, resp.token);
        toast.success('Signed in with GitHub!');
        router.replace('/dashboard');
      } catch (e) {
        toast.error('GitHub login failed');
        router.replace('/');
      }
    })();
  }, [params, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600 dark:text-gray-300">Completing GitHub sign-in…</div>
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Preparing…</div>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
