'use client';

import { useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { useTeams, useDeleteTeam } from '@/hooks/useTeams';
import { useUsers } from '@/hooks/useUsers';
import { Plus, Trash2, Edit2, Users, Search, UserCheck, UserPlus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamsPage() {
  const { data: teams, isLoading, isError, refetch } = useTeams();
  const { data: users } = useUsers();
  const deleteMutation = useDeleteTeam();

  // UI state
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'members'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [memberFilter, setMemberFilter] = useState<string>('ALL');

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete team "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Team deleted successfully');
      } catch (error) {
        toast.error('Failed to delete team');
      }
    }
  };

  const getUserName = (userId: number) => {
    return users?.find((u) => u.id === userId)?.name || 'Unknown';
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = teams?.length || 0;
    const totalMembers = teams?.reduce((sum, t) => sum + t.memberIds.length, 0) || 0;
    const avgTeamSize = total > 0 ? Math.round(totalMembers / total) : 0;
    const largestTeam = teams?.reduce((max, t) => Math.max(max, t.memberIds.length), 0) || 0;
    return { total, totalMembers, avgTeamSize, largestTeam };
  }, [teams]);

  // Filtering and sorting
  const filtered = useMemo(() => {
    let data = teams || [];
    
    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((t) => 
        t.name.toLowerCase().includes(q) || 
        `#${t.id}`.toLowerCase().includes(q)
      );
    }
    
    // Member count filter
    if (memberFilter !== 'ALL') {
      const threshold = parseInt(memberFilter);
      if (memberFilter === '0') {
        data = data.filter((t) => t.memberIds.length === 0);
      } else if (memberFilter === '1-5') {
        data = data.filter((t) => t.memberIds.length >= 1 && t.memberIds.length <= 5);
      } else if (memberFilter === '6-10') {
        data = data.filter((t) => t.memberIds.length >= 6 && t.memberIds.length <= 10);
      } else if (memberFilter === '11+') {
        data = data.filter((t) => t.memberIds.length >= 11);
      }
    }
    
    // Sort
    data = data.slice().sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === 'members') {
        cmp = a.memberIds.length - b.memberIds.length;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    
    return data;
  }, [teams, search, memberFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const changeSort = (key: 'name' | 'members') => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const memberFilterOptions = [
    { value: 'ALL', label: 'All sizes' },
    { value: '0', label: 'Empty (0)' },
    { value: '1-5', label: 'Small (1-5)' },
    { value: '6-10', label: 'Medium (6-10)' },
    { value: '11+', label: 'Large (11+)' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen bg-white dark:bg-black">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="h-10 w-48 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse border border-gray-200 dark:border-neutral-800" />
                <div className="h-10 w-40 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse border border-gray-200 dark:border-neutral-800" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-white dark:bg-neutral-950 rounded-lg animate-pulse border border-gray-200 dark:border-neutral-800" />
                ))}
              </div>
              <div className="bg-white dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
                <div className="h-12 bg-gray-100 dark:bg-neutral-900 rounded-lg mb-4 animate-pulse" />
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 dark:bg-neutral-900 rounded-lg mb-3 animate-pulse" />
                ))}
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
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
                  <Users className="h-3.5 w-3.5 text-black dark:text-white" />
                  <span className="text-xs font-medium text-black dark:text-white">Team Management</span>
                </div>
                <h1 className="text-3xl font-bold text-black dark:text-white">Collaborate together</h1>
                <p className="text-sm text-gray-600 dark:text-neutral-400 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Organize users into teams for better project collaboration
                </p>
              </div>
              <button className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 border border-black dark:border-white text-sm">
                <Plus className="h-4 w-4" />
                New Team
              </button>
            </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Total Teams</p>
                  <p className="text-2xl font-bold text-black dark:text-white mt-2">{metrics.total}</p>
                </div>
                <div className="p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg">
                  <Users className="h-5 w-5 text-black dark:text-white"/>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Total Members</p>
                  <p className="text-2xl font-bold text-black dark:text-white mt-2">{metrics.totalMembers}</p>
                </div>
                <div className="p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg">
                  <UserCheck className="h-5 w-5 text-black dark:text-white"/>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Avg Team Size</p>
                  <p className="text-2xl font-bold text-black dark:text-white mt-2">{metrics.avgTeamSize}</p>
                </div>
                <div className="p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-black dark:text-white"/>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Largest Team</p>
                  <p className="text-2xl font-bold text-black dark:text-white mt-2">{metrics.largestTeam}</p>
                </div>
                <div className="p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg">
                  <UserPlus className="h-5 w-5 text-black dark:text-white"/>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-5">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 z-10" />
                  <Input
                    placeholder="Search teams..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-10 bg-white dark:bg-black border-gray-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <Select
                  value={memberFilter}
                  onChange={(e) => { setMemberFilter(e.target.value); setPage(1); }}
                  options={memberFilterOptions}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={String(pageSize)}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  options={[{value:'10',label:'10 / page'},{value:'20',label:'20 / page'},{value:'50',label:'50 / page'}]}
                />
                <Button variant="outline" onClick={() => { setSearch(''); setMemberFilter('ALL'); setSortKey('name'); setSortDir('asc'); setPage(1); }}>Reset</Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            {isError && (
              <div className="m-4 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-black dark:text-white flex items-center justify-between">
                <span className="font-medium">Failed to load teams. Please try again.</span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => changeSort('name')}>
                      Team Name {sortKey==='name' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => changeSort('members')}>
                      Members {sortKey==='members' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider">Team Members</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="text-center py-16">
                        <Users className="h-12 w-12 text-gray-300 dark:text-neutral-700 mx-auto mb-3" />
                        <p className="text-gray-900 dark:text-white font-medium">
                          {search || memberFilter !== 'ALL' ? 'No teams found' : 'No teams yet'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">
                          {search || memberFilter !== 'ALL' ? 'Try adjusting your filters' : 'Create your first team!'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-mono font-medium text-gray-700 dark:text-neutral-300">
                          #{team.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-black dark:text-white">{team.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-black dark:bg-white border-black dark:border-white text-white dark:text-black">
                          {team.memberIds.length} {team.memberIds.length === 1 ? 'member' : 'members'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {team.memberIds.length > 0 ? (
                            team.memberIds.slice(0, 5).map((memberId) => (
                              <span
                                key={memberId}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300"
                              >
                                {getUserName(memberId)}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-neutral-500 italic">No members</span>
                          )}
                          {team.memberIds.length > 5 && (
                            <span className="text-xs text-gray-500 dark:text-neutral-500">
                              +{team.memberIds.length - 5} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-lg transition-all duration-200 group"
                            aria-label={`Edit team ${team.name}`}
                          >
                            <Edit2 className="h-4 w-4 text-gray-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                          </button>
                          <button
                            onClick={() => handleDelete(team.id, team.name)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-lg transition-all duration-200 group"
                            aria-label={`Delete team ${team.name}`}
                          >
                            <Trash2 className="h-4 w-4 text-gray-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-neutral-800">
                <div className="text-sm font-medium text-gray-600 dark:text-neutral-400">
                  Showing {(page-1)*pageSize + 1}–{Math.min(page*pageSize, filtered.length)} of {filtered.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page===1} onClick={() => setPage((p)=>Math.max(1,p-1))}>Previous</Button>
                  <span className="text-sm font-medium text-black dark:text-white">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page===totalPages} onClick={() => setPage((p)=>Math.min(totalPages,p+1))}>Next</Button>
                </div>
              </div>
            )}
            </div>
          </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
