import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { demoDashboardSummary, demoProjectMetrics, demoUserMetrics } from '@/lib/demoData';
import { isDemoMode } from '@/lib/demoMode';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => (isDemoMode() ? Promise.resolve(demoDashboardSummary) : dashboardApi.getSummary()),
    // Dashboard summary is lightweight - cache for 3 minutes
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useProjectMetrics = () => {
  return useQuery({
    queryKey: ['project-metrics'],
    queryFn: () => (isDemoMode() ? Promise.resolve(demoProjectMetrics) : dashboardApi.getProjectMetrics()),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUserMetrics = () => {
  return useQuery({
    queryKey: ['user-metrics'],
    queryFn: () => (isDemoMode() ? Promise.resolve(demoUserMetrics) : dashboardApi.getUserMetrics()),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
