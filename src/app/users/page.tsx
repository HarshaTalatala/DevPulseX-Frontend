'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { Plus, Trash2, Edit2, Users as UsersIcon, Shield, Code, Briefcase, Search, Mail } from 'lucide-react';
import { getRoleColor } from '@/lib/utils';
import { toast } from 'sonner';
import { Role } from '@/types';
import { useAuthStore } from '@/stores/auth';

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: users, isLoading, isError, refetch } = useUsers();
  const deleteMutation = useDeleteUser();

  // Check if user has permission to view this page
  if (user && user.role !== Role.ADMIN && user.role !== Role.MANAGER) {
    router.push('/dashboard');
    return null;
  }

  // UI state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<'name' | 'email' | 'role'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = users?.length || 0;
    const admins = users?.filter((u) => u.role === Role.ADMIN).length || 0;
    const managers = users?.filter((u) => u.role === Role.MANAGER).length || 0;
    const developers = users?.filter((u) => u.role === Role.DEVELOPER).length || 0;
    return { total, admins, managers, developers };
  }, [users]);

  // Filtering and sorting
  const filtered = useMemo(() => {
    let data = users || [];
    
    // Role filter
    if (roleFilter !== 'ALL') {
      data = data.filter((u) => u.role === roleFilter);
    }
    
    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((u) => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        `#${u.id}`.toLowerCase().includes(q)
      );
    }
    
    // Sort
    data = data.slice().sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === 'email') {
        cmp = a.email.localeCompare(b.email);
      } else if (sortKey === 'role') {
        cmp = a.role.localeCompare(b.role);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    
    return data;
  }, [users, roleFilter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const changeSort = (key: 'name' | 'email' | 'role') => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const roleFilterOptions = [
    { value: 'ALL', label: 'All roles' },
    { value: Role.ADMIN, label: 'Admin' },
    { value: Role.MANAGER, label: 'Manager' },
    { value: Role.DEVELOPER, label: 'Developer' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen bg-white dark:bg-black">
            <div className="space-y-6 sm:space-y-8">
              {/* Header Skeleton */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-3 w-full md:w-auto">
                  <div className="h-7 w-36 bg-gray-100 dark:bg-neutral-900 rounded-full animate-pulse border border-gray-200 dark:border-neutral-800" />
                  <div className="h-8 sm:h-10 w-48 sm:w-64 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse border border-gray-200 dark:border-neutral-800" />
                  <div className="h-4 w-56 sm:w-80 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse border border-gray-200 dark:border-neutral-800" />
                </div>
                <div className="h-10 w-full sm:w-32 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse border border-gray-200 dark:border-neutral-800" />
              </div>

              {/* Stats Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-800 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="h-3 w-20 sm:w-28 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                        <div className="h-6 sm:h-8 w-12 sm:w-16 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                      </div>
                      <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse flex-shrink-0 ml-3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters Skeleton */}
              <div className="bg-white dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-800 p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
                      <tr>
                        {['ID', 'Name', 'Email', 'Role', 'Actions'].map((header, i) => (
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
                            <div className="h-6 w-12 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-4 w-28 sm:w-36 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-4 w-32 sm:w-40 bg-gray-100 dark:bg-neutral-900 rounded animate-pulse" />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="h-6 w-20 sm:w-24 bg-gray-100 dark:bg-neutral-900 rounded-full animate-pulse" />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex gap-1 justify-end">
                              <div className="h-8 w-8 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                              <div className="h-8 w-8 bg-gray-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                            </div>
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
                  <UsersIcon className="h-3.5 w-3.5 text-black dark:text-white" />
                  <span className="text-xs font-medium text-black dark:text-white">User Management</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white">Manage your team</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  Control user accounts, roles, and permissions
                </p>
              </div>
              <button className="w-full sm:w-auto px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 border border-black dark:border-white text-sm">
                <Plus className="h-4 w-4" />
                <span>New User</span>
              </button>
            </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Total Users</p>
                  <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white mt-2">{metrics.total}</p>
                </div>
                <div className="p-2 sm:p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg flex-shrink-0 ml-3">
                  <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-black dark:text-white"/>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Admins</p>
                  <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white mt-2">{metrics.admins}</p>
                </div>
                <div className="p-2 sm:p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg flex-shrink-0 ml-3">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-black dark:text-white"/>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Managers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white mt-2">{metrics.managers}</p>
                </div>
                <div className="p-2 sm:p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg flex-shrink-0 ml-3">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-black dark:text-white"/>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Developers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white mt-2">{metrics.developers}</p>
                </div>
                <div className="p-2 sm:p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg flex-shrink-0 ml-3">
                  <Code className="h-5 w-5 sm:h-6 sm:w-6 text-black dark:text-white"/>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:items-end lg:justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 flex-1">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 z-10" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9 sm:pl-10 py-2 sm:py-2.5 text-xs sm:text-sm bg-white dark:bg-black border-gray-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <Select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                  options={roleFilterOptions}
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
                      ['ID','Name','Email','Role'],
                      ...filtered.map(u => [
                        `#${u.id}`,
                        u.name,
                        u.email,
                        u.role,
                      ])
                    ];
                    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'\\"')}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'users.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  className="text-xs sm:text-sm px-3 sm:px-4"
                  onClick={() => { setSearch(''); setRoleFilter('ALL'); setSortKey('name'); setSortDir('asc'); setPage(1); }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            {isError && (
              <div className="m-4 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-black dark:text-white flex items-center justify-between">
                <span className="font-medium text-xs sm:text-sm">Failed to load users. Please try again.</span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider">ID</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => changeSort('name')}>
                      Name {sortKey==='name' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => changeSort('email')}>
                      Email {sortKey==='email' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => changeSort('role')}>
                      Role {sortKey==='role' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="text-center py-12 sm:py-16">
                        <UsersIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 dark:text-neutral-700 mx-auto mb-3" />
                        <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                          {search || roleFilter !== 'ALL' ? 'No users found' : 'No users yet'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-500 mt-1">
                          {search || roleFilter !== 'ALL' ? 'Try adjusting your filters' : 'Create your first user!'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-[10px] sm:text-xs font-mono font-medium text-gray-700 dark:text-neutral-300">
                          #{user.id}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-black dark:text-white truncate max-w-[120px] sm:max-w-none">{user.name}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-neutral-400">
                          <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border bg-black dark:bg-white border-black dark:border-white text-white dark:text-black">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-lg transition-all duration-200 group"
                            aria-label={`Edit user ${user.name}`}
                          >
                            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-lg transition-all duration-200 group"
                            aria-label={`Delete user ${user.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
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
          </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
