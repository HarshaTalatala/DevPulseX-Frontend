'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { useDeployments, useDeleteDeployment } from '@/hooks/useDeployments';
import { useProjects } from '@/hooks/useProjects';
import { Calendar, CheckCircle2, Plus, Search, Trash2, XCircle, Rocket, TrendingUp } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { DeploymentStatus, ProjectDto } from '@/types';

type SortKey = 'timestamp' | 'status' | 'project';

export default function DeploymentsPage() {
  const { data: deployments, isLoading, isError, refetch } = useDeployments();
  const { data: projects } = useProjects();
  const deleteMutation = useDeleteDeployment();

  // UI state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getProjectName = (projectId: number) => {
    return projects?.find((p) => p.id === projectId)?.name || 'Unknown';
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this deployment?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Deployment deleted successfully');
      } catch (error) {
        toast.error('Failed to delete deployment');
      }
    }
  };

  // Derived data
  const metrics = useMemo(() => {
    const total = deployments?.length || 0;
    const success = deployments?.filter((d) => d.status === DeploymentStatus.SUCCESS).length || 0;
    const failed = deployments?.filter((d) => d.status === DeploymentStatus.FAILED).length || 0;
    const successRate = total ? Math.round((success / total) * 100) : 0;
    const last = deployments?.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return { total, success, failed, successRate, last };
  }, [deployments]);

  const filtered = useMemo(() => {
    let data = deployments || [];
    if (statusFilter !== 'ALL') data = data.filter((d) => d.status === statusFilter);
    if (projectFilter !== 'ALL') data = data.filter((d) => String(d.projectId) === projectFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((d) => `#${d.id}`.toLowerCase().includes(q) || getProjectName(d.projectId).toLowerCase().includes(q));
    }
    // sort
    data = data.slice().sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'timestamp') {
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortKey === 'status') {
        cmp = a.status.localeCompare(b.status);
      } else if (sortKey === 'project') {
        cmp = getProjectName(a.projectId).localeCompare(getProjectName(b.projectId));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [deployments, statusFilter, projectFilter, search, sortKey, sortDir, projects]);

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const projectOptions = useMemo(() => {
    const opts = (projects || []) as ProjectDto[];
    return [
      { value: 'ALL', label: 'All projects' },
      ...opts.map((p) => ({ value: String(p.id), label: p.name })),
    ];
  }, [projects]);

  const statusOptions = [
    { value: 'ALL', label: 'All statuses' },
    { value: DeploymentStatus.PENDING, label: 'Pending' },
    { value: DeploymentStatus.IN_PROGRESS, label: 'In Progress' },
    { value: DeploymentStatus.SUCCESS, label: 'Success' },
    { value: DeploymentStatus.FAILED, label: 'Failed' },
  ];

  const changeSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Loading state - Vercel Style
  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen bg-white dark:bg-black">
            <div className="space-y-6 sm:space-y-8">
              {/* Header Skeleton */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-3 w-full md:w-auto">
                  <div className="h-7 w-32 bg-gray-100 dark:bg-neutral-900 rounded-full animate-pulse border border-gray-200 dark:border-neutral-800" />
                  <div className="h-8 sm:h-10 w-48 sm:w-64 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse border border-gray-200 dark:border-neutral-800" />
                  <div className="h-4 w-56 sm:w-72 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse border border-gray-200 dark:border-neutral-800" />
                </div>
                <div className="h-10 w-full sm:w-40 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse border border-gray-200 dark:border-neutral-800" />
              </div>

              {/* Stats Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-800 p-4 sm:p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="h-3 w-24 sm:w-32 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                        <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                      </div>
                      <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse flex-shrink-0 ml-3" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Filters Skeleton */}
              <div className="bg-white dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-800 p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="h-10 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                  <div className="h-10 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                  <div className="h-10 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-24 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                  <div className="h-10 w-20 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                  <div className="h-10 w-20 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Table Skeleton */}
              <div className="bg-white dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
                      <tr>
                        {['Project', 'ID', 'Status', 'Deployed At', 'Age', 'Actions'].map((header, i) => (
                          <th key={i} className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                            <div className="h-3 w-16 sm:w-20 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                      {[...Array(5)].map((_, i) => (
                        <tr key={i}>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-4 w-24 sm:w-32 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-6 w-12 sm:w-16 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-6 w-16 sm:w-20 bg-gray-100 dark:bg-neutral-900 rounded-full animate-pulse" />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-4 w-28 sm:w-36 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-4 w-16 sm:w-20 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-8 w-8 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse ml-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-white dark:bg-black">
          <div className="space-y-6 sm:space-y-8">
            {/* Header - Vercel Style */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800"
                  >
                    <Rocket className="h-3.5 w-3.5 text-black dark:text-white" />
                    <span className="text-xs font-medium text-black dark:text-white">Deployments</span>
                  </motion.div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white">
                    Ship with confidence
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Monitor every deployment across your projects in real-time
                  </p>
                </div>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 border border-black dark:border-white text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Deployment</span>
                </motion.button>
              </div>
            </motion.div>

            {/* KPIs - Vercel Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200"
              >
                <div className="relative flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Total Deployments</p>
                    <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white mt-2">{metrics.total}</p>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="p-2 sm:p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg flex-shrink-0 ml-3"
                  >
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-black dark:text-white"/>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200"
              >
                <div className="relative flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Success Rate</p>
                    <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white mt-2">{metrics.successRate}%</p>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.45 }}
                    className="p-2 sm:p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg flex-shrink-0 ml-3"
                  >
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-black dark:text-white"/>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200"
              >
                <div className="relative flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Failures</p>
                    <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white mt-2">{metrics.failed}</p>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="p-2 sm:p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg flex-shrink-0 ml-3"
                  >
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-black dark:text-white"/>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Controls - Vercel Style */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5"
            >
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:items-end lg:justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 flex-1">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 z-10" />
                    <Input
                      placeholder="Search deployments..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      className="pl-9 sm:pl-10 py-2 sm:py-2.5 text-xs sm:text-sm bg-white dark:bg-black border-gray-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                  <Select
                    value={projectFilter}
                    onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
                    options={projectOptions}
                  />
                  <Select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    options={statusOptions}
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={String(pageSize)}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    options={[{value:'10',label:'10 / page'},{value:'20',label:'20 / page'},{value:'50',label:'50 / page'}]}
                  />
                  <Button 
                    variant="outline" 
                    className="text-xs sm:text-sm px-3 sm:px-4"
                    onClick={() => {
                      // export current filtered data to CSV
                      const rows = [
                        ['ID','Project','Status','Timestamp'],
                        ...filtered.map(d => [
                          `#${d.id}`,
                          getProjectName(d.projectId),
                          d.status,
                          new Date(d.timestamp).toISOString(),
                        ])
                      ];
                      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'\"')}"`).join(',')).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'deployments.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-xs sm:text-sm px-3 sm:px-4"
                    onClick={() => { setSearch(''); setProjectFilter('ALL'); setStatusFilter('ALL'); setSortKey('timestamp'); setSortDir('desc'); setPage(1); }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Table - Vercel Style */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} 
              className="relative overflow-hidden bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg"
            >
              {isError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="m-4 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-black dark:text-white flex items-center justify-between"
                >
                  <span className="font-medium text-xs sm:text-sm">Failed to load deployments. Please try again.</span>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
                </motion.div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => changeSort('project')}>
                        Project {sortKey==='project' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider">ID</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => changeSort('status')}>
                        Status {sortKey==='status' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => changeSort('timestamp')}>
                        Deployed At {sortKey==='timestamp' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider">Age</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                    <AnimatePresence mode="popLayout">
                      {pageData.map((deployment, index) => (
                        <motion.tr 
                          key={deployment.id}
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }} 
                          className="hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-black dark:text-white truncate max-w-[120px] sm:max-w-none">{getProjectName(deployment.projectId)}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-[10px] sm:text-xs font-mono font-medium text-gray-700 dark:text-neutral-300">
                              #{deployment.id}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${
                              deployment.status === DeploymentStatus.SUCCESS 
                                ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black'
                                : deployment.status === DeploymentStatus.FAILED
                                ? 'bg-gray-200 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-black dark:text-white'
                                : deployment.status === DeploymentStatus.IN_PROGRESS
                                ? 'bg-gray-100 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-black dark:text-white animate-pulse'
                                : 'bg-white dark:bg-black border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400'
                            }`}>
                              <span className="hidden sm:inline">{deployment.status.replace('_', ' ')}</span>
                              <span className="sm:hidden">{deployment.status === DeploymentStatus.IN_PROGRESS ? 'Progress' : deployment.status}</span>
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-neutral-400">
                            {formatDateTime(deployment.timestamp)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-neutral-400">
                            {formatRelativeTime(deployment.timestamp)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                            <motion.button
                              onClick={() => handleDelete(deployment.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-lg transition-all duration-200 group"
                              aria-label={`Delete deployment ${deployment.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors"/>
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 sm:py-16"
                  >
                    <Rocket className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 dark:text-neutral-700 mx-auto mb-3" />
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">No deployments found</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-500 mt-1">Try adjusting your filters</p>
                  </motion.div>
                )}
              {/* Pagination */}
              {filtered.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-neutral-800">
                  <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-neutral-400">
                    Showing {(page-1)*pageSize + 1}–{Math.min(page*pageSize, filtered.length)} of {filtered.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs" disabled={page===1} onClick={() => setPage((p)=>Math.max(1,p-1))}>Previous</Button>
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white px-2">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" className="text-xs" disabled={page===totalPages} onClick={() => setPage((p)=>Math.min(totalPages,p+1))}>Next</Button>
                  </div>
                </div>
              )}
              </div>
            </motion.div>

            {/* Last deployment callout - Vercel Style */}
            {metrics.last && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-neutral-950 dark:to-black border border-dashed border-gray-300 dark:border-neutral-700 rounded-lg p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium border ${
                      metrics.last.status === DeploymentStatus.SUCCESS 
                        ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black'
                        : metrics.last.status === DeploymentStatus.FAILED
                        ? 'bg-gray-200 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-black dark:text-white'
                        : metrics.last.status === DeploymentStatus.IN_PROGRESS
                        ? 'bg-gray-100 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-black dark:text-white animate-pulse'
                        : 'bg-white dark:bg-black border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400'
                    }`}>
                      <span className="hidden sm:inline">{metrics.last.status.replace('_', ' ')}</span>
                      <span className="sm:hidden">{metrics.last.status === DeploymentStatus.IN_PROGRESS ? 'Progress' : metrics.last.status}</span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-black dark:text-white truncate">
                        Latest deployment • {formatDateTime(metrics.last.timestamp)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-neutral-400 mt-0.5 truncate">
                        {getProjectName(metrics.last.projectId)} • #{metrics.last.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-900 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-200 dark:border-neutral-800 self-start sm:self-auto">
                    {formatRelativeTime(metrics.last.timestamp)}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
