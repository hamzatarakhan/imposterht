import React from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
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
  const showVoice = room && currentPlayer && !['modeSelect', 'createRoom', 'joinRoom'].includes(screen) && room.voice_chat_enabled;
  const showPresence = room && currentPlayer && !['modeSelect', 'createRoom', 'joinRoom'].includes(screen) && room.presence_enabled;

  if (showVoice) {
    return (
      <PresenceProvider roomId={room.id} playerId={currentPlayer.player_id} players={players}>
        <VoiceChatOverlay
          roomId={room.id}
          playerName={currentPlayer.name}
          playerId={currentPlayer.player_id}
        >
          <CurrentScreen />
        </VoiceChatOverlay>
      </PresenceProvider>
    );
  }

  return <CurrentScreen />;
};

export default OnlineGame;
