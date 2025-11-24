import { useQuery } from '@tanstack/react-query';
import { trelloApi } from '@/lib/api/trello';

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
