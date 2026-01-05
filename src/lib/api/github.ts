import apiClient from './client';

export type GithubInsights = {
  username: string;
  repoCount: number;
  totalPullRequests: number;
  recentCommits: number;
  // Additional metrics
  totalIssues: number;
  openIssues: number;
  closedIssues: number;
  totalStars: number;
  followers: number;
  following: number;
  publicGists: number;
  // Recent activity
  recentPRs: number;
  recentIssues: number;
  mostActiveRepo: string;
  // Metadata
  fetchedAt?: string;
  avatarUrl?: string;
  profileUrl?: string;
};

export type GithubRepository = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  defaultBranch: string;
  topics: string[];
};

export const githubApi = {
  getInsights: async (): Promise<GithubInsights> => {
    const response = await apiClient.get<GithubInsights>('/github/insights');
    return response.data;
  },
  
  getRepositories: async (): Promise<GithubRepository[]> => {
    const response = await apiClient.get<GithubRepository[]>('/github/repositories');
    return response.data;
  },
};
