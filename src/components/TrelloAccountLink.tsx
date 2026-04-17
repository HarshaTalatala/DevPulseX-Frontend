"use client";

import { useEffect, useState } from 'react';
import { useTrelloAuth } from '@/hooks/useTrelloAuth';
import { useAuthStore } from '@/stores/auth';
import { CheckCircle, Link as LinkIcon } from 'lucide-react';

export default function TrelloAccountLink() {
  const { user } = useAuthStore();
  const { initiateTrelloLogin, error, loading } = useTrelloAuth();
  const [hasStoredToken, setHasStoredToken] = useState(false);

  const isLinked = !!(user?.trelloId && user?.trelloUsername);
  const hasRuntimeToken = !!(user?.trelloAccessToken || hasStoredToken);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHasStoredToken(!!localStorage.getItem('trello_access_token'));
  }, [user?.trelloAccessToken]);

  const handleLink = () => {
    initiateTrelloLogin();
  };

  if (isLinked) {
    if (!hasRuntimeToken) {
      return (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Trello Re-link Required
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Your Trello account is connected as <span className="font-medium">@{user?.trelloUsername}</span>, but the token is missing.
                Re-link once to restore board access.
              </p>
            </div>
            <button
              onClick={handleLink}
              disabled={loading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium inline-flex items-center gap-2 transition-colors disabled:opacity-60 w-fit"
            >
              <LinkIcon className="h-4 w-4" />
              {loading ? 'Redirecting…' : 'Re-link Trello Account'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
                Trello Account Linked
              </h3>
              <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                Connected as <span className="font-medium">@{user?.trelloUsername}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLink}
            disabled={loading}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            {loading ? 'Redirecting…' : 'Re-link'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Link Your Trello Account
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Connect your Trello account to access boards, lists, and cards directly in DevPulseX.
          </p>
        </div>
      </div>
      {error && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      <button
        onClick={handleLink}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium inline-flex items-center gap-2 transition-colors"
      >
        <LinkIcon className="h-4 w-4" />
        {loading ? 'Redirecting…' : 'Link Trello Account'}
      </button>
    </div>
  );
}
