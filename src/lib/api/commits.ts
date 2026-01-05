import apiClient from './client';
import { CommitDto } from '@/types';

export const commitsApi = {
  getAll: async (): Promise<CommitDto[]> => {
    const response = await apiClient.get<CommitDto[]>('/commits');
    return response.data;
  },

  getById: async (id: number): Promise<CommitDto> => {
    const response = await apiClient.get<CommitDto>(`/commits/${id}`);
    return response.data;
  },

  create: async (data: Omit<CommitDto, 'id' | 'timestamp'>): Promise<CommitDto> => {
    const response = await apiClient.post<CommitDto>('/commits', data);
    return response.data;
  },

  update: async (id: number, data: Omit<CommitDto, 'id' | 'timestamp'>): Promise<CommitDto> => {
    const response = await apiClient.put<CommitDto>(`/commits/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/commits/${id}`);
  },
};
