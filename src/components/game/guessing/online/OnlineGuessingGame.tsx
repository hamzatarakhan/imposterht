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
  const { screen, room, currentPlayer } = useOnlineGuessing();
  const CurrentScreen = screens[screen];
  const showVoice = room && currentPlayer && !['guessingModeSelect', 'guessingCreateRoom', 'guessingJoinRoom'].includes(screen);

  return (
    <>
      <CurrentScreen />
      {showVoice && (
        <VoiceChatOverlay
          roomId={room.id}
          playerName={currentPlayer.name}
          playerId={currentPlayer.player_id}
        />
      )}
    </>
  );
};

export default OnlineGuessingGame;
