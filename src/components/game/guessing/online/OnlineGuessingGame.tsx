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
  const CurrentScreen = screens[screen];
  const showVoice = room && currentPlayer && !['guessingModeSelect', 'guessingCreateRoom', 'guessingJoinRoom'].includes(screen) && room.voice_chat_enabled;
  const showPresence = room && currentPlayer && !['guessingModeSelect', 'guessingCreateRoom', 'guessingJoinRoom'].includes(screen) && room.presence_enabled;
  const inRoom = room && currentPlayer && !['guessingModeSelect', 'guessingCreateRoom', 'guessingJoinRoom'].includes(screen);

  if (inRoom) {
    let content = <CurrentScreen />;
    
    if (showVoice) {
      content = (
        <VoiceChatOverlay roomId={room.id} playerName={currentPlayer.name} playerId={currentPlayer.player_id}>
          {content}
        </VoiceChatOverlay>
      );
    }
    
    if (showPresence) {
      content = (
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
