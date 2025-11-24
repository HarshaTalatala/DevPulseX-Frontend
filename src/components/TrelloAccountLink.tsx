"use client";

import { useState } from 'react';
import { useLinkTrelloAccount } from '@/hooks/useTrello';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';
import { CheckCircle, Link as LinkIcon, Loader2 } from 'lucide-react';

export default function TrelloAccountLink() {
  const { user } = useAuthStore();
  const linkMutation = useLinkTrelloAccount();
  const [token, setToken] = useState('');
  const [showInput, setShowInput] = useState(false);

  const isLinked = !!(user?.trelloId && user?.trelloUsername);

  const handleLink = async () => {
    if (!token.trim()) {
      toast.error('Please enter your Trello token');
      return;
    }

    try {
      await linkMutation.mutateAsync(token);
      toast.success('Trello account linked successfully!');
      setToken('');
      setShowInput(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to link Trello account');
    }
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

  if (!showInput) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Link Your Trello Account
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Connect your Trello account to access boards, lists, and cards directly in DevPulseX.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInput(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium inline-flex items-center gap-2 transition-colors"
        >
          <LinkIcon className="h-4 w-4" />
          Link Trello Account
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Link Your Trello Account
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trello Token
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Get your token from{' '}
            <a
              href="https://trello.com/app-key"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              https://trello.com/app-key
            </a>
            {' '}(click "Token" link)
          </p>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your Trello token here"
            className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleLink}
            disabled={linkMutation.isPending || !token.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium inline-flex items-center gap-2 transition-colors"
          >
            {linkMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                Link Account
              </>
            )}
          </button>
          <button
            onClick={() => {
              setShowInput(false);
              setToken('');
            }}
            disabled={linkMutation.isPending}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
