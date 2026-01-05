import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '@/lib/api/teams';
import { TeamDto } from '@/types';

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getAll(),
  });
};

export const useTeam = (id: number) => {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => teamsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<TeamDto, 'id'>) => teamsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<TeamDto, 'id'> }) =>
      teamsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.id] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => teamsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};
