'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { AnimatedChart } from '@/components/ui/AnimatedChart';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { GradientCard } from '@/components/ui/AnimatedCard';
import { useDashboard, useProjectMetrics, useUserMetrics } from '@/hooks/useDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { FolderKanban, Users, CheckSquare, GitCommit, AlertCircle, Rocket, TrendingUp, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGithubInsights } from '@/hooks/useGithub';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useDashboard();
  const { data: projectMetrics } = useProjectMetrics();
  const { data: userMetrics } = useUserMetrics();
  const { data: gh, isLoading: ghLoading, error: ghError } = useGithubInsights();

  console.log('Dashboard Debug:', { 
    gh, 
    ghLoading, 
    ghError,
    hasData: !!gh,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null 
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Developer Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Your GitHub productivity insights and analytics
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">Live</span>
              </div>
            </motion.div>
          </motion.div>

          {/* GitHub Analytics Section */}
          {ghLoading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-purple-600 border-b-pink-600 border-l-blue-600"
              />
            </div>
          ) : ghError ? (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
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
              className="space-y-6"
            >
              {/* GitHub Header Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
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
                            className="h-16 w-16 rounded-full border-2 border-blue-500 hover:border-blue-600"
                          />
                        </a>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {gh.username}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                          <GitCommit className="h-4 w-4" />
                          GitHub Developer Analytics
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{gh.followers}</div>
                          <div>Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{gh.following}</div>
                          <div>Following</div>
                        </div>
                      </div>
                      {gh.profileUrl && (
                        <a
                          href={gh.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                          View Profile
                          <TrendingUp className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  name="Repositories"
                  value={gh.repoCount}
                  icon={FolderKanban}
                  color="bg-blue-500 text-white"
                  gradientFrom="from-blue-500"
                  gradientTo="to-blue-600"
                />
                <StatCard
                  name="Total Pull Requests"
                  value={gh.totalPullRequests}
                  icon={GitCommit}
                  color="bg-purple-500 text-white"
                  gradientFrom="from-purple-500"
                  gradientTo="to-purple-600"
                />
                <StatCard
                  name="Total Issues"
                  value={gh.totalIssues}
                  icon={AlertCircle}
                  color="bg-red-500 text-white"
                  gradientFrom="from-red-500"
                  gradientTo="to-red-600"
                />
                <StatCard
                  name="Total Stars"
                  value={gh.totalStars}
                  icon={Rocket}
                  color="bg-yellow-500 text-white"
                  gradientFrom="from-yellow-500"
                  gradientTo="to-yellow-600"
                />
              </div>

              {/* Issues and Activity Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Issues Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{gh.totalIssues}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-600 dark:text-orange-400">Open</span>
                        <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">{gh.openIssues}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 dark:text-green-400">Closed</span>
                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">{gh.closedIssues}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Recent Activity (7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Commits</span>
                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">{gh.recentCommits}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Pull Requests</span>
                        <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">{gh.recentPRs}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Issues</span>
                        <span className="text-lg font-semibold text-red-600 dark:text-red-400">{gh.recentIssues}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Additional Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Public Gists</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{gh.publicGists}</span>
                      </div>
                      {gh.mostActiveRepo && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Most Active Repo</span>
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1 truncate">
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
            <div className="p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
              <GitCommit className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Connect Your GitHub Account
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Link your GitHub account to see comprehensive analytics including repositories, commits, pull requests, issues, and more.
              </p>
              <button
                onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/github'}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <GitCommit className="h-5 w-5" />
                Connect GitHub Account
              </button>
            </div>
          )}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
