'use client';

import { useState, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTasks, useDeleteTask, useTransitionTaskStatus, useCreateTask, useUpdateTask, useAssignTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { Plus, Trash2, Edit2, CheckSquare, Search, Grid3x3, List, Calendar, User, FolderKanban, Clock, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { TaskDto, TaskStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import TaskModal, { TaskFormValues } from '@/components/TaskModal';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

type ViewMode = 'kanban' | 'list';

const statusColors = {
  TODO: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 dark:from-gray-900/50 dark:to-gray-800/50 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50',
  IN_PROGRESS: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 dark:from-gray-800/50 dark:to-gray-700/50 dark:text-gray-200 border border-gray-300/50 dark:border-gray-600/50',
  REVIEW: 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900 dark:from-gray-700/50 dark:to-gray-600/50 dark:text-gray-100 border border-gray-400/50 dark:border-gray-500/50',
  DONE: 'bg-gradient-to-br from-gray-900 to-gray-800 text-white dark:from-white/90 dark:to-gray-100/90 dark:text-gray-900 border border-gray-700/50 dark:border-white/20',
  BLOCKED: 'bg-gradient-to-br from-gray-600 to-gray-700 text-white dark:from-gray-500/50 dark:to-gray-400/50 dark:text-gray-100 border border-gray-600/50 dark:border-gray-400/50',
};

const statusGradients = {
  TODO: 'from-gray-400/10 via-gray-500/10 to-gray-600/10',
  IN_PROGRESS: 'from-gray-500/15 via-gray-600/15 to-gray-700/15',
  REVIEW: 'from-gray-600/20 via-gray-700/20 to-gray-800/20',
  DONE: 'from-gray-700/25 via-gray-800/25 to-gray-900/25',
  BLOCKED: 'from-gray-500/15 via-gray-600/15 to-gray-700/15',
};

export default function TasksPage() {
  const { data: tasks, isLoading } = useTasks();
  const { data: projects } = useProjects();
  const { data: users } = useUsers();
  const deleteMutation = useDeleteTask();
  const transitionMutation = useTransitionTaskStatus();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const assignMutation = useAssignTask();
  
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (id: number, status: TaskStatus) => {
    try {
      await transitionMutation.mutateAsync({ id, status });
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleAssignChange = async (task: TaskDto, value: string) => {
    try {
      if (!value) {
        // Clear assignee via update
        const { id, ...rest } = task;
        await updateMutation.mutateAsync({ id, data: { ...rest, assignedUserId: undefined } });
        toast.success('Unassigned task');
      } else {
        await assignMutation.mutateAsync({ id: task.id, userId: Number(value) });
        toast.success('Assignee updated');
      }
    } catch {
      toast.error('Failed to update assignee');
    }
  };

  const handleCreateOrUpdate = async (values: TaskFormValues) => {
    try {
      if (editingTask) {
        await updateMutation.mutateAsync({ id: editingTask.id, data: values });
        toast.success('Task updated');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Task created');
      }
    } catch (e) {
      toast.error('Failed to save task');
    } finally {
      setEditingTask(null);
      setModalOpen(false);
    }
  };

  const getProjectName = (projectId: number) => {
    return projects?.find((p) => p.id === projectId)?.name || 'Unknown';
  };

  const getUserName = (userId: number) => {
    return users?.find((u) => u.id === userId)?.name || 'Unassigned';
  };

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks?.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

  // Group tasks by status for kanban view
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, TaskDto[]> = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
      BLOCKED: [],
    };
    
    filteredTasks?.forEach((task) => {
      grouped[task.status].push(task);
    });
    
    return grouped;
  }, [filteredTasks]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = tasks?.length || 0;
    const byStatus = {
      TODO: tasks?.filter(t => t.status === 'TODO').length || 0,
      IN_PROGRESS: tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0,
      REVIEW: tasks?.filter(t => t.status === 'REVIEW').length || 0,
      DONE: tasks?.filter(t => t.status === 'DONE').length || 0,
      BLOCKED: tasks?.filter(t => t.status === 'BLOCKED').length || 0,
    };
    const overdue = tasks?.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length || 0;
    
    return { total, byStatus, overdue };
  }, [tasks]);

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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, colIdx) => (
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
                        <div className="h-4 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded w-2/3 mb-3"></div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-white/5">
                          <div className="h-7 w-7 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-white/10 dark:to-white/5 rounded-full"></div>
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
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Task Management</span>
                </motion.div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                  Tasks
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2 max-w-2xl">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="line-clamp-2">Track and manage your tasks with an intuitive, drag-and-drop interface</span>
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
                    setEditingTask(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Overview - Vercel Style */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
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

            {Object.entries(stats.byStatus).map(([status, count], index) => {
              const colors = {
                TODO: { from: 'from-gray-500', to: 'to-gray-400', glow: 'group-hover:shadow-gray-500/20' },
                IN_PROGRESS: { from: 'from-gray-600', to: 'to-gray-500', glow: 'group-hover:shadow-gray-600/20' },
                REVIEW: { from: 'from-gray-700', to: 'to-gray-600', glow: 'group-hover:shadow-gray-700/20' },
                DONE: { from: 'from-gray-900', to: 'to-gray-700', glow: 'group-hover:shadow-gray-900/20' },
                BLOCKED: { from: 'from-gray-600', to: 'to-gray-500', glow: 'group-hover:shadow-gray-600/20' },
              }[status] || { from: 'from-gray-600', to: 'to-gray-400', glow: '' };

              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + (index + 1) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className={`group relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-lg dark:hover:shadow-2xl ${colors.glow} transition-all duration-300`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${statusGradients[status as TaskStatus]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative text-center">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 uppercase tracking-wide">
                      {status.replace('_', ' ')}
                    </p>
                    <p className={`text-2xl sm:text-3xl font-bold bg-gradient-to-br ${colors.from} ${colors.to} bg-clip-text text-transparent`}>{count}</p>
                  </div>
                </motion.div>
              );
            })}
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
                  placeholder="Search tasks..."
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
                  onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white/60 dark:bg-black/40 backdrop-blur-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 focus:border-transparent outline-none text-sm appearance-none cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="ALL">All Status</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                  <option value="BLOCKED">Blocked</option>
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

          {/* Tasks Display */}
          {filteredTasks && filteredTasks.length > 0 ? (
            viewMode === 'kanban' ? (
              <DndContext
                onDragEnd={(event: DragEndEvent) => {
                  const { active, over } = event;
                  if (!over) return;
                  const taskId = Number(active.id);
                  const newStatus = over.id as TaskStatus;
                  const task = tasks?.find((t) => t.id === taskId);
                  if (task && task.status !== newStatus) {
                    handleStatusChange(taskId, newStatus);
                  }
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-4">
                  {Object.entries(tasksByStatus).map(([status, statusTasks], columnIndex) => {
                    const columnColors = {
                      TODO: { gradient: 'from-gray-400/8 via-gray-500/5 to-transparent', border: 'border-gray-200/50 dark:border-gray-700/50' },
                      IN_PROGRESS: { gradient: 'from-gray-500/10 via-gray-600/5 to-transparent', border: 'border-gray-300/50 dark:border-gray-600/50' },
                      REVIEW: { gradient: 'from-gray-600/12 via-gray-700/6 to-transparent', border: 'border-gray-400/50 dark:border-gray-500/50' },
                      DONE: { gradient: 'from-gray-700/15 via-gray-800/8 to-transparent', border: 'border-gray-500/50 dark:border-gray-400/50' },
                      BLOCKED: { gradient: 'from-gray-500/10 via-gray-600/5 to-transparent', border: 'border-gray-300/50 dark:border-gray-600/50' },
                    }[status] || { gradient: 'from-gray-500/10 via-gray-400/5 to-transparent', border: 'border-gray-200/50 dark:border-gray-700/50' };

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
                        
                        <DroppableColumn id={status as TaskStatus}>
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
                              {statusTasks?.length || 0}
                            </motion.span>
                          </div>
                    
                          <div className="relative space-y-2 sm:space-y-3">
                            {statusTasks?.map((task, index) => {
                              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                              
                              return (
                                <DraggableTaskCard
                                  key={task.id}
                                  id={task.id}
                                  columnIndex={columnIndex}
                                  index={index}
                                  isOverdue={!!isOverdue}
                                  task={task}
                                  onEdit={() => {
                                    setEditingTask(task);
                                    setModalOpen(true);
                                  }}
                                  onDelete={() => handleDelete(task.id, task.title)}
                                  getProjectName={getProjectName}
                                  getUserName={getUserName}
                                />
                              );
                            })}
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
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm border-b border-gray-200/50 dark:border-white/10">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Task
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50 dark:divide-white/5">
                      {filteredTasks.map((task, index) => {
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                        
                        return (
                          <motion.tr
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.5 + index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                            className="group hover:bg-gray-50/80 dark:hover:bg-white/5 transition-all duration-200"
                          >
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                  {task.title}
                                </div>
                                {task.description && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                    {task.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                                {getProjectName(task.projectId)}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.3, delay: 0.5 + index * 0.03 + 0.1 }}
                                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                >
                                  {(task.assignedUserId ? getUserName(task.assignedUserId) : 'U').charAt(0).toUpperCase()}
                                </motion.div>
                                <select
                                  value={task.assignedUserId ?? ''}
                                  onChange={(e) => handleAssignChange(task, e.target.value)}
                                  className="text-xs sm:text-sm bg-white/60 dark:bg-black/40 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20"
                                >
                                  <option value="">Unassigned</option>
                                  {(users ?? []).map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                                className={`text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${statusColors[task.status]} cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20`}
                              >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="REVIEW">Review</option>
                                <option value="DONE">Done</option>
                                <option value="BLOCKED">Blocked</option>
                              </select>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                              {task.dueDate ? (
                                <span className={`text-xs sm:text-sm ${
                                  isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-900 dark:text-white'
                                }`}>
                                  {formatDate(task.dueDate)}
                                </span>
                              ) : (
                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => { setEditingTask(task); setModalOpen(true); }}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                >
                                  <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDelete(task.id, task.title)}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </motion.button>
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
                <CheckSquare className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 dark:text-gray-700 mx-auto mb-4 sm:mb-6" />
              </motion.div>
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                {searchQuery || statusFilter !== 'ALL' ? 'No tasks found' : 'No tasks yet'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters or search query to find what you\'re looking for'
                  : 'Get started by creating your first task and begin tracking your work'}
              </p>
              {!searchQuery && statusFilter === 'ALL' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  <Button
                    className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-black hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/20 transition-all duration-300"
                    onClick={() => {
                      setEditingTask(null);
                      setModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Task
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
        <TaskModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onSubmit={handleCreateOrUpdate}
          initial={editingTask}
          projects={projects}
          users={users}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// DnD helpers
function DraggableTaskCard({
  id,
  task,
  index,
  columnIndex,
  isOverdue,
  onEdit,
  onDelete,
  getProjectName,
  getUserName,
}: {
  id: number;
  task: TaskDto;
  index: number;
  columnIndex: number;
  isOverdue: boolean;
  onEdit: () => void;
  onDelete: () => void;
  getProjectName: (id: number) => string;
  getUserName: (id: number) => string;
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
        className={`group cursor-grab active:cursor-grabbing relative overflow-hidden bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_4px_8px_rgba(0,0,0,0.3)] hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 ${isDragging ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-2xl opacity-80' : ''}`}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-gray-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 pr-2">
              {task.title}
            </h4>
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

          {task.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100/80 dark:bg-white/5 rounded-md">
              <FolderKanban className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate max-w-[100px] sm:max-w-[120px]">
                {getProjectName(task.projectId)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200/50 dark:border-white/5">
            {task.assignedUserId ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + columnIndex * 0.08 + index * 0.03 + 0.1 }}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 dark:from-gray-400 dark:via-gray-500 dark:to-gray-600 flex items-center justify-center text-white dark:text-gray-900 text-xs font-bold shadow-md"
                >
                  {getUserName(task.assignedUserId).charAt(0).toUpperCase()}
                </motion.div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[70px] sm:max-w-[90px]">
                  {getUserName(task.assignedUserId).split(' ')[0]}
                </span>
              </div>
            ) : (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Unassigned</span>
            )}

            {task.dueDate && (
              <div className={`flex items-center gap-1 sm:gap-1.5 text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ${
                isOverdue
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100/80 dark:bg-white/5 text-gray-600 dark:text-gray-400'
              }`}>
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="text-xs">{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DroppableColumn({ id, children }: { id: TaskStatus; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  const dropColors = {
    TODO: 'ring-gray-400/50 bg-gray-400/5',
    IN_PROGRESS: 'ring-gray-500/50 bg-gray-500/5',
    REVIEW: 'ring-gray-600/50 bg-gray-600/5',
    DONE: 'ring-gray-800/50 bg-gray-800/5',
    BLOCKED: 'ring-gray-500/50 bg-gray-500/5',
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
