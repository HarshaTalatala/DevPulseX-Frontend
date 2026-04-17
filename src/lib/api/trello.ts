import apiClient from './client';
import { AuthResponse } from '@/types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function getWithRetry<T = any>(url: string, maxRetries = 3, baseDelay = 800): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      const res = await apiClient.get(url);
      return res.data as T;
    } catch (e: any) {
      const status = e?.response?.status;
      
      if (status === 429 && attempt < maxRetries) {
        attempt++;
        const wait = baseDelay * attempt;
        await delay(wait);
        continue;
      }
      
      // For all other errors, throw immediately
      throw e;
    }
  }
}

export const trelloApi = {
  getBoards: async () => getWithRetry('/trello/boards'),
  getLists: async (boardId: string) => getWithRetry(`/trello/boards/${encodeURIComponent(boardId)}/lists`),
  getCards: async (listId: string) => getWithRetry(`/trello/lists/${encodeURIComponent(listId)}/cards`),
  getProjectTrelloData: async (projectId: number) =>
    getWithRetry(`/dashboard/trello/${projectId}`) as Promise<{ lists: Array<{ listId: string; listName: string; cards: any[] }> }>,
  linkAccount: async (token: string, state: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/trello/link', { token, state }, { withCredentials: true });
    return response.data;
  },
};
