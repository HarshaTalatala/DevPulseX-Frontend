import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trelloApi } from '@/lib/api/trello';
import { useAuthStore } from '@/stores/auth';

export const useTrelloBoards = () => {
  const { user } = useAuthStore();
  const isTrelloLinked = !!(user?.trelloId && user?.trelloUsername);
  
  return useQuery({
    queryKey: ['trello', 'boards'],
    queryFn: async () => {
      console.log('[useTrelloBoards] Fetching boards...');
      try {
        const data = await trelloApi.getBoards();
        console.log('[useTrelloBoards] Successfully fetched boards:', data);
        return data;
      } catch (error) {
        console.error('[useTrelloBoards] Error fetching boards:', error);
        throw error;
      }
    },
    enabled: isTrelloLinked,
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
  const { user } = useAuthStore();
  const isTrelloLinked = !!(user?.trelloId && user?.trelloUsername);
  
  return useQuery({
    queryKey: ['trello', 'project', projectId],
    queryFn: () => trelloApi.getProjectTrelloData(projectId!),
    enabled: !!projectId && isTrelloLinked,
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
