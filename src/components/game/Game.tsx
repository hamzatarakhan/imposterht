import React from "react";
import { GameProvider, useGame } from '@/context/GameContext';
import { OnlineGameProvider, useOnlineGame } from '@/context/OnlineGameContext';
import { SettingsProvider } from '@/context/SettingsContext';
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
import OnlineGame from './online/OnlineGame';
import ModeSelectScreen from './online/ModeSelectScreen';

const GameContent: React.FC = () => {
  const { screen } = useGame();
  const { screen: onlineScreen, pendingJoinCode } = useOnlineGame();

  // If we have a pending join code, go directly to online join screen
  if (pendingJoinCode || onlineScreen === 'joinRoom') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background relative">
        <OnlineGame />
      </div>
    );
  }

  // If in online flow (not modeSelect), show online screens
  if (onlineScreen !== 'modeSelect') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background relative">
        <OnlineGame />
      </div>
    );
  }

  // If user selected modeSelect from home, show mode selection
  if (screen === 'modeSelect') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background relative">
        <ModeSelectScreen />
      </div>
    );
  }

  const screens = {
    splash: SplashScreen,
    home: HomeScreen,
    settings: SettingsScreen,
    howToPlay: HowToPlayScreen,
    modeSelect: ModeSelectScreen,
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

const Game: React.FC = () => {
  return (
    <SettingsProvider>
      <GameProvider>
        <OnlineGameProvider>
          <GameContent />
        </OnlineGameProvider>
      </GameProvider>
    </SettingsProvider>
  );
};

export default Game;
