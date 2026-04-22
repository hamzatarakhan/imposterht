import React, { createContext, useCallback, useContext, useState } from 'react';
import { useRoundCounter } from '@/hooks/useRoundCounter';
import FeedbackModal from '@/components/feedback/FeedbackModal';

interface FeedbackContextValue {
  /** Call when a full game round completes. `sessionKey` should be unique per round (e.g. roomId + roundNumber, or local timestamp). */
  notifyRoundCompleted: (sessionKey: string) => void;
}

const FeedbackContext = createContext<FeedbackContextValue>({
  notifyRoundCompleted: () => {},
});

export const useFeedbackTrigger = () => useContext(FeedbackContext);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { incrementRound, shouldShowFeedback, markFeedbackGiven, getRoundsCompleted } =
    useRoundCounter();
  const [open, setOpen] = useState(false);
  const [roundsAtTrigger, setRoundsAtTrigger] = useState(0);

  const notifyRoundCompleted = useCallback(
    (sessionKey: string) => {
      incrementRound(sessionKey);
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
