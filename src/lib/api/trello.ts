import apiClient from './client';
import { AuthResponse } from '@/types';
import { useAuthStore } from '@/stores/auth';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function getWithRetry<T = any>(url: string, maxRetries = 3, baseDelay = 800): Promise<T> {
  let attempt = 0;
  let lastError: any;
  while (true) {
    try {
      const res = await apiClient.get(url);
      return res.data as T;
    } catch (e: any) {
      lastError = e;
      const status = e?.response?.status;
      console.error(`[Trello API] GET ${url} failed (attempt ${attempt + 1}):`, e?.response?.data || e?.message);
      
      if (status === 429 && attempt < maxRetries) {
        attempt++;
        const wait = baseDelay * attempt;
        console.warn(`[Trello API] Rate limited (429). Retrying in ${wait}ms...`);
        await delay(wait);
        continue;
      }
      
      // For all other errors, throw immediately
      throw e;
    }
  }
}

const TRELLO_API_KEY = process.env.NEXT_PUBLIC_TRELLO_API_KEY || '';

const getTrelloToken = () => useAuthStore.getState().user?.trelloAccessToken || '';

async function fetchTrelloJson<T = any>(path: string): Promise<T> {
  const token = getTrelloToken();
  if (!TRELLO_API_KEY || !token) {
    throw new Error('Trello account is not fully linked. Please reconnect your Trello account.');
  }

  const url = new URL(`https://api.trello.com/1${path}`);
  url.searchParams.set('key', TRELLO_API_KEY);
  url.searchParams.set('token', token);

  const response = await fetch(url.toString(), { method: 'GET' });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Trello request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export const trelloApi = {
  getBoards: async () => {
    try {
      return await fetchTrelloJson(`/members/me/boards`);
    } catch (error) {
      return getWithRetry(`/trello/boards`);
    }
  },
  getLists: async (boardId: string) => {
    try {
      return await fetchTrelloJson(`/boards/${encodeURIComponent(boardId)}/lists`);
    } catch (error) {
      return getWithRetry(`/trello/boards/${encodeURIComponent(boardId)}/lists`);
    }
  },
  getCards: async (listId: string) => {
    try {
      return await fetchTrelloJson(`/lists/${encodeURIComponent(listId)}/cards`);
    } catch (error) {
      return getWithRetry(`/trello/lists/${encodeURIComponent(listId)}/cards`);
    }
  },
  getProjectTrelloData: async (projectId: number) =>
    getWithRetry(`/dashboard/trello/${projectId}`) as Promise<{ lists: Array<{ listId: string; listName: string; cards: any[] }> }>,
  linkAccount: async (token: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/trello/link', { token });
    return response.data;
  },
};
