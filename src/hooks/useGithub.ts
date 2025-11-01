import { useQuery } from '@tanstack/react-query';
import { githubApi, GithubInsights, GithubRepository } from '@/lib/api/github';

export const useGithubInsights = () => {
  return useQuery<GithubInsights>({
    queryKey: ['github', 'insights'],
    queryFn: () => githubApi.getInsights(),
  });
};

export const useGithubRepositories = () => {
  return useQuery<GithubRepository[]>({
    queryKey: ['github', 'repositories'],
    queryFn: () => githubApi.getRepositories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
