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
    const state = params.get('state');
    const error = params.get('error');
    const isPopup = window.opener && window.opener !== window;
    const isGoogle = state === 'google';

    if (error) {
      console.error('OAuth error:', error);
      
      if (isPopup && window.opener) {
        // Send error message to parent window
        window.opener.postMessage({ 
          type: 'GOOGLE_AUTH_ERROR', 
          error 
        }, window.location.origin);
        window.close();
      } else {
        toast.error(`Authentication failed: ${error}`);
        router.replace('/login');
      }
      return;
    }

    if (!code) {
      if (isPopup && window.opener) {
        window.opener.postMessage({ 
          type: 'GOOGLE_AUTH_ERROR', 
          error: 'Missing authorization code' 
        }, window.location.origin);
        window.close();
      } else {
        toast.error('Missing authorization code.');
        router.replace('/login');
      }
      return;
    }

    // If opened in popup and it's Google OAuth, send code to parent window
    if (isPopup && isGoogle && window.opener) {
      window.opener.postMessage({ 
        type: 'GOOGLE_AUTH_SUCCESS', 
        code 
      }, window.location.origin);
      // Don't close immediately, let parent handle it
      return;
    }

    // Normal flow for GitHub or non-popup flow
    (async () => {
      try {
        const resp = isGoogle 
          ? await authApi.googleLogin(code)
          : await authApi.githubLogin(code);
        
        setAuth(resp.user, resp.token);
        toast.success(`Signed in with ${isGoogle ? 'Google' : 'GitHub'}!`);
        router.replace('/dashboard');
      } catch (e: any) {
        console.error('OAuth login error:', e);
        const errorMsg = e.response?.data?.message || e.message || 'OAuth login failed';
        toast.error(errorMsg);
        router.replace('/login');
      }
    })();
  }, [params, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600 dark:text-gray-300">Completing sign-in…</div>
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
