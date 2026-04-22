import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY_STORAGE = 'app_session_key_v1';

const getOrCreateSessionKey = (): string => {
  try {
    let key = sessionStorage.getItem(SESSION_KEY_STORAGE);
    if (!key) {
      key = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY_STORAGE, key);
    }
    return key;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
};

const getUserId = (): string | null => {
  try { return localStorage.getItem('user_id'); } catch { return null; }
};
const getUserName = (): string | null => {
  try { return localStorage.getItem('user_name'); } catch { return null; }
};
const getUserAvatar = (): string | null => {
  try { return localStorage.getItem('user_avatar'); } catch { return null; }
};

const getAppVersion = async (): Promise<string | null> => {
  try {
    const res = await fetch('/version.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.version ?? null;
  } catch {
    return null;
  }
};

const isPwa = (): boolean => {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      // @ts-expect-error: legacy
      window.navigator.standalone === true
    );
  } catch {
    return false;
  }
};

let bootstrapped = false;

/** Logs (or refreshes) the current app session. Safe to call multiple times. */
export const logAppSession = async (gamePlayed?: string): Promise<void> => {
  try {
    const session_key = getOrCreateSessionKey();
    const app_version = await getAppVersion();
    const user_id = getUserId();

    await supabase.rpc('log_app_session', {
      p_session_key: session_key,
      p_user_id: user_id && /^[0-9a-f-]{36}$/i.test(user_id) ? user_id : null,
      p_user_name: getUserName(),
      p_user_avatar: getUserAvatar(),
      p_app_version: app_version,
      p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      p_language: typeof navigator !== 'undefined' ? navigator.language : null,
      p_is_pwa: isPwa(),
      p_referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      p_game_played: gamePlayed ?? null,
    });
  } catch (e) {
    // Silent — analytics must never break the app
    console.warn('Session log failed', e);
  }
};

/** Call once on app boot — fires immediately and again whenever the tab regains focus. */
export const bootstrapSessionTracking = (): void => {
  if (bootstrapped) return;
  bootstrapped = true;

  void logAppSession();

  // Refresh last_seen_at when user comes back
  const refresh = () => { void logAppSession(); };
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh();
  });
};

/** Mark which game the user is currently playing. */
export const markGamePlayed = (game: string): void => {
  void logAppSession(game);
};
