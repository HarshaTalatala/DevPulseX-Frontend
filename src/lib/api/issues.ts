import apiClient from './client';
import { IssueDto, IssueStatus } from '@/types';

export const issuesApi = {
  getAll: async (): Promise<IssueDto[]> => {
    const response = await apiClient.get<IssueDto[]>('/issues');
    return response.data;
  },

  getById: async (id: number): Promise<IssueDto> => {
    const response = await apiClient.get<IssueDto>(`/issues/${id}`);
    return response.data;
  },

  create: async (data: Omit<IssueDto, 'id'>): Promise<IssueDto> => {
    const response = await apiClient.post<IssueDto>('/issues', data);
    return response.data;
  },

  update: async (id: number, data: Omit<IssueDto, 'id'>): Promise<IssueDto> => {
    const response = await apiClient.put<IssueDto>(`/issues/${id}`, data);
    return response.data;
  },

  transitionStatus: async (id: number, status: IssueStatus): Promise<IssueDto> => {
    const response = await apiClient.post<IssueDto>(`/issues/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/issues/${id}`);
  },
};
