import React from 'react';
import { useGame } from '@/context/GameContext';
import SplashScreen from './SplashScreen';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import HowToPlayScreen from './HowToPlayScreen';
import SetupScreen from './SetupScreen';
import PlayerNamesScreen from './PlayerNamesScreen';
import PassPhoneScreen from './PassPhoneScreen';
import ShowRoleScreen from './ShowRoleScreen';
import DiscussionScreen from './DiscussionScreen';
import VotingScreen from './VotingScreen';
import ResultScreen from './ResultScreen';

const Game: React.FC = () => {
  const { screen } = useGame();

  const screens = {
    splash: SplashScreen,
    home: HomeScreen,
    settings: SettingsScreen,
    howToPlay: HowToPlayScreen,
    setup: SetupScreen,
    playerNames: PlayerNamesScreen,
    passPhone: PassPhoneScreen,
    showRole: ShowRoleScreen,
    discussion: DiscussionScreen,
    voting: VotingScreen,
    result: ResultScreen,
  };

  const CurrentScreen = screens[screen];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      <CurrentScreen />
    </div>
  );
};

export default Game;
