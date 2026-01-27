import React from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import ModeSelectScreen from './ModeSelectScreen';
import CreateRoomScreen from './CreateRoomScreen';
import JoinRoomScreen from './JoinRoomScreen';
import LobbyScreen from './LobbyScreen';
import OnlineShowRoleScreen from './OnlineShowRoleScreen';
import OnlineDiscussionScreen from './OnlineDiscussionScreen';
import OnlineVotingScreen from './OnlineVotingScreen';
import OnlineResultScreen from './OnlineResultScreen';

const OnlineGame: React.FC = () => {
  const { screen } = useOnlineGame();

  const screens = {
    modeSelect: ModeSelectScreen,
    createRoom: CreateRoomScreen,
    joinRoom: JoinRoomScreen,
    lobby: LobbyScreen,
    onlineShowRole: OnlineShowRoleScreen,
    onlineDiscussion: OnlineDiscussionScreen,
    onlineVoting: OnlineVotingScreen,
    onlineResult: OnlineResultScreen,
  };

  const CurrentScreen = screens[screen];

  return <CurrentScreen />;
};

export default OnlineGame;
