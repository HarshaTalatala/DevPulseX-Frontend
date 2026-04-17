import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trelloApi } from '@/lib/api/trello';
import { useAuthStore } from '@/stores/auth';

export const useTrelloBoards = () => {
  const { user } = useAuthStore();
  const isTrelloLinked = !!(user?.trelloId && user?.trelloUsername);
  
  return useQuery({
    queryKey: ['trello', 'boards', user?.id],
    queryFn: async () => {
      console.log('[useTrelloBoards] Fetching boards for user:', user?.id);
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
    retry: 1,
    refetchOnWindowFocus: false,
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
    queryKey: ['trello', 'project', projectId, user?.id],
    queryFn: () => trelloApi.getProjectTrelloData(projectId!),
    enabled: !!projectId && isTrelloLinked,
  });
};

export const useTrelloBoardAggregate = (boardId?: string) => {
  const { user } = useAuthStore();
  const isTrelloLinked = !!(user?.trelloId && user?.trelloUsername);

  return useQuery({
    queryKey: ['trello', 'board-aggregate', boardId, user?.id],
    queryFn: async () => {
      const lists = await trelloApi.getLists(boardId!);
      const normalizedLists = Array.isArray(lists) ? lists : [];

      const listsWithCards = await Promise.all(
        normalizedLists.map(async (list: any) => {
          const cards = await trelloApi.getCards(list.id);
          const normalizedCards = Array.isArray(cards) ? cards : [];

          return {
            listId: list.id,
            listName: list.name,
            cards: normalizedCards.map((card: any) => ({
              id: card.id,
              name: card.name,
              desc: card.desc,
              labels: Array.isArray(card.labels) ? card.labels.map((label: any) => label?.name || '') : [],
              memberIds: Array.isArray(card.idMembers) ? card.idMembers : [],
            })),
          };
        })
      );

      return { lists: listsWithCards };
    },
    enabled: !!boardId && isTrelloLinked,
  });
};

export const useLinkTrelloAccount = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: ({ token, state }: { token: string; state: string }) => trelloApi.linkAccount(token, state),
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
