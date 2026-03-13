import React from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { VoiceChatProvider } from '@/context/VoiceChatContext';
import FloatingVoiceBar from '@/components/game/FloatingVoiceBar';
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

// Screens where voice chat should be available
const voiceScreens = ['guessingLobby', 'guessingOnlineShowWord', 'guessingOnlinePlay', 'guessingOnlineRoundResult', 'guessingOnlineFinalResult'];

const OnlineGuessingGameInner: React.FC = () => {
  const { screen, currentPlayer } = useOnlineGuessing();
  const CurrentScreen = screens[screen];
  const showVoice = voiceScreens.includes(screen);

  return (
    <>
      <CurrentScreen />
      {showVoice && <FloatingVoiceBar currentPlayerId={currentPlayer?.player_id} />}
    </>
  );
};

const OnlineGuessingGame: React.FC = () => {
  const { room, currentPlayer } = useOnlineGuessing();

  return (
    <VoiceChatProvider
      roomId={room?.id}
      playerName={currentPlayer?.name || ''}
      playerId={currentPlayer?.player_id || ''}
    >
      <OnlineGuessingGameInner />
    </VoiceChatProvider>
  );
};

export default OnlineGuessingGame;
