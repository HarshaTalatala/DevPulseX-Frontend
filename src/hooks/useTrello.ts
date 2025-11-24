import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trelloApi } from '@/lib/api/trello';
import { useAuthStore } from '@/stores/auth';

export const useTrelloBoards = (userId?: string) => {
  return useQuery({
    queryKey: ['trello', 'boards', userId],
    queryFn: () => trelloApi.getBoards(userId!),
    enabled: !!userId,
  });
};

export const useTrelloLists = (boardId?: string) => {
  return useQuery({
    queryKey: ['trello', 'lists', boardId],
    queryFn: () => trelloApi.getLists(boardId!),
    enabled: !!boardId,
  });
};

export const useTrelloCards = (listId?: string) => {
  return useQuery({
    queryKey: ['trello', 'cards', listId],
    queryFn: () => trelloApi.getCards(listId!),
    enabled: !!listId,
  });
};

export const useProjectTrello = (projectId?: number) => {
  return useQuery({
    queryKey: ['trello', 'project', projectId],
    queryFn: () => trelloApi.getProjectTrelloData(projectId!),
    enabled: !!projectId,
  });
};

export const useLinkTrelloAccount = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (token: string) => trelloApi.linkAccount(token),
    onSuccess: (data) => {
      // Update auth store with new token and user data
      if (data.token && data.user) {
        setAuth(data.user, data.token);
        localStorage.setItem('token', data.token);
      }
      // Invalidate user queries to refetch with new Trello data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
