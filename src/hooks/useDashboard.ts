import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getSummary(),
    // Dashboard summary is lightweight - cache for 3 minutes
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useProjectMetrics = () => {
  return useQuery({
    queryKey: ['project-metrics'],
    queryFn: () => dashboardApi.getProjectMetrics(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUserMetrics = () => {
  return useQuery({
    queryKey: ['user-metrics'],
    queryFn: () => dashboardApi.getUserMetrics(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
