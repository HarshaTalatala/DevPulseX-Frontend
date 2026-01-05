import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { githubApi } from '@/lib/api/github';
import { dashboardApi } from '@/lib/api/dashboard';

/**
 * Prefetch dashboard data on login page or app mount
 * This improves perceived performance by loading data before user navigates to dashboard
 */
export const usePrefetchDashboard = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch GitHub insights
    queryClient.prefetchQuery({
      queryKey: ['github', 'insights'],
      queryFn: () => githubApi.getInsights(),
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch dashboard summary
    queryClient.prefetchQuery({
      queryKey: ['dashboard'],
      queryFn: () => dashboardApi.getSummary(),
      staleTime: 3 * 60 * 1000,
    });
  }, [queryClient]);
};

/**
 * Prefetch on hover - even more aggressive optimization
 * Use on navigation links to dashboard
 * 
 * Example:
 * <Link href="/dashboard" onMouseEnter={prefetchOnHover}>
 */
export const usePrefetchOnHover = () => {
  const queryClient = useQueryClient();

  const prefetchGithubData = () => {
    queryClient.prefetchQuery({
      queryKey: ['github', 'insights'],
      queryFn: () => githubApi.getInsights(),
    });
  };

  return { prefetchGithubData };
};

/**
 * Invalidate cache manually when user makes changes
 * Call this after user connects/disconnects GitHub account
 */
export const useInvalidateGithubCache = () => {
  const queryClient = useQueryClient();

  const invalidateGithubData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['github'] });
  };

  return { invalidateGithubData };
};
