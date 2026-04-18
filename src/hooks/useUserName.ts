import { useEffect, useState, useCallback } from 'react';

const NAME_KEY = 'user_name';
const AVATAR_KEY = 'user_avatar';

/**
 * Unified hook to remember the user's name and avatar across all games.
 * Persists to localStorage so the name auto-fills next time the user opens the app
 * (whether they go to Imposter, Guessing, or any future game).
 */
export function useUserName(defaultAvatar: string = '👤') {
  const [name, setNameState] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(NAME_KEY) || '';
  });

  const [avatar, setAvatarState] = useState<string>(() => {
    if (typeof window === 'undefined') return defaultAvatar;
    return localStorage.getItem(AVATAR_KEY) || defaultAvatar;
  });

  // Sync across tabs / re-mounts
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === NAME_KEY) setNameState(e.newValue || '');
      if (e.key === AVATAR_KEY) setAvatarState(e.newValue || defaultAvatar);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [defaultAvatar]);

  const setName = useCallback((value: string) => {
    setNameState(value);
    try {
      if (value.trim()) {
        localStorage.setItem(NAME_KEY, value);
      }
    } catch (e) {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }, []);

  const setAvatar = useCallback((value: string) => {
    setAvatarState(value);
    try {
      localStorage.setItem(AVATAR_KEY, value);
    } catch (e) {
      // Ignore
    }
  }, []);

  /** Persist immediately (e.g. on successful join/create) */
  const persist = useCallback((nameValue?: string, avatarValue?: string) => {
    try {
      const finalName = (nameValue ?? name).trim();
      if (finalName) localStorage.setItem(NAME_KEY, finalName);
      if (avatarValue) localStorage.setItem(AVATAR_KEY, avatarValue);
    } catch (e) {
      // Ignore
    }
  }, [name]);

  return { name, setName, avatar, setAvatar, persist };
}
