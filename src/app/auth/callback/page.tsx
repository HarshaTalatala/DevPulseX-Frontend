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
    const token = params.get('token'); // Trello token
    const isPopup = window.opener && window.opener !== window;
    const isGoogle = state === 'google';
    const isTrello = state === 'trello';

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
        router.replace(isTrello ? '/dashboard' : '/login');
      }
      return;
    }

    // Handle Trello OAuth callback (returns token directly)
    if (isTrello && token) {
      (async () => {
        try {
          console.log('[Auth Callback] Processing Trello OAuth with token');
          const resp = await authApi.linkTrelloAccount(token);
          
          clearTimeout(timeoutId);
          console.log('[Auth Callback] Trello account linked:', resp);
          setAuth(resp.user, resp.token);
          toast.success('Trello account linked successfully!');
          
          console.log('[Auth Callback] Redirecting to dashboard...');
          router.replace('/dashboard');
        } catch (e: any) {
          clearTimeout(timeoutId);
          console.error('[Auth Callback] Trello linking error:', e);
          
          const errorMsg = e.response?.data?.message || e.message || 'Failed to link Trello account';
          toast.error(`Trello linking failed: ${errorMsg}`);
          
          setTimeout(() => {
            router.replace('/dashboard');
          }, 2000);
        }
      })();
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
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-black">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/30 dark:to-white/[0.02]"></div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          {/* Card with transparency */}
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-900/5 dark:shadow-none p-8 min-w-[320px]">
            {/* Spinner */}
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-800"></div>
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900 dark:border-t-white animate-spin"></div>
              </div>
            </div>

            {/* Text */}
            <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-2">
              Completing sign-in…
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Please wait while we authenticate you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden bg-white dark:bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/30 dark:to-white/[0.02]"></div>
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-900/5 dark:shadow-none p-8 min-w-[320px]">
              <div className="flex justify-center mb-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-800"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900 dark:border-t-white animate-spin"></div>
                </div>
              </div>
              <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-2">
                Preparing…
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Setting up your authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
