export type OAuthProvider = 'github' | 'google';

const OAUTH_STATE_KEY_PREFIX = 'devpulsex_oauth_state_';

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

export const generateOAuthState = (provider: OAuthProvider): string => {
  const random = new Uint8Array(24);
  window.crypto.getRandomValues(random);
  return `${provider}:${toBase64Url(random)}`;
};

export const persistOAuthState = (provider: OAuthProvider, state: string): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`${OAUTH_STATE_KEY_PREFIX}${provider}`, state);
};

export const getPersistedOAuthState = (provider: OAuthProvider): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(`${OAUTH_STATE_KEY_PREFIX}${provider}`);
};

export const clearPersistedOAuthState = (provider: OAuthProvider): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(`${OAUTH_STATE_KEY_PREFIX}${provider}`);
};
