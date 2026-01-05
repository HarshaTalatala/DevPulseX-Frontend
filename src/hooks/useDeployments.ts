import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deploymentsApi } from '@/lib/api/deployments';
import { DeploymentDto, DeploymentStatus } from '@/types';

export const useDeployments = () => {
  return useQuery({
    queryKey: ['deployments'],
    queryFn: () => deploymentsApi.getAll(),
  });
};

export const useDeployment = (id: number) => {
  return useQuery({
    queryKey: ['deployments', id],
    queryFn: () => deploymentsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateDeployment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<DeploymentDto, 'id' | 'timestamp'>) => deploymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
};

export const useUpdateDeployment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<DeploymentDto, 'id' | 'timestamp'> }) =>
      deploymentsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['deployments', variables.id] });
    },
  });
};

export const useTransitionDeploymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: DeploymentStatus }) =>
      deploymentsApi.transitionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
};

export const useDeleteDeployment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deploymentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
};
