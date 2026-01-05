'use client';

import { useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { useIssues, useDeleteIssue, useTransitionIssueStatus, useCreateIssue, useUpdateIssue } from '@/hooks/useIssues';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { Plus, Trash2, Edit2, Search, Grid3x3, List, AlertTriangle, Bug, Clock, Filter, FolderKanban, User, Sparkles, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { IssueDto, IssueStatus } from '@/types';
import IssueModal, { IssueFormValues } from '@/components/IssueModal';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

type ViewMode = 'kanban' | 'list';

const statusColors: Record<IssueStatus, string> = {
  OPEN: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 dark:from-gray-900/50 dark:to-gray-800/50 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50',
  IN_PROGRESS: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 dark:from-gray-800/50 dark:to-gray-700/50 dark:text-gray-200 border border-gray-300/50 dark:border-gray-600/50',
  RESOLVED: 'bg-gradient-to-br from-gray-900 to-gray-800 text-white dark:from-white/90 dark:to-gray-100/90 dark:text-gray-900 border border-gray-700/50 dark:border-white/20',
  CLOSED: 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900 dark:from-gray-600/50 dark:to-gray-500/50 dark:text-gray-100 border border-gray-400/50 dark:border-gray-500/50',
};

const statusGradients: Record<IssueStatus, string> = {
  OPEN: 'from-gray-400/10 via-gray-500/10 to-gray-600/10',
  IN_PROGRESS: 'from-gray-500/15 via-gray-600/15 to-gray-700/15',
  RESOLVED: 'from-gray-700/25 via-gray-800/25 to-gray-900/25',
  CLOSED: 'from-gray-500/15 via-gray-600/15 to-gray-700/15',
};

export default function IssuesPage() {
  const { data: issues, isLoading } = useIssues();
  const { data: projects } = useProjects();
  const { data: users } = useUsers();
  const deleteMutation = useDeleteIssue();
  const transitionMutation = useTransitionIssueStatus();
  const createMutation = useCreateIssue();
  const updateMutation = useUpdateIssue();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<IssueDto | null>(null);

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

  const handleCreateOrUpdate = async (values: IssueFormValues) => {
    try {
      if (editingIssue) {
        await updateMutation.mutateAsync({ id: editingIssue.id, data: values });
        toast.success('Issue updated');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Issue reported');
      }
    } catch (e) {
      toast.error('Failed to save issue');
    } finally {
      setEditingIssue(null);
      setModalOpen(false);
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
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="h-10 sm:h-12 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded-xl w-32 sm:w-48"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded-lg w-48 sm:w-72"></div>
              </div>
              <div className="h-10 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded-xl w-full sm:w-40"></div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 sm:p-5"
                >
                  <div className="h-3 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded w-16 mx-auto mb-3"></div>
                  <div className="h-8 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded-lg w-12 mx-auto"></div>
                </div>
              ))}
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="h-11 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded-xl w-full sm:w-80"></div>
                <div className="h-11 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded-xl w-full sm:w-44"></div>
              </div>
              <div className="h-11 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded-xl w-44"></div>
            </div>

            {/* Kanban Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 min-h-[300px] sm:min-h-[500px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded w-24"></div>
                    <div className="h-6 w-8 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, cardIdx) => (
                      <div
                        key={cardIdx}
                        className="bg-white/80 dark:bg-black/40 border border-gray-200/50 dark:border-white/10 rounded-xl p-3 sm:p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-6 w-6 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded"></div>
                          <div className="h-5 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded w-full mb-3"></div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-white/5">
                          <div className="h-6 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded w-20"></div>
                          <div className="h-6 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
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
        {/* Vercel-style monochrome background gradient */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-gray-400/10 via-gray-500/10 to-gray-600/10 dark:from-gray-600/20 dark:via-gray-700/20 dark:to-gray-800/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-60 -left-40 w-96 h-96 bg-gradient-to-br from-gray-300/8 via-gray-400/8 to-gray-500/8 dark:from-gray-700/15 dark:via-gray-800/15 dark:to-gray-900/15 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 relative">
          {/* Header with Vercel-style glass effect */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-gray-500/10 via-gray-600/10 to-gray-700/10 border border-gray-400/20 dark:border-gray-500/20"
                >
                  <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Issue Tracking</span>
                </motion.div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                  Issues
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2 max-w-2xl">
                  <Bug className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="line-clamp-2">Track, triage, and resolve issues with precision and clarity</span>
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full sm:w-auto"
              >
                <Button
                  className="w-full sm:w-auto bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-black hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/20 transition-all duration-300 border-0"
                  onClick={() => {
                    setEditingIssue(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Overview - Vercel Style */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative text-center">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 uppercase tracking-wide">Total</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{stats.total}</p>
              </div>
            </motion.div>
            {(
              [
                { key: 'OPEN', label: 'Open', colors: { from: 'from-gray-500', to: 'to-gray-400', glow: 'group-hover:shadow-gray-500/20' } },
                { key: 'IN_PROGRESS', label: 'In Progress', colors: { from: 'from-gray-600', to: 'to-gray-500', glow: 'group-hover:shadow-gray-600/20' } },
                { key: 'RESOLVED', label: 'Resolved', colors: { from: 'from-gray-900', to: 'to-gray-700', glow: 'group-hover:shadow-gray-900/20' } },
                { key: 'CLOSED', label: 'Closed', colors: { from: 'from-gray-600', to: 'to-gray-500', glow: 'group-hover:shadow-gray-600/20' } },
              ] as const
            ).map(({ key, label, colors }, idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + (idx + 1) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={`group relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-lg dark:hover:shadow-2xl ${colors.glow} transition-all duration-300`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${statusGradients[key]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative text-center">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className={`text-2xl sm:text-3xl font-bold bg-gradient-to-br ${colors.from} ${colors.to} bg-clip-text text-transparent`}>{(stats.byStatus as any)[key]}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search, Filter, and View Toggle - Vercel Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-3 items-center justify-between"
          >
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="relative w-full sm:w-80"
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white/60 dark:bg-black/40 backdrop-blur-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 focus:border-transparent outline-none text-sm shadow-sm hover:shadow-md transition-all duration-200"
                />
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="relative w-full sm:w-44"
              >
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'ALL')}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white/60 dark:bg-black/40 backdrop-blur-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 focus:border-transparent outline-none text-sm appearance-none cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="ALL">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </motion.div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="flex gap-1 bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50 dark:border-white/5"
            >
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Issues Display */}
          {filteredIssues && filteredIssues.length > 0 ? (
            viewMode === 'kanban' ? (
              <DndContext
                onDragEnd={(event: DragEndEvent) => {
                  const { active, over } = event;
                  if (!over) return;
                  const issueId = Number(active.id);
                  const newStatus = over.id as IssueStatus;
                  const issue = issues?.find((i) => i.id === issueId);
                  if (issue && issue.status !== newStatus) {
                    handleStatusChange(issueId, newStatus);
                  }
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto pb-4">
                  {(['OPEN','IN_PROGRESS','RESOLVED','CLOSED'] as IssueStatus[]).map((status, columnIndex) => {
                    const columnColors = {
                      OPEN: { gradient: 'from-gray-400/8 via-gray-500/5 to-transparent', border: 'border-gray-200/50 dark:border-gray-700/50' },
                      IN_PROGRESS: { gradient: 'from-gray-500/10 via-gray-600/5 to-transparent', border: 'border-gray-300/50 dark:border-gray-600/50' },
                      RESOLVED: { gradient: 'from-gray-700/15 via-gray-800/8 to-transparent', border: 'border-gray-500/50 dark:border-gray-400/50' },
                      CLOSED: { gradient: 'from-gray-500/10 via-gray-600/5 to-transparent', border: 'border-gray-300/50 dark:border-gray-600/50' },
                    }[status];

                    return (
                      <motion.div
                        key={status}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 + columnIndex * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className={`relative overflow-hidden bg-white/60 dark:bg-black/30 backdrop-blur-2xl border ${columnColors.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 min-h-[400px] sm:min-h-[500px] shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)]`}
                      >
                        {/* Subtle gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${columnColors.gradient} pointer-events-none`} />
                        
                        <DroppableColumn id={status}>
                          <div className="relative flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm uppercase tracking-wide">
                              {status.replace('_', ' ')}
                            </h3>
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.5 + columnIndex * 0.08 + 0.2 }}
                              className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-200/80 dark:bg-white/10 px-2 sm:px-2.5 py-1 rounded-full backdrop-blur-sm"
                            >
                              {issuesByStatus[status]?.length || 0}
                            </motion.span>
                          </div>
                          <div className="relative space-y-2 sm:space-y-3">
                            {issuesByStatus[status]?.map((issue, idx) => (
                              <DraggableIssueCard
                                key={issue.id}
                                id={issue.id}
                                issue={issue}
                                index={idx}
                                columnIndex={columnIndex}
                                onEdit={() => {
                                  setEditingIssue(issue);
                                  setModalOpen(true);
                                }}
                                onDelete={() => handleDelete(issue.id, issue.description)}
                                getProjectName={getProjectName}
                                getUserName={getUserName}
                                statusColors={statusColors}
                              />
                            ))}
                          </div>
                        </DroppableColumn>
                      </motion.div>
                    );
                  })}
                </div>
              </DndContext>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-xl sm:rounded-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)] overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm border-b border-gray-200/50 dark:border-white/10">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Issue</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Project</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Reporter</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50 dark:divide-white/5">
                      {filteredIssues.map((issue, index) => (
                        <motion.tr
                          key={issue.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 + index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                          className="group hover:bg-gray-50/80 dark:hover:bg-white/5 transition-all duration-200"
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                #{issue.id}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                {issue.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="text-xs sm:text-sm text-gray-900 dark:text-white">{getProjectName(issue.projectId)}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="text-xs sm:text-sm text-gray-900 dark:text-white">{getUserName(issue.userId)}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                            <select
                              value={issue.status}
                              onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                              className={`text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${statusColors[issue.status]} cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20`}
                            >
                              <option value="OPEN">Open</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="CLOSED">Closed</option>
                            </select>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setEditingIssue(issue); setModalOpen(true); }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(issue.id, issue.description)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </motion.button>
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
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-xl sm:rounded-2xl p-8 sm:p-12 lg:p-16 text-center shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)]"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-gray-600/5 to-gray-700/5 dark:from-gray-600/10 dark:via-gray-700/10 dark:to-gray-800/10" />
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative"
              >
                <AlertTriangle className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 dark:text-gray-700 mx-auto mb-4 sm:mb-6" />
              </motion.div>
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                {searchQuery || statusFilter !== 'ALL' ? 'No issues found' : 'No issues yet'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters or search query to find what you\'re looking for'
                  : 'Great job! No issues have been reported yet. Keep up the excellent work!'}
              </p>
              {!searchQuery && statusFilter === 'ALL' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  <Button
                    className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-black hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/20 transition-all duration-300"
                    onClick={() => { setEditingIssue(null); setModalOpen(true); }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Report First Issue
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
        <IssueModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingIssue(null); }}
          onSubmit={handleCreateOrUpdate}
          initial={editingIssue}
          projects={projects}
          users={users}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// DnD helpers
function DraggableIssueCard({
  id,
  issue,
  index,
  columnIndex,
  onEdit,
  onDelete,
  getProjectName,
  getUserName,
  statusColors,
}: {
  id: number;
  issue: IssueDto;
  index: number;
  columnIndex: number;
  onEdit: () => void;
  onDelete: () => void;
  getProjectName: (id: number) => string;
  getUserName: (id: number) => string;
  statusColors: Record<IssueStatus, string>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 + columnIndex * 0.08 + index * 0.03, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.2 } }}
        className={`group cursor-grab active:cursor-grabbing relative overflow-hidden bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_4px_8px_rgba(0,0,0,0.3)] hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 ${isDragging ? 'ring-2 ring-red-500 dark:ring-red-400 shadow-2xl opacity-80' : ''}`}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-gray-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs font-bold bg-gradient-to-br from-gray-700 to-gray-800 dark:from-gray-400 dark:to-gray-500 text-white dark:text-gray-900 rounded-md shadow-sm">
                  {issue.id}
                </span>
                <span className={`inline-flex px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold ${statusColors[issue.status]}`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                {issue.description}
              </h4>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1 sm:p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              >
                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-600 dark:text-red-400" />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200/50 dark:border-white/5">
            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100/80 dark:bg-white/5 rounded-md">
              <FolderKanban className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500 dark:text-gray-400" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate max-w-[80px] sm:max-w-[100px]">
                {getProjectName(issue.projectId)}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100/80 dark:bg-white/5 rounded-md">
              <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500 dark:text-gray-400" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate max-w-[60px] sm:max-w-[80px]">
                {getUserName(issue.userId)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DroppableColumn({ id, children }: { id: IssueStatus; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  const dropColors = {
    OPEN: 'ring-gray-400/50 bg-gray-400/5',
    IN_PROGRESS: 'ring-gray-500/50 bg-gray-500/5',
    RESOLVED: 'ring-gray-800/50 bg-gray-800/5',
    CLOSED: 'ring-gray-600/50 bg-gray-600/5',
  }[id] || 'ring-gray-500/50 bg-gray-500/5';
  
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[480px] rounded-xl transition-all duration-300 ${
        isOver ? `ring-2 ${dropColors}` : ''
      }`}
    >
      {children}
    </div>
  );
}
