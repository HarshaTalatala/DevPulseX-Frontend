import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import { ProjectDto } from '@/types';
import { demoProjects } from '@/lib/demoData';
import { enforceDemoReadOnly, isDemoMode } from '@/lib/demoMode';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => (isDemoMode() ? Promise.resolve(demoProjects) : projectsApi.getAll()),
  });
};

export const useProject = (id?: number) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<ProjectDto, 'id'>) => {
      enforceDemoReadOnly();
      return projectsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<ProjectDto, 'id'> }) => {
      enforceDemoReadOnly();
      return projectsApi.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => {
      enforceDemoReadOnly();
      return projectsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
