import apiClient from './client';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import { OAuthProvider } from '@/lib/oauthState';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  prepareOAuthState: async (provider: OAuthProvider, state: string): Promise<void> => {
    await apiClient.post(
      `/auth/oauth/state/${provider}`,
      { state },
      { withCredentials: true }
    );
  },

  githubLogin: async (code: string, state: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/github',
      { code, state },
      { withCredentials: true }
    );
    return response.data;
  },

  googleLogin: async (code: string, state: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/google',
      { code, state },
      { withCredentials: true }
    );
    return response.data;
  },

  linkTrelloAccount: async (token: string, state: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/trello/link',
      { token, state },
      { withCredentials: true }
    );
    return response.data;
  },
};
