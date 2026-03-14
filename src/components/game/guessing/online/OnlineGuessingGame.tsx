import React from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import GuessingModeSelectScreen from './GuessingModeSelectScreen';
import GuessingCreateRoomScreen from './GuessingCreateRoomScreen';
import GuessingJoinRoomScreen from './GuessingJoinRoomScreen';
import GuessingLobbyScreen from './GuessingLobbyScreen';
import GuessingOnlineShowWordScreen from './GuessingOnlineShowWordScreen';
import GuessingOnlinePlayScreen from './GuessingOnlinePlayScreen';
import GuessingOnlineRoundResultScreen from './GuessingOnlineRoundResultScreen';
import GuessingOnlineFinalResultScreen from './GuessingOnlineFinalResultScreen';
import VoiceChatOverlay from '@/components/game/VoiceChatOverlay';
import { PresenceProvider } from '@/context/PresenceContext';

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
  const { screen, room, currentPlayer, players } = useOnlineGuessing();
  const { voiceChatEnabled, presenceTrackingEnabled } = useSettings();
  const CurrentScreen = screens[screen];
  const isInRoom = room && currentPlayer && !['guessingModeSelect', 'guessingCreateRoom', 'guessingJoinRoom'].includes(screen);

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

export default OnlineGuessingGame;
