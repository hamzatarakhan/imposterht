import React from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import ModeSelectScreen from './ModeSelectScreen';
import CreateRoomScreen from './CreateRoomScreen';
import JoinRoomScreen from './JoinRoomScreen';
import LobbyScreen from './LobbyScreen';
import OnlineShowRoleScreen from './OnlineShowRoleScreen';
import OnlineDiscussionScreen from './OnlineDiscussionScreen';
import OnlineVotingScreen from './OnlineVotingScreen';
import OnlineWordGuessScreen from './OnlineWordGuessScreen';
import OnlineResultScreen from './OnlineResultScreen';
import VoiceChatOverlay from '@/components/game/VoiceChatOverlay';
import { PresenceProvider } from '@/context/PresenceContext';

const OnlineGame: React.FC = () => {
  const { screen, room, currentPlayer, players } = useOnlineGame();
  const { voiceChatEnabled, presenceTrackingEnabled } = useSettings();

  const screens = {
    modeSelect: ModeSelectScreen,
    createRoom: CreateRoomScreen,
    joinRoom: JoinRoomScreen,
    lobby: LobbyScreen,
    onlineShowRole: OnlineShowRoleScreen,
    onlineDiscussion: OnlineDiscussionScreen,
    onlineVoting: OnlineVotingScreen,
    onlineWordGuess: OnlineWordGuessScreen,
    onlineResult: OnlineResultScreen,
  };

  const CurrentScreen = screens[screen];
  const isInRoom = room && currentPlayer && !['modeSelect', 'createRoom', 'joinRoom'].includes(screen);

  if (isInRoom) {
    let content = <CurrentScreen />;

    if (voiceChatEnabled) {
      content = (
        <VoiceChatOverlay
          roomId={room.id}
          playerName={currentPlayer.name}
          playerId={currentPlayer.player_id}
        >
          {content}
        </VoiceChatOverlay>
      );
    }

    if (presenceTrackingEnabled) {
      return (
        <PresenceProvider roomId={room.id} playerId={currentPlayer.player_id} players={players}>
          {content}
        </PresenceProvider>
      );
    }

    return content;
  }

  return <CurrentScreen />;
};

export default OnlineGame;
