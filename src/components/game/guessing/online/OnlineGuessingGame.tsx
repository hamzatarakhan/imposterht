import React from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import GuessingModeSelectScreen from './GuessingModeSelectScreen';
import GuessingCreateRoomScreen from './GuessingCreateRoomScreen';
import GuessingJoinRoomScreen from './GuessingJoinRoomScreen';
import GuessingLobbyScreen from './GuessingLobbyScreen';
import GuessingOnlineShowWordScreen from './GuessingOnlineShowWordScreen';
import GuessingOnlinePlayScreen from './GuessingOnlinePlayScreen';
import GuessingOnlineRoundResultScreen from './GuessingOnlineRoundResultScreen';
import GuessingOnlineFinalResultScreen from './GuessingOnlineFinalResultScreen';

const screens = {
  guessingModeSelect: GuessingModeSelectScreen,
  guessingCreateRoom: GuessingCreateRoomScreen,
  guessingJoinRoom: GuessingJoinRoomScreen,
  guessingLobby: GuessingLobbyScreen,
  guessingOnlineShowWord: GuessingOnlineShowWordScreen,
  guessingOnlinePlay: GuessingOnlinePlayScreen,
  guessingOnlineRoundResult: GuessingOnlineRoundResultScreen,
  guessingOnlineFinalResult: GuessingOnlineFinalResultScreen,
};

const OnlineGuessingGame: React.FC = () => {
  const { screen } = useOnlineGuessing();
  const CurrentScreen = screens[screen];
  return <CurrentScreen />;
};

export default OnlineGuessingGame;
