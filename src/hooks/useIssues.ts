import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { issuesApi } from '@/lib/api/issues';
import { IssueDto, IssueStatus } from '@/types';
import { demoIssues } from '@/lib/demoData';
import { enforceDemoReadOnly, isDemoMode } from '@/lib/demoMode';

export const useIssues = () => {
  return useQuery({
    queryKey: ['issues'],
    queryFn: () => (isDemoMode() ? Promise.resolve(demoIssues) : issuesApi.getAll()),
  });
};

export const useIssue = (id: number) => {
  return useQuery({
    queryKey: ['issues', id],
    queryFn: () => issuesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<IssueDto, 'id'>) => {
      enforceDemoReadOnly();
      return issuesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<IssueDto, 'id'> }) => {
      enforceDemoReadOnly();
      return issuesApi.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues', variables.id] });
    },
  });
};

export const useTransitionIssueStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: IssueStatus }) => {
      enforceDemoReadOnly();
      return issuesApi.transitionStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
};

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => {
      enforceDemoReadOnly();
      return issuesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
};
