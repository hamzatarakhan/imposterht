import React from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import GuessingSetupScreen from './GuessingSetupScreen';
import GuessingPassPhoneScreen from './GuessingPassPhoneScreen';
import GuessingShowWordScreen from './GuessingShowWordScreen';
import GuessingPlayScreen from './GuessingPlayScreen';
import GuessingRoundResultScreen from './GuessingRoundResultScreen';
import GuessingFinalResultScreen from './GuessingFinalResultScreen';

const screens = {
  guessingSetup: GuessingSetupScreen,
  guessingPlayerNames: GuessingSetupScreen, // handled in setup
  guessingPassPhone: GuessingPassPhoneScreen,
  guessingShowWord: GuessingShowWordScreen,
  guessingPlay: GuessingPlayScreen,
  guessingRoundResult: GuessingRoundResultScreen,
  guessingFinalResult: GuessingFinalResultScreen,
};

const GuessingGame: React.FC = () => {
  const { screen } = useGuessingGame();
  const CurrentScreen = screens[screen];
  return <CurrentScreen />;
};

export default GuessingGame;
