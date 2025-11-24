'use client';

import { Suspense, lazy, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import DashboardSkeleton, { SkeletonChart } from '@/components/ui/DashboardSkeleton';
import { useDashboard, useProjectMetrics, useUserMetrics } from '@/hooks/useDashboard';
import { FolderKanban, Users, CheckSquare, GitCommit, AlertCircle, Rocket, TrendingUp, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGithubInsights } from '@/hooks/useGithub';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import TrelloBoardViewer from '@/components/TrelloBoardViewer';
import TrelloBoardSelector from '@/components/TrelloBoardSelector';
import TrelloAccountLink from '@/components/TrelloAccountLink';
import OAuthAccountsStatus from '@/components/OAuthAccountsStatus';
import { useProjects } from '@/hooks/useProjects';

// Lazy load heavy components for better performance
const AnimatedChart = dynamic(
  () => import('@/components/ui/AnimatedChart').then((mod) => ({ default: mod.AnimatedChart })),
  {
    ssr: false,
    loading: () => <SkeletonChart />,
  }
);

const GradientCard = dynamic(
  () => import('@/components/ui/AnimatedCard').then((mod) => ({ default: mod.GradientCard })),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
    ),
  }
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();
  const { data: projectMetrics, isLoading: projectsLoading } = useProjectMetrics();
  const { data: userMetrics, isLoading: usersLoading } = useUserMetrics();
  const { data: gh, isLoading: ghLoading, error: ghError } = useGithubInsights();
  const { data: projects } = useProjects();
  const [activeTab, setActiveTab] = useState<'overview' | 'trello'>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);

  const firstProjectId = useMemo(() => {
    if (!projects || projects.length === 0) return undefined;
    return projects[0].id;
  }, [projects]);

  const effectiveProjectId = selectedProjectId || firstProjectId;

  // Show skeleton while any critical data is loading
  const isInitialLoading = ghLoading && !gh;

  // Log GitHub data for debugging (only in development)
  if (process.env.NODE_ENV === 'development' && gh) {
    console.log('GitHub Data:', {
      user: gh.username,
      recentActivity: {
        commits: gh.recentCommits,
        prs: gh.recentPRs,
        issues: gh.recentIssues,
      },
      totals: {
        repos: gh.repoCount,
        prs: gh.totalPullRequests,
        issues: gh.totalIssues,
        stars: gh.totalStars,
      },
    });
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AnimatePresence mode="wait">
          {isInitialLoading ? (
            <DashboardSkeleton key="skeleton" />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Developer Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500 dark:text-gray-500" />
                Your GitHub productivity insights and analytics
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="font-medium text-sm">Live</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md text-sm ${activeTab === 'overview' ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-3 py-1.5 rounded-md text-sm ${activeTab === 'accounts' ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300'}`}
            >
              Accounts
            </button>
            <button
              onClick={() => setActiveTab('trello')}
              className={`px-3 py-1.5 rounded-md text-sm ${activeTab === 'trello' ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300'}`}
            >
              Trello
            </button>
          </div>

          {activeTab === 'overview' && (
          <>
          {/* GitHub Analytics Section */}
          {ghLoading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="rounded-full h-12 w-12 border-[3px] border-t-gray-900 dark:border-t-white border-r-gray-200 dark:border-r-gray-800 border-b-gray-200 dark:border-b-gray-800 border-l-gray-200 dark:border-l-gray-800"
              />
            </div>
          ) : ghError ? (
            <div className="p-8 text-center bg-red-50/50 dark:bg-red-500/5 rounded-xl border border-red-200/60 dark:border-red-500/20">
              <div className="inline-flex p-3 rounded-full bg-red-100 dark:bg-red-500/10 mb-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Failed to Load GitHub Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {ghError?.message || 'Please check your connection and try again.'}
              </p>
            </div>
          ) : gh ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-5"
            >
              {/* GitHub Header Card */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {gh.avatarUrl && (
                        <a 
                          href={gh.profileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="transition-transform hover:scale-105"
                        >
                          <img 
                            src={gh.avatarUrl} 
                            alt={gh.username}
                            className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full border-2 border-blue-500 hover:border-blue-600"
                          />
                        </a>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                          {gh.username}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                          <GitCommit className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <span className="truncate">GitHub Developer Analytics</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3 sm:gap-4 md:gap-5 text-sm">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{gh.followers}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{gh.following}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
                        </div>
                      </div>
                      {gh.profileUrl && (
                        <a
                          href={gh.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs sm:text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
                        >
                          <span className="hidden xs:inline">View Profile</span>
                          <span className="xs:hidden">Profile</span>
                          <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  name="Repositories"
                  value={gh.repoCount}
                  icon={FolderKanban}
                  color=""
                  gradientFrom=""
                  gradientTo=""
                />
                <StatCard
                  name="Total Pull Requests"
                  value={gh.totalPullRequests}
                  icon={GitCommit}
                  color=""
                  gradientFrom=""
                  gradientTo=""
                />
                <StatCard
                  name="Total Issues"
                  value={gh.totalIssues}
                  icon={AlertCircle}
                  color=""
                  gradientFrom=""
                  gradientTo=""
                />
                <StatCard
                  name="Total Stars"
                  value={gh.totalStars}
                  icon={Rocket}
                  color=""
                  gradientFrom=""
                  gradientTo=""
                />
              </div>

              {/* Issues and Activity Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                      Issues Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total</span>
                        <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{gh.totalIssues}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-white/5">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Open</span>
                        <span className="text-base sm:text-lg font-semibold text-orange-600 dark:text-orange-400">{gh.openIssues}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Closed</span>
                        <span className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400">{gh.closedIssues}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                      Recent Activity (7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {gh.recentCommits === 0 && gh.recentPRs === 0 && gh.recentIssues === 0 ? (
                      <div className="text-center py-3 sm:py-4">
                        <div className="inline-flex p-2 sm:p-2.5 rounded-lg bg-gray-100 dark:bg-white/5 mb-2">
                          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          No activity in the last 7 days
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Time to start coding! 🚀
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Commits</span>
                          <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{gh.recentCommits}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-white/5">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pull Requests</span>
                          <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{gh.recentPRs}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Issues</span>
                          <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{gh.recentIssues}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="sm:col-span-2 md:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                      Additional Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Public Gists</span>
                        <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{gh.publicGists}</span>
                      </div>
                      {gh.mostActiveRepo && (
                        <div className="pt-3 border-t border-gray-100 dark:border-white/5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Most Active Repo</span>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-1 truncate">
                            {gh.mostActiveRepo}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <div className="p-12 text-center bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-gray-300 dark:border-white/10">
              <div className="inline-flex p-4 rounded-xl bg-gray-100 dark:bg-white/5 mb-4">
                <GitCommit className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Connect Your GitHub Account
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Link your GitHub account to see comprehensive analytics including repositories, commits, pull requests, issues, and more.
              </p>
              <button
                onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/github'}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <GitCommit className="h-4 w-4" />
                Connect GitHub Account
              </button>
            </div>
          )}
          </>
          )}

          {activeTab === 'accounts' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <OAuthAccountsStatus />
            </motion.div>
          )}

          {activeTab === 'trello' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Project</label>
                  <select
                    className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-white/10"
                    value={effectiveProjectId || ''}
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  >
                    {projects?.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {effectiveProjectId && (
                  <div className="w-full md:w-[520px]">
                    <TrelloBoardSelector projectId={effectiveProjectId} />
                  </div>
                )}
              </div>

              {effectiveProjectId ? (
                <TrelloBoardViewer projectId={effectiveProjectId} />
              ) : (
                <div className="p-8 text-center bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-gray-300 dark:border-white/10">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Select a project</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose a project to view Trello board data.</p>
                </div>
              )}
            </div>
          )}
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
