import apiClient from './client';
import { DeploymentDto, DeploymentStatus } from '@/types';

export const deploymentsApi = {
  getAll: async (): Promise<DeploymentDto[]> => {
    const response = await apiClient.get<DeploymentDto[]>('/deployments');
    return response.data;
  },

  getById: async (id: number): Promise<DeploymentDto> => {
    const response = await apiClient.get<DeploymentDto>(`/deployments/${id}`);
    return response.data;
  },

  create: async (data: Omit<DeploymentDto, 'id' | 'timestamp'>): Promise<DeploymentDto> => {
    const response = await apiClient.post<DeploymentDto>('/deployments', data);
    return response.data;
  },

  update: async (id: number, data: Omit<DeploymentDto, 'id' | 'timestamp'>): Promise<DeploymentDto> => {
    const response = await apiClient.put<DeploymentDto>(`/deployments/${id}`, data);
    return response.data;
  },

  transitionStatus: async (id: number, status: DeploymentStatus): Promise<DeploymentDto> => {
    const response = await apiClient.post<DeploymentDto>(`/deployments/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/deployments/${id}`);
  },
};
