import { useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuthStore();

  const initiateGoogleLogin = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: 'google', // To differentiate from GitHub
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleGoogleCallback = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.googleLogin(code);
      setAuth(response.user, response.token);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    initiateGoogleLogin,
    handleGoogleCallback,
    loading,
    error,
  };
};
