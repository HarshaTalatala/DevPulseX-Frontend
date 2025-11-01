import apiClient from './client';
import { TaskDto, TaskStatus } from '@/types';

export const tasksApi = {
  getAll: async (): Promise<TaskDto[]> => {
    const response = await apiClient.get<TaskDto[]>('/tasks');
    return response.data;
  },

  getById: async (id: number): Promise<TaskDto> => {
    const response = await apiClient.get<TaskDto>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: Omit<TaskDto, 'id'>): Promise<TaskDto> => {
    const response = await apiClient.post<TaskDto>('/tasks', data);
    return response.data;
  },

  update: async (id: number, data: Omit<TaskDto, 'id'>): Promise<TaskDto> => {
    const response = await apiClient.put<TaskDto>(`/tasks/${id}`, data);
    return response.data;
  },

  assign: async (id: number, userId: number): Promise<TaskDto> => {
    const response = await apiClient.post<TaskDto>(`/tasks/${id}/assign/${userId}`);
    return response.data;
  },

  transitionStatus: async (id: number, status: TaskStatus): Promise<TaskDto> => {
    const response = await apiClient.post<TaskDto>(`/tasks/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
