import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRoundCounter, GameType } from '@/hooks/useRoundCounter';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { useGame } from '@/context/GameContext';
import FeedbackModal from '@/components/feedback/FeedbackModal';

interface FeedbackContextValue {
  /**
   * Call when a full game round/match completes.
   * `sessionKey` should be unique per session (e.g. roomId or local timestamp).
   * `gameType` distinguishes which counter bucket to increment.
   * `count` (optional) — number of rounds played in this session (used for guessing matches with multiple rounds).
   */
  notifyRoundCompleted: (sessionKey: string, gameType: GameType, count?: number) => void;
}

const FeedbackContext = createContext<FeedbackContextValue>({
  notifyRoundCompleted: () => {},
});

export const useFeedbackTrigger = () => useContext(FeedbackContext);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    classifyUserOnce,
    incrementRound,
    shouldShowFeedback,
    markFeedbackGiven,
    getRoundsCompleted,
  } = useRoundCounter();
  const { updateAvailable } = useServiceWorkerUpdate();
  const { screen } = useGame();
  const [open, setOpen] = useState(false);
  const [roundsAtTrigger, setRoundsAtTrigger] = useState(0);
  const onMountCheckedRef = useRef(false);

  // Update notification UI only renders in standalone (PWA) mode.
  // For browser users, `updateAvailable` will be true but no UI exists to apply
  // the update — so we must NOT block the feedback modal in that case.
  const isStandalone =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(display-mode: standalone)')?.matches;
  const updateBlocksFeedback = updateAvailable && isStandalone;

  // Classify user once on mount (cheap, no UI side effect).
  useEffect(() => {
    classifyUserOnce();
  }, [classifyUserOnce]);

  // Defer the on-mount auto-open until the user has actually left the splash screen
  // AND no service-worker update is pending. This prevents the modal from popping
  // over the splash (especially in browsers where the splash is the first thing seen).
  useEffect(() => {
    if (onMountCheckedRef.current) return;
    if (screen === 'splash') return;
    if (updateBlocksFeedback) return; // update prompt always wins (PWA only)
    onMountCheckedRef.current = true;
    if (shouldShowFeedback()) {
      setRoundsAtTrigger(getRoundsCompleted());
      setOpen(true);
    }
  }, [screen, updateBlocksFeedback, shouldShowFeedback, getRoundsCompleted]);

  // If an update appears while the feedback modal is open, hide it (without marking feedback as given).
  useEffect(() => {
    if (updateBlocksFeedback && open) {
      setOpen(false);
    }
  }, [updateBlocksFeedback, open]);

  const notifyRoundCompleted = useCallback(
    (sessionKey: string, gameType: GameType, count: number = 1) => {
      incrementRound(sessionKey, gameType, count);
      // Defer slightly so the result UI renders first
      setTimeout(() => {
        // Update prompt wins — never overlay feedback on top of it (PWA only)
        if (updateBlocksFeedback) return;
        if (shouldShowFeedback()) {
          setRoundsAtTrigger(getRoundsCompleted());
          setOpen(true);
        }
      }, 600);
    },
    [incrementRound, shouldShowFeedback, getRoundsCompleted, updateBlocksFeedback],
  );

  const handleSubmitted = useCallback(() => {
    markFeedbackGiven();
    setOpen(false);
  }, [markFeedbackGiven]);

  return (
    <FeedbackContext.Provider value={{ notifyRoundCompleted }}>
      {children}
      <FeedbackModal
        open={open && !updateBlocksFeedback}
        roundsCompleted={roundsAtTrigger}
        onSubmitted={handleSubmitted}
      />
    </FeedbackContext.Provider>
  );
};
