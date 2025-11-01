import apiClient from './client';
import { ProjectDto } from '@/types';

export const projectsApi = {
  getAll: async (): Promise<ProjectDto[]> => {
    const response = await apiClient.get<ProjectDto[]>('/projects');
    return response.data;
  },

  getById: async (id: number): Promise<ProjectDto> => {
    const response = await apiClient.get<ProjectDto>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: Omit<ProjectDto, 'id'>): Promise<ProjectDto> => {
    const response = await apiClient.post<ProjectDto>('/projects', data);
    return response.data;
  },

  update: async (id: number, data: Omit<ProjectDto, 'id'>): Promise<ProjectDto> => {
    const response = await apiClient.put<ProjectDto>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
