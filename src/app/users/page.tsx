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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage user accounts, roles, and permissions across the platform.</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New User
            </Button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              name="Total users"
              value={metrics.total}
              icon={UsersIcon}
              color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              gradientFrom=""
              gradientTo=""
            />
            <StatCard
              name="Admins"
              value={metrics.admins}
              icon={Shield}
              color="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              gradientFrom=""
              gradientTo=""
            />
            <StatCard
              name="Managers"
              value={metrics.managers}
              icon={Briefcase}
              color="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              gradientFrom=""
              gradientTo=""
            />
            <StatCard
              name="Developers"
              value={metrics.developers}
              icon={Code}
              color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
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
                      placeholder="Search by name, email, or #id"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <Select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    options={roleFilterOptions}
                  />
                </div>
                <div className="flex items-center gap-2">
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
                    Export CSV
                  </Button>
                  <Button variant="outline" onClick={() => { setSearch(''); setRoleFilter('ALL'); setSortKey('name'); setSortDir('asc'); setPage(1); }}>Reset</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            {isError && (
              <div className="p-4 mb-2 rounded border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 flex items-center justify-between">
                <span>Failed to load users. Please try again.</span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => changeSort('name')}>Name {sortKey==='name' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => changeSort('email')}>Email {sortKey==='email' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => changeSort('role')}>Role {sortKey==='role' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((user) => {
                  const roleColors = getRoleColor(user.role);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>#{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors.bg} ${roleColors.text}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-700"
                            aria-label={`Edit user ${user.name}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.name)}
                            className="text-red-600 hover:text-red-700"
                            aria-label={`Delete user ${user.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                {search || roleFilter !== 'ALL' ? 'No users match your filters.' : 'No users found.'}
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
