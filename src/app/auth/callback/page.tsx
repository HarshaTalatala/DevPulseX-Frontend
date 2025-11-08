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

    // Add timeout protection (30 seconds)
    const timeoutId = setTimeout(() => {
      console.error('[Auth Callback] Request timeout - taking too long');
      toast.error('Authentication is taking too long. Please try again.');
      router.replace('/login');
    }, 30000);

    if (error) {
      console.error('OAuth error:', error);
      clearTimeout(timeoutId);
      
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
      clearTimeout(timeoutId);
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
      clearTimeout(timeoutId);
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
        console.log(`[Auth Callback] Processing ${isGoogle ? 'Google' : 'GitHub'} OAuth with code:`, code.substring(0, 10) + '...');
        console.log('[Auth Callback] Calling backend API...');
        
        const resp = isGoogle 
          ? await authApi.googleLogin(code)
          : await authApi.githubLogin(code);
        
        clearTimeout(timeoutId);
        console.log('[Auth Callback] Backend response received:', resp);
        setAuth(resp.user, resp.token);
        toast.success(`Signed in with ${isGoogle ? 'Google' : 'GitHub'}!`);
        
        console.log('[Auth Callback] Redirecting to dashboard...');
        router.replace('/dashboard');
      } catch (e: any) {
        clearTimeout(timeoutId);
        console.error('[Auth Callback] OAuth login error:', e);
        console.error('[Auth Callback] Error response:', e.response?.data);
        console.error('[Auth Callback] Error status:', e.response?.status);
        
        const errorMsg = e.response?.data?.message || e.message || 'OAuth login failed';
        toast.error(`Authentication failed: ${errorMsg}`);
        
        // Add timeout to ensure user sees the error before redirect
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      }
    })();
  }, [params, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-gray-600 dark:text-gray-300 text-lg font-medium">
          Completing sign-in…
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Please wait while we authenticate you
        </div>
      </div>
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
