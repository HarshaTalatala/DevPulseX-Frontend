import apiClient from './client';
import { DashboardDto, ProjectMetricsDto, UserMetricsDto } from '@/types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardDto> => {
    console.log('Fetching dashboard summary...');
    console.log('Token:', localStorage.getItem('token'));
    const response = await apiClient.get<DashboardDto>('/dashboard/summary');
    console.log('Dashboard summary response:', response);
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
