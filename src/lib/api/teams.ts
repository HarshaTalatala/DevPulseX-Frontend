import apiClient from './client';
import { TeamDto } from '@/types';

export const teamsApi = {
  getAll: async (): Promise<TeamDto[]> => {
    const response = await apiClient.get<TeamDto[]>('/teams');
    return response.data;
  },

  getById: async (id: number): Promise<TeamDto> => {
    const response = await apiClient.get<TeamDto>(`/teams/${id}`);
    return response.data;
  },

  create: async (data: Omit<TeamDto, 'id'>): Promise<TeamDto> => {
    const response = await apiClient.post<TeamDto>('/teams', data);
    return response.data;
  },

  update: async (id: number, data: Omit<TeamDto, 'id'>): Promise<TeamDto> => {
    const response = await apiClient.put<TeamDto>(`/teams/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/teams/${id}`);
  },
};
