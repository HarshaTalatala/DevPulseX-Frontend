"use client";

import { useAuthStore } from '@/stores/auth';
import { CheckCircle, XCircle, Github, Mail } from 'lucide-react';
import TrelloAccountLink from './TrelloAccountLink';

export default function OAuthAccountsStatus() {
  const { user } = useAuthStore();

  if (!user) return null;

  const githubLinked = !!(user.githubId && user.githubUsername);
  const googleLinked = !!(user.googleId && user.googleEmail);
  const trelloLinked = !!(user.trelloId && user.trelloUsername);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Connected Accounts
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {[githubLinked, googleLinked, trelloLinked].filter(Boolean).length} of 3 linked
        </span>
      </div>

      {/* GitHub Status */}
      <div className={`p-4 rounded-lg border ${
        githubLinked 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-white/10'
      }`}>
        <div className="flex items-center gap-3">
          <Github className={`h-5 w-5 ${
            githubLinked ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
          }`} />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              GitHub
            </h3>
            {githubLinked ? (
              <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                Connected as <span className="font-medium">@{user.githubUsername}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Not connected
              </p>
            )}
          </div>
          {githubLinked ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Google Status */}
      <div className={`p-4 rounded-lg border ${
        googleLinked 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-white/10'
      }`}>
        <div className="flex items-center gap-3">
          <Mail className={`h-5 w-5 ${
            googleLinked ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
          }`} />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Google
            </h3>
            {googleLinked ? (
              <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                Connected as <span className="font-medium">{user.googleName || user.googleEmail}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Not connected
              </p>
            )}
          </div>
          {googleLinked ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Trello Status - using the existing component */}
      <TrelloAccountLink />

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> Link all accounts to unlock full integration features including automatic data sync, 
          commit tracking, board management, and more!
        </p>
      </div>
    </div>
  );
}
