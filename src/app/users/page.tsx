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
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { Plus, Trash2, Edit2, Users as UsersIcon, Shield, Code, Briefcase, Search, Mail } from 'lucide-react';
import { getRoleColor } from '@/lib/utils';
import { toast } from 'sonner';
import { Role } from '@/types';

export default function UsersPage() {
  const { data: users, isLoading, isError, refetch } = useUsers();
  const deleteMutation = useDeleteUser();

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
                  <UsersIcon className="h-3.5 w-3.5 text-black dark:text-white" />
                  <span className="text-xs font-medium text-black dark:text-white">User Management</span>
                </div>
                <h1 className="text-3xl font-bold text-black dark:text-white">Manage your team</h1>
                <p className="text-sm text-gray-600 dark:text-neutral-400 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  Control user accounts, roles, and permissions
                </p>
              </div>
              <button className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 border border-black dark:border-white text-sm">
                <Plus className="h-4 w-4" />
                New User
              </button>
            </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Total Users</p>
                  <p className="text-2xl font-bold text-black dark:text-white mt-2">{metrics.total}</p>
                </div>
                <div className="p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg">
                  <UsersIcon className="h-5 w-5 text-black dark:text-white"/>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Admins</p>
                  <p className="text-2xl font-bold text-black dark:text-white mt-2">{metrics.admins}</p>
                </div>
                <div className="p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg">
                  <Shield className="h-5 w-5 text-black dark:text-white"/>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Managers</p>
                  <p className="text-2xl font-bold text-black dark:text-white mt-2">{metrics.managers}</p>
                </div>
                <div className="p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg">
                  <Briefcase className="h-5 w-5 text-black dark:text-white"/>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wide">Developers</p>
                  <p className="text-2xl font-bold text-black dark:text-white mt-2">{metrics.developers}</p>
                </div>
                <div className="p-2.5 bg-gray-100 dark:bg-neutral-900 rounded-lg">
                  <Code className="h-5 w-5 text-black dark:text-white"/>
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
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-10 bg-white dark:bg-black border-gray-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
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
                <Button variant="outline" onClick={() => { setSearch(''); setRoleFilter('ALL'); setSortKey('name'); setSortDir('asc'); setPage(1); }}>Reset</Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            {isError && (
              <div className="m-4 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-black dark:text-white flex items-center justify-between">
                <span className="font-medium">Failed to load users. Please try again.</span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => changeSort('name')}>
                      Name {sortKey==='name' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => changeSort('email')}>
                      Email {sortKey==='email' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => changeSort('role')}>
                      Role {sortKey==='role' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {pageData.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-mono font-medium text-gray-700 dark:text-neutral-300">
                        #{user.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-black dark:text-white">{user.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-neutral-400">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-black dark:bg-white border-black dark:border-white text-white dark:text-black">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-lg transition-all duration-200 group"
                          aria-label={`Edit user ${user.name}`}
                        >
                          <Edit2 className="h-4 w-4 text-gray-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-lg transition-all duration-200 group"
                          aria-label={`Delete user ${user.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="text-center py-16">
                      <UsersIcon className="h-12 w-12 text-gray-300 dark:text-neutral-700 mx-auto mb-3" />
                      <p className="text-gray-900 dark:text-white font-medium">
                        {search || roleFilter !== 'ALL' ? 'No users found' : 'No users yet'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">
                        {search || roleFilter !== 'ALL' ? 'Try adjusting your filters' : 'Create your first user!'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
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
