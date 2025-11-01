'use client';

import { useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { useIssues, useDeleteIssue, useTransitionIssueStatus } from '@/hooks/useIssues';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { Plus, Trash2, Edit2, Search, Grid3x3, List, AlertTriangle, Bug, Clock, Filter, FolderKanban, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { IssueDto, IssueStatus } from '@/types';

type ViewMode = 'kanban' | 'list';

const statusColors: Record<IssueStatus, string> = {
  OPEN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

export default function IssuesPage() {
  const { data: issues, isLoading } = useIssues();
  const { data: projects } = useProjects();
  const { data: users } = useUsers();
  const deleteMutation = useDeleteIssue();
  const transitionMutation = useTransitionIssueStatus();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'ALL'>('ALL');

  const handleDelete = async (id: number, description: string) => {
    if (confirm(`Delete issue #${id}?\n\n${description.substring(0, 80)}${description.length > 80 ? '…' : ''}`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Issue deleted successfully');
      } catch (error) {
        toast.error('Failed to delete issue');
      }
    }
  };

  const handleStatusChange = async (id: number, status: IssueStatus) => {
    try {
      await transitionMutation.mutateAsync({ id, status });
      toast.success('Issue status updated');
    } catch (error) {
      toast.error('Failed to update issue status');
    }
  };

  const getProjectName = (projectId: number) => {
    return projects?.find((p) => p.id === projectId)?.name || 'Unknown';
  };

  const getUserName = (userId: number) => {
    return users?.find((u) => u.id === userId)?.name || 'Unknown';
  };

  // Filter and search
  const filteredIssues = useMemo(() => {
    return issues?.filter((issue) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = issue.description.toLowerCase().includes(q) || String(issue.id).includes(q);
      const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [issues, searchQuery, statusFilter]);

  // Group by status
  const issuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, IssueDto[]> = {
      OPEN: [],
      IN_PROGRESS: [],
      RESOLVED: [],
      CLOSED: [],
    };
    filteredIssues?.forEach((i) => {
      grouped[i.status].push(i);
    });
    return grouped;
  }, [filteredIssues]);

  // Stats
  const stats = useMemo(() => {
    const total = issues?.length || 0;
    return {
      total,
      byStatus: {
        OPEN: issues?.filter((i) => i.status === 'OPEN').length || 0,
        IN_PROGRESS: issues?.filter((i) => i.status === 'IN_PROGRESS').length || 0,
        RESOLVED: issues?.filter((i) => i.status === 'RESOLVED').length || 0,
        CLOSED: issues?.filter((i) => i.status === 'CLOSED').length || 0,
      },
    };
  }, [issues]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="rounded-full h-12 w-12 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent"
            />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Issues</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Track, triage, and resolve issues across projects
              </p>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Issue
            </Button>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm"
            >
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </motion.div>
            {(
              [
                { key: 'OPEN', label: 'Open' },
                { key: 'IN_PROGRESS', label: 'In Progress' },
                { key: 'RESOLVED', label: 'Resolved' },
                { key: 'CLOSED', label: 'Closed' },
              ] as const
            ).map(({ key, label }, idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + (idx + 1) * 0.05 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm"
              >
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.byStatus as any)[key]}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search, Filter, View Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between"
          >
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="relative w-full sm:w-40">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'ALL')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid3x3 className="h-4 w-4 inline mr-1" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="h-4 w-4 inline mr-1" />
                List
              </button>
            </div>
          </motion.div>

          {/* Issues Display */}
          {filteredIssues && filteredIssues.length > 0 ? (
            viewMode === 'kanban' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
                {(['OPEN','IN_PROGRESS','RESOLVED','CLOSED'] as IssueStatus[]).map((status, columnIndex) => (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + columnIndex * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 min-h-[500px]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {status.replace('_', ' ')}
                      </h3>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {issuesByStatus[status]?.length || 0}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {issuesByStatus[status]?.map((issue, idx) => (
                        <motion.div
                          key={issue.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.5 + columnIndex * 0.1 + idx * 0.03 }}
                          whileHover={{ scale: 1.02 }}
                          className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">
                              #{issue.id}: {issue.description}
                            </h4>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                <Edit2 className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(issue.id, issue.description);
                                }}
                                className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                              >
                                <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-3 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <FolderKanban className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{getProjectName(issue.projectId)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{getUserName(issue.userId)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[issue.status]}`}>
                              {issue.status.replace('_', ' ')}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reporter</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredIssues.map((issue, index) => (
                        <motion.tr
                          key={issue.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.03 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                #{issue.id}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                {issue.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">{getProjectName(issue.projectId)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">{getUserName(issue.userId)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                              {issue.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDelete(issue.id, issue.description)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center"
            >
              <AlertTriangle className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery || statusFilter !== 'ALL' ? 'No issues found' : 'No issues yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters or search query'
                  : 'Great job! No issues reported yet'}
              </p>
              {!searchQuery && statusFilter === 'ALL' && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
