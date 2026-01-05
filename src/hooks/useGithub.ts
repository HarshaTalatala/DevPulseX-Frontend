import { useQuery } from '@tanstack/react-query';
import { githubApi, GithubInsights, GithubRepository } from '@/lib/api/github';

export const useGithubInsights = () => {
  return useQuery<GithubInsights>({
    queryKey: ['github', 'insights'],
    queryFn: () => githubApi.getInsights(),
    // GitHub insights cache for 5 minutes - this is heavy data
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry on failure (GitHub API can be flaky)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useGithubRepositories = () => {
  return useQuery<GithubRepository[]>({
    queryKey: ['github', 'repositories'],
    queryFn: () => githubApi.getRepositories(),
    // Repositories change less frequently - cache for 10 minutes
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
};
