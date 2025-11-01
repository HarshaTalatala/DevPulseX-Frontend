import apiClient from './client';
import { DashboardDto, ProjectMetricsDto, UserMetricsDto } from '@/types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardDto> => {
    const response = await apiClient.get<DashboardDto>('/dashboard/summary');
    return response.data;
  },

  getProjectMetrics: async (): Promise<ProjectMetricsDto[]> => {
    const response = await apiClient.get<ProjectMetricsDto[]>('/dashboard/projects');
    return response.data;
  },

  getUserMetrics: async (): Promise<UserMetricsDto[]> => {
    const response = await apiClient.get<UserMetricsDto[]>('/dashboard/users');
    return response.data;
  },
};
