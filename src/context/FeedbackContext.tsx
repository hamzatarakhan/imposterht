import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
  const [skipMarkOnSubmit, setSkipMarkOnSubmit] = useState(false);

  useEffect(() => {
    setRoundsAtTrigger(getRoundsCompleted());
    setSkipMarkOnSubmit(true);
    setOpen(true);
  }, [getRoundsCompleted]);

  const notifyRoundCompleted = useCallback(
    (sessionKey: string) => {
      incrementRound(sessionKey);
      // Defer slightly so the result UI renders first
      setTimeout(() => {
        if (shouldShowFeedback()) {
          setRoundsAtTrigger(getRoundsCompleted());
          setSkipMarkOnSubmit(false);
          setOpen(true);
        }
      }, 600);
    },
    [incrementRound, shouldShowFeedback, getRoundsCompleted],
  );

  const handleSubmitted = useCallback(() => {
    if (!skipMarkOnSubmit) {
      markFeedbackGiven();
    }
    setSkipMarkOnSubmit(false);
    setOpen(false);
  }, [markFeedbackGiven, skipMarkOnSubmit]);

  return (
    <FeedbackContext.Provider value={{ notifyRoundCompleted }}>
      {children}
      <FeedbackModal open={open} roundsCompleted={roundsAtTrigger} onSubmitted={handleSubmitted} />
    </FeedbackContext.Provider>
  );
};
