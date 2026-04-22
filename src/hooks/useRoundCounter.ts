import { useCallback } from 'react';

const STORAGE_KEY = 'feedback_state_v1';
const SESSION_FLAG_PREFIX = 'feedback_round_counted_';

interface FeedbackState {
  rounds_completed: number;
  last_feedback_at_round: number | null;
}

const readState = (): FeedbackState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { rounds_completed: 0, last_feedback_at_round: null };
    const parsed = JSON.parse(raw);
    return {
      rounds_completed: typeof parsed.rounds_completed === 'number' ? parsed.rounds_completed : 0,
      last_feedback_at_round:
        typeof parsed.last_feedback_at_round === 'number' ? parsed.last_feedback_at_round : null,
    };
  } catch {
    return { rounds_completed: 0, last_feedback_at_round: null };
  }
};

const writeState = (state: FeedbackState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

export const useRoundCounter = () => {
  const incrementRound = useCallback((sessionKey: string): number => {
    // Prevent double-counting the same finished round
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
    const next: FeedbackState = {
      ...current,
      rounds_completed: current.rounds_completed + 1,
    };
    writeState(next);
    return next.rounds_completed;
  }, []);

  const shouldShowFeedback = useCallback((): boolean => {
    const { rounds_completed, last_feedback_at_round } = readState();
    if (rounds_completed >= 1 && last_feedback_at_round === null) return true;
    if (last_feedback_at_round !== null && rounds_completed - last_feedback_at_round >= 5)
      return true;
    return false;
  }, []);

  const markFeedbackGiven = useCallback(() => {
    const current = readState();
    writeState({ ...current, last_feedback_at_round: current.rounds_completed });
  }, []);

  const getRoundsCompleted = useCallback((): number => readState().rounds_completed, []);

  return { incrementRound, shouldShowFeedback, markFeedbackGiven, getRoundsCompleted };
};
