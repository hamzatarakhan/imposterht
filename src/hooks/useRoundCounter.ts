import { useCallback } from 'react';

const STORAGE_KEY_V1 = 'feedback_state_v1';
const STORAGE_KEY = 'feedback_state_v2';
const SESSION_FLAG_PREFIX = 'feedback_round_counted_';
const USER_NAME_KEY = 'user_name';
const APP_VERSION_KEY = 'app_build_version';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const GUESSING_ROUNDS_THRESHOLD = 18;

export type GameType = 'imposter' | 'guessing' | 'countries';

interface FeedbackState {
  rounds_completed: number; // imposter + countries
  guessing_rounds_completed: number;
  guessing_rounds_at_last_feedback: number;
  last_feedback_at: number | null; // timestamp ms
  last_feedback_app_version: string | null; // app version when feedback was last given
  is_returning_user: boolean;
  classified: boolean;
}

const defaultState = (): FeedbackState => ({
  rounds_completed: 0,
  guessing_rounds_completed: 0,
  guessing_rounds_at_last_feedback: 0,
  last_feedback_at: null,
  last_feedback_app_version: null,
  is_returning_user: false,
  classified: false,
});

const getCurrentAppVersion = (): string | null => {
  try {
    return localStorage.getItem(APP_VERSION_KEY);
  } catch {
    return null;
  }
};

const readState = (): FeedbackState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
    };
  } catch {
    return defaultState();
  }
};

const writeState = (state: FeedbackState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

const readLegacyV1 = (): { rounds_completed: number; last_feedback_at_round: number | null } | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      rounds_completed: typeof parsed.rounds_completed === 'number' ? parsed.rounds_completed : 0,
      last_feedback_at_round:
        typeof parsed.last_feedback_at_round === 'number' ? parsed.last_feedback_at_round : null,
    };
  } catch {
    return null;
  }
};

export const useRoundCounter = () => {
  /**
   * Classify user as returning vs new on first run after this update.
   * Returning = had a saved name OR had legacy feedback state.
   * Idempotent — safe to call on every mount.
   */
  const classifyUserOnce = useCallback(() => {
    const current = readState();
    if (current.classified) return;

    let isReturning = false;
    try {
      const savedName = localStorage.getItem(USER_NAME_KEY);
      if (savedName && savedName.trim().length > 0) isReturning = true;
    } catch {
      // ignore
    }

    const legacy = readLegacyV1();
    if (legacy) {
      isReturning = true;
    }

    const next: FeedbackState = {
      ...current,
      // Migrate legacy round counter so we don't lose history
      rounds_completed: legacy ? legacy.rounds_completed : current.rounds_completed,
      is_returning_user: isReturning,
      classified: true,
      // For returning users, leave last_feedback_at = null so the modal shows on first open after the update.
      last_feedback_at: null,
    };
    writeState(next);
  }, []);

  const incrementRound = useCallback(
    (sessionKey: string, gameType: GameType, count: number = 1): number => {
      // Prevent double-counting the same finished session
      const flagKey = `${SESSION_FLAG_PREFIX}${sessionKey}`;
      try {
        if (sessionStorage.getItem(flagKey)) {
          return readState().rounds_completed;
        }
        sessionStorage.setItem(flagKey, '1');
      } catch {
        // ignore
      }

      const current = readState();
      const next: FeedbackState = { ...current };
      if (gameType === 'guessing') {
        next.guessing_rounds_completed = current.guessing_rounds_completed + Math.max(1, count);
      } else {
        next.rounds_completed = current.rounds_completed + Math.max(1, count);
      }
      writeState(next);
      return next.rounds_completed + next.guessing_rounds_completed;
    },
    [],
  );

  const shouldShowFeedback = useCallback((): boolean => {
    const s = readState();
    const now = Date.now();
    const totalRounds = s.rounds_completed + s.guessing_rounds_completed;
    const currentVersion = getCurrentAppVersion();

    // App was updated since last feedback → show again on first qualifying open
    // (returning users immediately; new users after they've played at least one round)
    const versionChanged =
      currentVersion !== null &&
      s.last_feedback_app_version !== null &&
      currentVersion !== s.last_feedback_app_version;
    if (versionChanged) {
      // Returning users see it immediately after an update
      if (s.is_returning_user) return true;
      // New users see it after at least one finished round post-update
      if (totalRounds >= 1) return true;
    }

    // Returning user, hasn't seen feedback yet after the new system → show immediately
    if (s.is_returning_user && s.last_feedback_at === null) return true;

    // New user finished at least one full game (any type) → show
    if (!s.is_returning_user && totalRounds >= 1 && s.last_feedback_at === null) return true;

    // 3 days since last feedback
    if (s.last_feedback_at !== null && now - s.last_feedback_at >= THREE_DAYS_MS) return true;

    // Heavy guessing player: 18 guessing rounds since last feedback
    const guessingSinceLast = s.guessing_rounds_completed - s.guessing_rounds_at_last_feedback;
    if (guessingSinceLast >= GUESSING_ROUNDS_THRESHOLD) return true;

    return false;
  }, []);

  const markFeedbackGiven = useCallback(() => {
    const current = readState();
    writeState({
      ...current,
      last_feedback_at: Date.now(),
      last_feedback_app_version: getCurrentAppVersion(),
      guessing_rounds_at_last_feedback: current.guessing_rounds_completed,
    });
  }, []);

  const getRoundsCompleted = useCallback((): number => {
    const s = readState();
    return s.rounds_completed + s.guessing_rounds_completed;
  }, []);

  return {
    classifyUserOnce,
    incrementRound,
    shouldShowFeedback,
    markFeedbackGiven,
    getRoundsCompleted,
  };
};
