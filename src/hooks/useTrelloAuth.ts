import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';

const TRELLO_API_KEY = process.env.NEXT_PUBLIC_TRELLO_API_KEY || '';
const TRELLO_APP_NAME = 'DevPulseX';
const REDIRECT_URI = process.env.NEXT_PUBLIC_TRELLO_REDIRECT_URI || 'http://localhost:3000/auth/callback';
const STATE_KEY = 'trello_oauth_state';

const createState = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

const writeStateCookie = (state: string) => {
  // Double-submit cookie for CSRF/state validation (short-lived)
  // SameSite=None required for cross-origin; Secure required with SameSite=None
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `trello_state=${state}; Max-Age=600; Path=/; SameSite=None${secure}`;
};

export const useTrelloAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const initiateTrelloLogin = () => {
    if (!user) {
      setError('You must be logged in to link Trello account');
      return;
    }

    if (!TRELLO_API_KEY) {
      setError(
        'Missing Trello API key. Set NEXT_PUBLIC_TRELLO_API_KEY in frontend/.env.local (see frontend/.env.local.example).'
      );
      return;
    }

    const state = createState();
    sessionStorage.setItem(STATE_KEY, state);
    writeStateCookie(state);

    const params = new URLSearchParams({
      key: TRELLO_API_KEY,
      name: TRELLO_APP_NAME,
      expiration: '30days',
      response_type: 'token',
      scope: 'read,write',
      return_url: `${REDIRECT_URI}?state=${state}`,
    });

    const authUrl = `https://trello.com/1/authorize?${params.toString()}`;
    setLoading(true);
    window.location.href = authUrl;
  };

  return {
    initiateTrelloLogin,
    loading,
    error,
  };
};
