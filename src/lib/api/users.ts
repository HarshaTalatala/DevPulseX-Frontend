import apiClient from './client';
import { UserDto, CreateUserRequest, UpdateUserRequest } from '@/types';

export const usersApi = {
  getAll: async (): Promise<UserDto[]> => {
    const response = await apiClient.get<UserDto[]>('/users');
    return response.data;
  },

  getById: async (id: number): Promise<UserDto> => {
    const response = await apiClient.get<UserDto>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserRequest): Promise<UserDto> => {
    const response = await apiClient.post<UserDto>('/users', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserRequest): Promise<UserDto> => {
    const response = await apiClient.put<UserDto>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
