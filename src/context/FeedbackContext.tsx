import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRoundCounter, GameType } from '@/hooks/useRoundCounter';
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
  const [open, setOpen] = useState(false);
  const [roundsAtTrigger, setRoundsAtTrigger] = useState(0);
  const onMountCheckedRef = useRef(false);

  // On first mount: classify user, then check if we should show the feedback modal immediately
  // (returning users post-update, or anyone whose 3-day window has elapsed).
  useEffect(() => {
    if (onMountCheckedRef.current) return;
    onMountCheckedRef.current = true;
    classifyUserOnce();
    if (shouldShowFeedback()) {
      setRoundsAtTrigger(getRoundsCompleted());
      setOpen(true);
    }
  }, [classifyUserOnce, shouldShowFeedback, getRoundsCompleted]);

  const notifyRoundCompleted = useCallback(
    (sessionKey: string, gameType: GameType, count: number = 1) => {
      incrementRound(sessionKey, gameType, count);
      // Defer slightly so the result UI renders first
      setTimeout(() => {
        if (shouldShowFeedback()) {
          setRoundsAtTrigger(getRoundsCompleted());
          setOpen(true);
        }
      }, 600);
    },
    [incrementRound, shouldShowFeedback, getRoundsCompleted],
  );

  const handleSubmitted = useCallback(() => {
    markFeedbackGiven();
    setOpen(false);
  }, [markFeedbackGiven]);

  return (
    <FeedbackContext.Provider value={{ notifyRoundCompleted }}>
      {children}
      <FeedbackModal open={open} roundsCompleted={roundsAtTrigger} onSubmitted={handleSubmitted} />
    </FeedbackContext.Provider>
  );
};
