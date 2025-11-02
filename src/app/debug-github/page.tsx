'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useGithubInsights } from '@/hooks/useGithub';

export default function DebugGithubPage() {
  const { data: gh, isLoading, error } = useGithubInsights();
  const [rawJson, setRawJson] = useState<string>('');

  useEffect(() => {
    if (gh) {
      setRawJson(JSON.stringify(gh, null, 2));
    }
  }, [gh]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              GitHub API Debug Page
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Raw API response from /api/github/insights
            </p>
          </div>

          {isLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Loading...</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-red-50 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {gh && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="text-lg font-bold">{gh.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Repositories</p>
                      <p className="text-lg font-bold">{gh.repoCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total PRs</p>
                      <p className="text-lg font-bold">{gh.totalPullRequests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Issues</p>
                      <p className="text-lg font-bold">{gh.totalIssues}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Stars</p>
                      <p className="text-lg font-bold">{gh.totalStars}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Followers</p>
                      <p className="text-lg font-bold">{gh.followers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Following</p>
                      <p className="text-lg font-bold">{gh.following}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Public Gists</p>
                      <p className="text-lg font-bold">{gh.publicGists}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Commits</p>
                      <p className="text-2xl font-bold text-green-600">{gh.recentCommits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pull Requests</p>
                      <p className="text-2xl font-bold text-purple-600">{gh.recentPRs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Issues</p>
                      <p className="text-2xl font-bold text-red-600">{gh.recentIssues}</p>
                    </div>
                  </div>
                  {gh.recentCommits === 0 && gh.recentPRs === 0 && gh.recentIssues === 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        ⚠️ No activity detected in the last 7 days. This might be because:
                      </p>
                      <ul className="list-disc ml-5 mt-2 text-sm text-yellow-700">
                        <li>You haven&apos;t committed, created PRs, or issues in the last 7 days</li>
                        <li>Your recent activity is in private repositories</li>
                        <li>The GitHub API rate limit has been reached</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Issues Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold">{gh.totalIssues}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Open</p>
                      <p className="text-xl font-bold text-orange-600">{gh.openIssues}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Closed</p>
                      <p className="text-xl font-bold text-green-600">{gh.closedIssues}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {gh.mostActiveRepo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Most Active Repository</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-mono text-blue-600">{gh.mostActiveRepo}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Raw JSON Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-96">
                    {rawJson}
                  </pre>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
