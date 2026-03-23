import React from "react";
import { GameProvider, useGame } from '@/context/GameContext';
import { OnlineGameProvider, useOnlineGame } from '@/context/OnlineGameContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { GuessingGameProvider } from '@/context/GuessingGameContext';
import { OnlineGuessingProvider, useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { CountriesProvider, useCountries } from '@/context/CountriesGameContext';
import SplashScreen from './SplashScreen';
import HubScreen from './HubScreen';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import HowToPlayScreen from './HowToPlayScreen';
import SetupScreen from './SetupScreen';
import PlayerNamesScreen from './PlayerNamesScreen';
import PassPhoneScreen from './PassPhoneScreen';
import ShowRoleScreen from './ShowRoleScreen';
import DiscussionScreen from './DiscussionScreen';
import VotingScreen from './VotingScreen';
import WordGuessScreen from './WordGuessScreen';
import ResultScreen from './ResultScreen';
import OnlineGame from './online/OnlineGame';
import ModeSelectScreen from './online/ModeSelectScreen';
import GuessingGame from './guessing/GuessingGame';
import OnlineGuessingGame from './guessing/online/OnlineGuessingGame';
import CountriesGame from './countries/CountriesGame';

const GameContent: React.FC = () => {
  const { screen } = useGame();
  const { screen: onlineScreen, pendingJoinCode } = useOnlineGame();
  const { screen: guessingOnlineScreen } = useOnlineGuessing();
  const { screen: countriesScreen, pendingJoinCode: countriesPendingJoin } = useCountries();

  // Imposter online flow
  if (pendingJoinCode || onlineScreen === 'joinRoom') {
    return <div className="max-w-md mx-auto min-h-screen bg-background relative"><OnlineGame /></div>;
  }
  if (onlineScreen !== 'modeSelect') {
    return <div className="max-w-md mx-auto min-h-screen bg-background relative"><OnlineGame /></div>;
  }

  // Guessing online flow
  const activeGuessingScreens = ['guessingCreateRoom', 'guessingJoinRoom', 'guessingLobby', 'guessingOnlineShowWord', 'guessingOnlinePlay', 'guessingOnlineRoundResult', 'guessingOnlineFinalResult'];
  if (activeGuessingScreens.includes(guessingOnlineScreen)) {
    return <div className="max-w-md mx-auto min-h-screen bg-background relative"><OnlineGuessingGame /></div>;
  }

  // Countries flow
  const activeCountriesScreens = ['countriesJoinRoom', 'countriesAdmin', 'countriesSpectator'];
  if (countriesPendingJoin || activeCountriesScreens.includes(countriesScreen)) {
    return <div className="max-w-md mx-auto min-h-screen bg-background relative"><CountriesGame /></div>;
  }

  // Guessing local flow
  const activeGuessingLocalScreens = ['guessingSetup', 'guessingPassPhone', 'guessingShowWord', 'guessingPlay', 'guessingRoundResult', 'guessingFinalResult'];
  if (activeGuessingLocalScreens.includes(screen)) {
    return <div className="max-w-md mx-auto min-h-screen bg-background relative"><GuessingGame /></div>;
  }

  if (screen === 'modeSelect') {
    return <div className="max-w-md mx-auto min-h-screen bg-background relative"><ModeSelectScreen /></div>;
  }

  const screens = {
    splash: SplashScreen,
    hub: HubScreen,
    home: HomeScreen,
    settings: SettingsScreen,
    howToPlay: HowToPlayScreen,
    modeSelect: ModeSelectScreen,
    guessingSetup: GuessingGame,
    setup: SetupScreen,
    playerNames: PlayerNamesScreen,
    passPhone: PassPhoneScreen,
    showRole: ShowRoleScreen,
    discussion: DiscussionScreen,
    voting: VotingScreen,
    wordGuess: WordGuessScreen,
    result: ResultScreen,
  };

  const CurrentScreen = screens[screen];
  return <div className="max-w-md mx-auto min-h-screen bg-background relative"><CurrentScreen /></div>;
};

const Game: React.FC = () => (
  <SettingsProvider>
    <GameProvider>
      <OnlineGameProvider>
        <GuessingGameProvider>
          <OnlineGuessingProvider>
            <CountriesProvider>
              <GameContent />
            </CountriesProvider>
          </OnlineGuessingProvider>
        </GuessingGameProvider>
      </OnlineGameProvider>
    </GameProvider>
  </SettingsProvider>
);

export default Game;
