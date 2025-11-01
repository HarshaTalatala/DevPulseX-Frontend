import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { LoginRequest, RegisterRequest } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { handleApiError } from '@/lib/api/client';

export const useLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.token);
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      setAuth(response.user, response.token);
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return () => {
    clearAuth();
    queryClient.clear();
  };
};
