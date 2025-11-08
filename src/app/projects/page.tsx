'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { useProjects, useDeleteProject } from '@/hooks/useProjects';
import { useProjectMetrics } from '@/hooks/useDashboard';
import { useTeams } from '@/hooks/useTeams';
import { useGithubRepositories } from '@/hooks/useGithub';
import { Plus, Trash2, Edit2, FolderKanban, Users, CheckSquare, GitCommit, AlertCircle, Rocket, Search, Grid3x3, List, TrendingUp, TrendingDown, Star, GitFork, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import ProjectCard from '@/components/ProjectCard';

type ViewMode = 'grid' | 'list';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const { data: projectMetrics } = useProjectMetrics();
  const { data: teams } = useTeams();
  const { data: githubRepos, isLoading: ghLoading } = useGithubRepositories();
  const deleteMutation = useDeleteProject();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Project deleted successfully');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const getTeamName = (teamId: number) => {
    return teams?.find((t) => t.id === teamId)?.name || 'Unknown Team';
  };

  const getProjectMetrics = (projectId: number) => {
    return projectMetrics?.find((pm) => pm.projectId === projectId);
  };

  const filteredProjects = projects?.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGithubRepos = githubRepos?.filter((repo: any) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const repos = filteredGithubRepos ?? [];
  const totalStars = repos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0);
  const totalOpenIssues = repos.reduce((sum: number, r: any) => sum + (r.open_issues_count || 0), 0);

  if (isLoading || ghLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-4 sm:space-y-6">
            {/* Header Skeleton */}
            <div className="animate-pulse">
              <div className="h-8 sm:h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-32 sm:w-40 mb-2"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-48 sm:w-64"></div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <div className="animate-pulse flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-3 sm:h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-20 sm:w-24 mb-2"></div>
                      <div className="h-6 sm:h-8 bg-neutral-300 dark:bg-neutral-700 rounded w-12 sm:w-16"></div>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-neutral-300 dark:bg-neutral-700 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search Skeleton */}
            <div className="animate-pulse flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-full sm:w-96"></div>
              <div className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
            </div>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6">
                  <div className="animate-pulse space-y-3 sm:space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="h-5 sm:h-6 bg-neutral-300 dark:bg-neutral-700 rounded w-32 sm:w-40"></div>
                      <div className="h-8 w-8 bg-neutral-300 dark:bg-neutral-700 rounded"></div>
                    </div>
                    <div className="h-3 sm:h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
                    <div className="h-3 sm:h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-neutral-300 dark:bg-neutral-700 rounded"></div>
                      <div className="h-6 w-16 bg-neutral-300 dark:bg-neutral-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 relative">
          {/* Subtle Vercel glow background */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-8 h-36 -z-10">
            <div className="h-full w-full [mask-image:radial-gradient(50%_50%_at_50%_0%,black,transparent)] bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.35),transparent_50%)]" />
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-1 sm:mb-2">Projects</h1>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400 flex items-center gap-2">
                <FolderKanban className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Manage and monitor all your projects</span>
              </p>
            </div>
            <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-sm">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </motion.div>

          {/* Stats Overview (monochrome + minimal) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">Repositories</p>
                  <p className="text-xl sm:text-2xl font-semibold text-white mt-1">{repos.length}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg border border-white/10 bg-white/5 text-gray-300 flex-shrink-0">
                  <FolderKanban className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">Total Stars</p>
                  <p className="text-xl sm:text-2xl font-semibold text-white mt-1">{totalStars}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg border border-white/10 bg-white/5 text-gray-300 flex-shrink-0">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">Open Issues</p>
                  <p className="text-xl sm:text-2xl font-semibold text-white mt-1">{totalOpenIssues}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg border border-white/10 bg-white/5 text-gray-300 flex-shrink-0">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and View Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between"
          >
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white/5 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-500 border border-gray-200/50 dark:border-white/10 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2 bg-white/5 rounded-lg p-1 border border-white/10 self-start sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* GitHub Repositories Display */}
          {filteredGithubRepos && filteredGithubRepos.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredGithubRepos.map((repo: any, index: number) => (
                  <ProjectCard key={repo.id} repo={repo} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-neutral-950/50 border border-white/10 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 text-left text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 text-left text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Team
                        </th>
                        <th className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 text-center text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Stars
                        </th>
                        <th className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 text-center text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Forks
                        </th>
                        <th className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 text-center text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Issues
                        </th>
                        <th className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 text-center text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredGithubRepos.map((repo: any, index: number) => {
                        return (
                          <motion.tr
                            key={repo.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.6 + index * 0.03 }}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-3 py-3 sm:px-4 md:px-6 sm:py-4">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px] sm:max-w-none">
                                  {repo.name}
                                </div>
                                <a
                                  href={repo.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-white flex-shrink-0"
                                  aria-label={`View ${repo.name} on GitHub`}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </td>
                            <td className="px-3 py-3 sm:px-4 md:px-6 sm:py-4">
                              {repo.language ? (
                                <Badge className="text-[10px] sm:text-xs bg-white/10 text-gray-300 border-white/15 whitespace-nowrap">
                                  {repo.language}
                                </Badge>
                              ) : (
                                <span className="text-xs sm:text-sm text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-3 py-3 sm:px-4 md:px-6 sm:py-4 text-center">
                              <span className="text-xs sm:text-sm font-medium text-gray-300 flex items-center justify-center gap-1">
                                <Star className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <span className="tabular-nums">{repo.stargazers_count || 0}</span>
                              </span>
                            </td>
                            <td className="px-3 py-3 sm:px-4 md:px-6 sm:py-4 text-center">
                              <span className="text-xs sm:text-sm font-medium text-gray-300 flex items-center justify-center gap-1">
                                <GitFork className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <span className="tabular-nums">{repo.forks_count || 0}</span>
                              </span>
                            </td>
                            <td className="px-3 py-3 sm:px-4 md:px-6 sm:py-4 text-center">
                              <span className="text-xs sm:text-sm font-medium text-gray-300 flex items-center justify-center gap-1">
                                <AlertCircle className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <span className="tabular-nums">{repo.open_issues_count || 0}</span>
                              </span>
                            </td>
                            <td className="px-3 py-3 sm:px-4 md:px-6 sm:py-4">
                              <div className="text-[10px] sm:text-xs text-gray-400 text-center tabular-nums">
                                {new Date(repo.updated_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: window.innerWidth >= 640 ? 'numeric' : undefined 
                                })}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-neutral-950/50 border border-white/10 rounded-lg p-8 sm:p-12 text-center"
            >
              <FolderKanban className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Get started by creating your first project'}
              </p>
              {!searchQuery && (
                <Button className="bg-white text-black hover:bg-gray-100 text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
