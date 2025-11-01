'use client';

import { useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { useCommits, useDeleteCommit } from '@/hooks/useCommits';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { Plus, Trash2, Search, List, BarChart3, GitCommit, Calendar, User, FolderKanban } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Commits</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <GitCommit className="h-4 w-4" />
                Explore code activity across projects
              </p>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Commit
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commits</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg"><GitCommit className="h-6 w-6 text-blue-600 dark:text-blue-400"/></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contributors</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{stats.uniqueUsers}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg"><User className="h-6 w-6 text-green-600 dark:text-green-400"/></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{stats.commitsToday}</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg"><Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400"/></div>
              </div>
            </motion.div>
          </div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col lg:flex-row gap-4 items-center justify-between"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                <input
                  placeholder="Search message or ID..."
                  value={searchQuery}
                  onChange={(e)=>setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <select value={projectFilter} onChange={(e)=> setProjectFilter(e.target.value==='ALL'?'ALL':Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm">
                <option value="ALL">All Projects</option>
                {projects?.map(p=> (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
              <select value={userFilter} onChange={(e)=> setUserFilter(e.target.value==='ALL'?'ALL':Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm">
                <option value="ALL">All Users</option>
                {users?.map(u=> (<option key={u.id} value={u.id}>{u.name}</option>))}
              </select>
              <div className="flex gap-2">
                <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"/>
                <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"/>
              </div>
            </div>

            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 self-start">
              <button onClick={()=>setViewMode('list')} className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${viewMode==='list'?'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm':'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                <List className="h-4 w-4 inline mr-1"/> List
              </button>
              <button onClick={()=>setViewMode('chart')} className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${viewMode==='chart'?'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm':'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                <BarChart3 className="h-4 w-4 inline mr-1"/> Chart
              </button>
            </div>
          </motion.div>

          {/* Content */}
          {viewMode === 'chart' ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Commits (last 14 days)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Daily commit activity</p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={commitsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.3}/>
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '11px' }}/>
                  <YAxis stroke="#6b7280" style={{ fontSize: '11px' }}/>
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '12px' }}/>
                  <Bar dataKey="count" fill="#3b82f6" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCommits.map((commit, index) => (
                      <motion.tr key={commit.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.5 + index * 0.03 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm text-gray-900 dark:text-white truncate max-w-[520px]">
                            {commit.message}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">#{commit.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                            <FolderKanban className="h-4 w-4 text-blue-500"/>
                            {getProjectName(commit.projectId)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                              {getUserName(commit.userId).charAt(0).toUpperCase()}
                            </div>
                            {getUserName(commit.userId)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDateTime(commit.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button onClick={()=>handleDelete(commit.id, commit.message)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors">
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400"/>
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filteredCommits.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">No commits match your filters.</div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
