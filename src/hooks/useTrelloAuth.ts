import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';

const TRELLO_API_KEY = process.env.NEXT_PUBLIC_TRELLO_API_KEY!;
const TRELLO_APP_NAME = 'DevPulseX';
const REDIRECT_URI = process.env.NEXT_PUBLIC_TRELLO_REDIRECT_URI || 'http://localhost:3000/auth/callback';

export const useTrelloAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const initiateTrelloLogin = () => {
    if (!user) {
      setError('You must be logged in to link Trello account');
      return;
    }

    const params = new URLSearchParams({
      key: TRELLO_API_KEY,
      name: TRELLO_APP_NAME,
      expiration: 'never',
      response_type: 'token',
      scope: 'read,write',
      return_url: `${REDIRECT_URI}?state=trello`,
    });

    const authUrl = `https://trello.com/1/authorize?${params.toString()}`;
    window.location.href = authUrl;
  };

  return {
    initiateTrelloLogin,
    loading,
    error,
  };
};
