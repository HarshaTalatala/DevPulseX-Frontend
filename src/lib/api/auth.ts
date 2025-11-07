import apiClient from './client';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  githubLogin: async (code: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/github', { code });
    return response.data;
  },

  googleLogin: async (code: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/google', { code });
    return response.data;
  },
};
