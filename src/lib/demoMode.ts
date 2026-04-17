export const DEMO_MODE_KEY = 'devpulsex_demo_mode';

export const isDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DEMO_MODE_KEY) === '1';
};

export const setDemoMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  if (enabled) {
    window.localStorage.setItem(DEMO_MODE_KEY, '1');
    return;
  }
  window.localStorage.removeItem(DEMO_MODE_KEY);
};
