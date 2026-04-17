'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { clearPersistedOAuthState, getPersistedOAuthState } from '@/lib/oauthState';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = hashParams.get('token'); // Trello token lives in the URL fragment
    const isPopup = window.opener && window.opener !== window;
    const isGoogle = !!state && state.startsWith('google:');
    const isGitHub = !!state && state.startsWith('github:');
    const isTrello = !!state && !isGoogle && !!token;
    const expectedState = typeof window !== 'undefined' ? sessionStorage.getItem('trello_oauth_state') : null;

    // Add timeout protection (30 seconds)
    const timeoutId = setTimeout(() => {
      toast.error('Authentication is taking too long. Please try again.');
      router.replace('/login');
    }, 30000);

    if (error) {
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

    // Handle Trello OAuth callback (returns token directly via fragment)
    if (isTrello && token) {
      (async () => {
        try {
          if (!expectedState || expectedState !== state) {
            throw new Error('State validation failed');
          }
          const resp = await authApi.linkTrelloAccount(token, state);
          
          clearTimeout(timeoutId);
          setAuth(resp.user, resp.token);
          
          // Invalidate all Trello-related queries to force refetch with new token
          await queryClient.invalidateQueries({ queryKey: ['trello'] });
          
          toast.success('Trello account linked successfully!');

          // Clean up state artifacts
          sessionStorage.removeItem('trello_oauth_state');
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `trello_state=; Max-Age=0; Path=/; SameSite=None${secure}`;
          router.replace('/dashboard');
        } catch (e: any) {
          clearTimeout(timeoutId);
          
          const errorMsg = e.response?.data?.message || e.message || 'Failed to link Trello account';
          toast.error(`Trello linking failed: ${errorMsg}`);
          
          setTimeout(() => {
            router.replace('/dashboard');
          }, 2000);
        }
      })();
      return;
    }

    if (!code || !state || (!isGoogle && !isGitHub)) {
      clearTimeout(timeoutId);
      if (isPopup && window.opener) {
        window.opener.postMessage({ 
          type: 'GOOGLE_AUTH_ERROR', 
          error: 'Invalid OAuth callback payload' 
        }, window.location.origin);
        window.close();
      } else {
        toast.error('Invalid OAuth callback payload.');
        router.replace('/login');
      }
      return;
    }

    const provider = isGoogle ? 'google' : 'github';
    const expectedOauthState = getPersistedOAuthState(provider);
    if (!expectedOauthState || expectedOauthState !== state) {
      clearTimeout(timeoutId);
      clearPersistedOAuthState(provider);
      toast.error('OAuth state validation failed. Please sign in again.');
      router.replace('/login');
      return;
    }

    // If opened in popup and it's Google OAuth, send code to parent window
    if (isPopup && isGoogle && window.opener) {
      clearTimeout(timeoutId);
      window.opener.postMessage({ 
        type: 'GOOGLE_AUTH_SUCCESS', 
        code,
        state
      }, window.location.origin);
      // Don't close immediately, let parent handle it
      return;
    }

    // Normal flow for GitHub or non-popup flow
    (async () => {
      try {
        const resp = isGoogle 
          ? await authApi.googleLogin(code, state)
          : await authApi.githubLogin(code, state);
        
        clearTimeout(timeoutId);
        setAuth(resp.user, resp.token);
        clearPersistedOAuthState(provider);
        toast.success(`Signed in with ${isGoogle ? 'Google' : 'GitHub'}!`);
        router.replace('/dashboard');
      } catch (e: any) {
        clearTimeout(timeoutId);
        clearPersistedOAuthState(provider);
        
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
