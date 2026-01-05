"use client";

import { useTrelloAuth } from '@/hooks/useTrelloAuth';
import { useAuthStore } from '@/stores/auth';
import { CheckCircle, Link as LinkIcon } from 'lucide-react';

export default function TrelloAccountLink() {
  const { user } = useAuthStore();
  const { initiateTrelloLogin, error } = useTrelloAuth();

  const isLinked = !!(user?.trelloId && user?.trelloUsername);

  const handleLink = () => {
    initiateTrelloLogin();
  };

  if (isLinked) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
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
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium inline-flex items-center gap-2 transition-colors"
      >
        <LinkIcon className="h-4 w-4" />
        Link Trello Account
      </button>
    </div>
  );
}
