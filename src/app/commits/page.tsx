'use client';

import { useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { useCommits, useDeleteCommit } from '@/hooks/useCommits';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { Plus, Trash2, Search, List, BarChart3, GitCommit, Calendar, User, FolderKanban, Sparkles, GitBranch } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

type ViewMode = 'list' | 'chart';

export default function CommitsPage() {
  const { data: commits, isLoading } = useCommits();
  const { data: projects } = useProjects();
  const { data: users } = useUsers();
  const deleteMutation = useDeleteCommit();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<number | 'ALL'>('ALL');
  const [userFilter, setUserFilter] = useState<number | 'ALL'>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const handleDelete = async (id: number, message: string) => {
    if (confirm(`Delete commit #${id}?\n\n${message.substring(0, 80)}${message.length > 80 ? '…' : ''}`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Commit deleted successfully');
      } catch (error) {
        toast.error('Failed to delete commit');
      }
    }
  };

  const getProjectName = (projectId: number) => {
    return projects?.find((p) => p.id === projectId)?.name || 'Unknown';
  };

  const getUserName = (userId: number) => {
    return users?.find((u) => u.id === userId)?.name || 'Unknown';
  };

  // filtering
  const filteredCommits = useMemo(() => {
    return commits?.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesText = c.message.toLowerCase().includes(q) || String(c.id).includes(q);
      const matchesProject = projectFilter === 'ALL' || c.projectId === projectFilter;
      const matchesUser = userFilter === 'ALL' || c.userId === userFilter;
      const ts = new Date(c.timestamp).getTime();
      const afterFrom = !fromDate || ts >= new Date(fromDate).getTime();
      const beforeTo = !toDate || ts <= new Date(toDate).getTime() + 24*60*60*1000 - 1;
      return matchesText && matchesProject && matchesUser && afterFrom && beforeTo;
    }) || [];
  }, [commits, searchQuery, projectFilter, userFilter, fromDate, toDate]);

  // stats
  const stats = useMemo(() => {
    const total = filteredCommits.length;
    const uniqueUsers = new Set(filteredCommits.map(c => c.userId)).size;
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const commitsToday = filteredCommits.filter(c => new Date(c.timestamp).getTime() >= startOfToday).length;
    return { total, uniqueUsers, commitsToday };
  }, [filteredCommits]);

  // commits per day (last 14 days)
  const commitsPerDay = useMemo(() => {
    const days = 14;
    const arr: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = filteredCommits.filter(c => c.timestamp.slice(0,10) === key).length;
      arr.push({ date: key.slice(5), count });
    }
    return arr;
  }, [filteredCommits]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="rounded-full h-12 w-12 border-4 border-t-gray-600 border-r-gray-200/20 border-b-gray-200/20 border-l-gray-200/20 dark:border-t-gray-400 dark:border-r-gray-800/20 dark:border-b-gray-800/20 dark:border-l-gray-800/20"
            />
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

        <div className="space-y-8 relative">
          {/* Header with Vercel-style glass effect */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-500/10 via-gray-600/10 to-gray-700/10 border border-gray-400/20 dark:border-gray-500/20"
                >
                  <GitBranch className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Version Control</span>
                </motion.div>
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                  Commits
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-400 flex items-center gap-2 max-w-2xl">
                  <GitCommit className="h-4 w-4" />
                  Track code changes and development activity across all projects
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button className="w-full sm:w-auto bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-black hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/20 transition-all duration-300 border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  New Commit
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats - Vercel Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Commits</p>
                  <p className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mt-2">{stats.total}</p>
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="p-3 bg-gray-100/80 dark:bg-white/10 rounded-xl backdrop-blur-sm"
                >
                  <GitCommit className="h-6 w-6 text-gray-600 dark:text-gray-400"/>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contributors</p>
                  <p className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mt-2">{stats.uniqueUsers}</p>
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.45 }}
                  className="p-3 bg-gray-100/80 dark:bg-white/10 rounded-xl backdrop-blur-sm"
                >
                  <User className="h-6 w-6 text-gray-600 dark:text-gray-400"/>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Today</p>
                  <p className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mt-2">{stats.commitsToday}</p>
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="p-3 bg-gray-100/80 dark:bg-white/10 rounded-xl backdrop-blur-sm"
                >
                  <Calendar className="h-6 w-6 text-gray-600 dark:text-gray-400"/>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Search & Filters - Vercel Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)]"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"/>
                  <input
                    placeholder="Search message or ID..."
                    value={searchQuery}
                    onChange={(e)=>setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:focus:ring-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition-all duration-200"
                  />
                </div>
                <select 
                  value={projectFilter} 
                  onChange={(e)=> setProjectFilter(e.target.value==='ALL'?'ALL':Number(e.target.value))} 
                  className="w-full px-3 py-2.5 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:focus:ring-white/20 text-gray-900 dark:text-white text-sm transition-all duration-200 cursor-pointer"
                >
                  <option value="ALL">All Projects</option>
                  {projects?.map(p=> (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
                <select 
                  value={userFilter} 
                  onChange={(e)=> setUserFilter(e.target.value==='ALL'?'ALL':Number(e.target.value))} 
                  className="w-full px-3 py-2.5 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:focus:ring-white/20 text-gray-900 dark:text-white text-sm transition-all duration-200 cursor-pointer"
                >
                  <option value="ALL">All Users</option>
                  {users?.map(u=> (<option key={u.id} value={u.id}>{u.name}</option>))}
                </select>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    value={fromDate} 
                    onChange={(e)=>setFromDate(e.target.value)} 
                    className="w-full px-3 py-2.5 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:focus:ring-white/20 text-gray-900 dark:text-white text-sm transition-all duration-200"
                  />
                  <input 
                    type="date" 
                    value={toDate} 
                    onChange={(e)=>setToDate(e.target.value)} 
                    className="w-full px-3 py-2.5 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:focus:ring-white/20 text-gray-900 dark:text-white text-sm transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex gap-1 p-1 bg-gray-100/50 dark:bg-white/5 rounded-xl border border-gray-200/30 dark:border-white/5 self-start">
                <motion.button 
                  onClick={()=>setViewMode('list')} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 ${viewMode==='list'?'bg-gradient-to-br from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 shadow-md':'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <List className="h-4 w-4"/> List
                </motion.button>
                <motion.button 
                  onClick={()=>setViewMode('chart')} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 ${viewMode==='chart'?'bg-gradient-to-br from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 shadow-md':'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <BarChart3 className="h-4 w-4"/> Chart
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Content - Vercel Style */}
          {viewMode === 'chart' ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} 
              className="relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)]"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Commits (last 14 days)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Daily commit activity</p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={commitsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" className="dark:stroke-gray-700" opacity={0.2}/>
                  <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '11px' }}/>
                  <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }}/>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid rgba(229, 231, 235, 0.5)', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      backdropFilter: 'blur(12px)'
                    }}
                    cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[8,8,0,0]}/>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#374151" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#6b7280" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} 
              className="relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_8px_16px_rgba(0,0,0,0.4)]"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100/50 dark:bg-white/5 border-b border-gray-200/50 dark:border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50 dark:divide-white/5">
                    <AnimatePresence mode="popLayout">
                      {filteredCommits.map((commit, index) => (
                        <motion.tr 
                          key={commit.id} 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }} 
                          whileHover={{ backgroundColor: 'rgba(156, 163, 175, 0.05)' }}
                          className="transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm font-medium text-gray-900 dark:text-white truncate max-w-[520px]">
                              {commit.message}
                            </div>
                            <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">#{commit.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                              <FolderKanban className="h-4 w-4 text-gray-500 dark:text-gray-400"/>
                              {getProjectName(commit.projectId)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 dark:from-gray-400 dark:via-gray-500 dark:to-gray-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {getUserName(commit.userId).charAt(0).toUpperCase()}
                              </div>
                              {getUserName(commit.userId)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(commit.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <motion.button 
                              onClick={()=>handleDelete(commit.id, commit.message)} 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all duration-200 group"
                            >
                              <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"/>
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {filteredCommits.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <GitCommit className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No commits match your filters</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search criteria</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
