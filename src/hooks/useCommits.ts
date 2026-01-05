import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commitsApi } from '@/lib/api/commits';
import { CommitDto } from '@/types';

export const useCommits = () => {
  return useQuery({
    queryKey: ['commits'],
    queryFn: () => commitsApi.getAll(),
  });
};

export const useCommit = (id: number) => {
  return useQuery({
    queryKey: ['commits', id],
    queryFn: () => commitsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCommit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CommitDto, 'id' | 'timestamp'>) => commitsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commits'] });
    },
  });
};

export const useUpdateCommit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<CommitDto, 'id' | 'timestamp'> }) =>
      commitsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['commits'] });
      queryClient.invalidateQueries({ queryKey: ['commits', variables.id] });
    },
  });
};

export const useDeleteCommit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => commitsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commits'] });
    },
  });
};
