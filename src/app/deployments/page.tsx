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
import { useDeployments, useDeleteDeployment } from '@/hooks/useDeployments';
import { useProjects } from '@/hooks/useProjects';
import { Calendar, CheckCircle2, Plus, Search, Trash2, XCircle } from 'lucide-react';
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

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-9 w-36 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
            <Card>
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded mb-4 animate-pulse" />
              {[...Array(6)].map((_, i) => (
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deployments</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track releases across projects, monitor status, and spot failures fast.</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Deployment
            </Button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              name="Total deployments"
              value={metrics.total}
              icon={Calendar}
              color="bg-gray-100 dark:bg-gray-800"
              gradientFrom=""
              gradientTo=""
            />
            <StatCard
              name="Success rate"
              value={metrics.successRate}
              icon={CheckCircle2}
              color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              gradientFrom=""
              gradientTo=""
            />
            <StatCard
              name="Failures"
              value={metrics.failed}
              icon={XCircle}
              color="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              gradientFrom=""
              gradientTo=""
            />
          </div>

          {/* Controls */}
          <Card>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <div className="relative">
                    <Input
                      placeholder="Search by #id or project name"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                <div className="flex items-center gap-2">
                  <Select
                    value={String(pageSize)}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    options={[{value:'10',label:'10 / page'},{value:'20',label:'20 / page'},{value:'50',label:'50 / page'}]}
                  />
                  <Button variant="outline" onClick={() => {
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
                  }}>Export CSV</Button>
                  <Button variant="outline" onClick={() => { setSearch(''); setProjectFilter('ALL'); setStatusFilter('ALL'); setSortKey('timestamp'); setSortDir('desc'); setPage(1); }}>Reset</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            {isError && (
              <div className="p-4 mb-2 rounded border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 flex items-center justify-between">
                <span>Failed to load deployments. Please try again.</span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => changeSort('project')}>Project {sortKey==='project' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => changeSort('status')}>Status {sortKey==='status' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => changeSort('timestamp')}>Deployed At {sortKey==='timestamp' ? (sortDir==='asc' ? '▲' : '▼') : ''}</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((deployment) => (
                  <TableRow key={deployment.id}>
                    <TableCell className="font-medium">{getProjectName(deployment.projectId)}</TableCell>
                    <TableCell>#{deployment.id}</TableCell>
                    <TableCell>
                      <Badge variant="status" status={deployment.status}>
                        {deployment.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(deployment.timestamp)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {formatRelativeTime(deployment.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(deployment.id)}
                        className="text-red-600 hover:text-red-700"
                        aria-label={`Delete deployment ${deployment.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                No deployments match your filters.
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

          {/* Last deployment callout */}
          {metrics.last && (
            <Card className="border-dashed">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge variant="status" status={metrics.last.status}>{metrics.last.status}</Badge>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Last deployment • {formatDateTime(metrics.last.timestamp)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{getProjectName(metrics.last.projectId)} • #{metrics.last.id}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{formatRelativeTime(metrics.last.timestamp)}</div>
              </div>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
