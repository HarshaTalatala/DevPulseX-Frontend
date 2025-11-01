import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getSummary(),
  });
};

export const useProjectMetrics = () => {
  return useQuery({
    queryKey: ['project-metrics'],
    queryFn: () => dashboardApi.getProjectMetrics(),
  });
};

export const useUserMetrics = () => {
  return useQuery({
    queryKey: ['user-metrics'],
    queryFn: () => dashboardApi.getUserMetrics(),
  });
};
