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
  const [open, setOpen] = useState(false);
  const [roundsAtTrigger, setRoundsAtTrigger] = useState(0);
  const onMountCheckedRef = useRef(false);
  const pendingMountCheckRef = useRef(false);

  // On first mount: classify user. Defer the shouldShow check until we're sure no update is pending,
  // so the UPDATE prompt always wins over the feedback prompt.
  useEffect(() => {
    if (onMountCheckedRef.current) return;
    classifyUserOnce();
    if (updateAvailable) {
      // Wait — update modal must take precedence
      pendingMountCheckRef.current = true;
      return;
    }
    onMountCheckedRef.current = true;
    if (shouldShowFeedback()) {
      setRoundsAtTrigger(getRoundsCompleted());
      setOpen(true);
    }
  }, [classifyUserOnce, shouldShowFeedback, getRoundsCompleted, updateAvailable]);

  // If an update appears while the feedback modal is open, hide it (without marking feedback as given).
  useEffect(() => {
    if (updateAvailable && open) {
      setOpen(false);
    }
  }, [updateAvailable, open]);

  const notifyRoundCompleted = useCallback(
    (sessionKey: string, gameType: GameType, count: number = 1) => {
      incrementRound(sessionKey, gameType, count);
      // Defer slightly so the result UI renders first
      setTimeout(() => {
        // Update prompt wins — never overlay feedback on top of it
        if (updateAvailable) return;
        if (shouldShowFeedback()) {
          setRoundsAtTrigger(getRoundsCompleted());
          setOpen(true);
        }
      }, 600);
    },
    [incrementRound, shouldShowFeedback, getRoundsCompleted, updateAvailable],
  );

  const handleSubmitted = useCallback(() => {
    markFeedbackGiven();
    setOpen(false);
  }, [markFeedbackGiven]);

  return (
    <FeedbackContext.Provider value={{ notifyRoundCompleted }}>
      {children}
      <FeedbackModal
        open={open && !updateAvailable}
        roundsCompleted={roundsAtTrigger}
        onSubmitted={handleSubmitted}
      />
    </FeedbackContext.Provider>
  );
};
