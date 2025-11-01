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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-9 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
            <Card>
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded mb-4 animate-pulse" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded mb-2 animate-pulse" />
              ))}
            </Card>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Organize users into collaborative teams for better project management.</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Team
            </Button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              name="Total teams"
              value={metrics.total}
              icon={Users}
              color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              gradientFrom=""
              gradientTo=""
            />
            <StatCard
              name="Total members"
              value={metrics.totalMembers}
              icon={UserCheck}
              color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              gradientFrom=""
              gradientTo=""
            />
            <StatCard
              name="Avg team size"
              value={metrics.avgTeamSize}
              icon={TrendingUp}
              color="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              gradientFrom=""
              gradientTo=""
            />
            <StatCard
              name="Largest team"
              value={metrics.largestTeam}
              icon={UserPlus}
              color="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
              gradientFrom=""
              gradientTo=""
            />
          </div>

          {/* Controls */}
          <Card>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  <div className="relative">
                    <Input
                      placeholder="Search by name or #id"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <Select
                    value={memberFilter}
                    onChange={(e) => { setMemberFilter(e.target.value); setPage(1); }}
                    options={memberFilterOptions}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={String(pageSize)}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    options={[{value:'10',label:'10 / page'},{value:'20',label:'20 / page'},{value:'50',label:'50 / page'}]}
                  />
                  <Button variant="outline" onClick={() => { setSearch(''); setMemberFilter('ALL'); setSortKey('name'); setSortDir('asc'); setPage(1); }}>Reset</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            {isError && (
              <div className="p-4 mb-2 rounded border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 flex items-center justify-between">
                <span>Failed to load teams. Please try again.</span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => changeSort('name')}>Team Name {sortKey==='name' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => changeSort('members')}>Members {sortKey==='members' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead>Team Members</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>#{team.id}</TableCell>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      <Badge className="text-xs">
                        {team.memberIds.length} {team.memberIds.length === 1 ? 'member' : 'members'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {team.memberIds.length > 0 ? (
                          team.memberIds.slice(0, 5).map((memberId) => (
                            <span
                              key={memberId}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                              {getUserName(memberId)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400 italic">No members</span>
                        )}
                        {team.memberIds.length > 5 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{team.memberIds.length - 5} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-700"
                          aria-label={`Edit team ${team.name}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(team.id, team.name)}
                          className="text-red-600 hover:text-red-700"
                          aria-label={`Delete team ${team.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                {search || memberFilter !== 'ALL' ? 'No teams match your filters.' : 'No teams found. Create your first team!'}
              </div>
            )}
            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(page-1)*pageSize + 1}–{Math.min(page*pageSize, filtered.length)} of {filtered.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page===1} onClick={() => setPage((p)=>Math.max(1,p-1))}>Previous</Button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page===totalPages} onClick={() => setPage((p)=>Math.min(totalPages,p+1))}>Next</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
