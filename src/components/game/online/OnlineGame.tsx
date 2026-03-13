import React from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { VoiceChatProvider } from '@/context/VoiceChatContext';
import FloatingVoiceBar from '@/components/game/FloatingVoiceBar';
import ModeSelectScreen from './ModeSelectScreen';
import CreateRoomScreen from './CreateRoomScreen';
import JoinRoomScreen from './JoinRoomScreen';
import LobbyScreen from './LobbyScreen';
import OnlineShowRoleScreen from './OnlineShowRoleScreen';
import OnlineDiscussionScreen from './OnlineDiscussionScreen';
import OnlineVotingScreen from './OnlineVotingScreen';
import OnlineWordGuessScreen from './OnlineWordGuessScreen';
import OnlineResultScreen from './OnlineResultScreen';

const screenMap = {
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

// Screens where voice chat floating bar should appear
const voiceScreens = ['lobby', 'onlineShowRole', 'onlineDiscussion', 'onlineVoting', 'onlineWordGuess', 'onlineResult'];

const OnlineGameInner: React.FC = () => {
  const { screen, currentPlayer } = useOnlineGame();
  const CurrentScreen = screenMap[screen];
  const showVoice = voiceScreens.includes(screen);

  return (
    <>
      <CurrentScreen />
      {showVoice && <FloatingVoiceBar currentPlayerId={currentPlayer?.player_id} />}
    </>
  );
};

const OnlineGame: React.FC = () => {
  const { room, currentPlayer } = useOnlineGame();

  return (
    <VoiceChatProvider
      roomId={room?.id}
      playerName={currentPlayer?.name || ''}
      playerId={currentPlayer?.player_id || ''}
    >
      <OnlineGameInner />
    </VoiceChatProvider>
  );
};

export default OnlineGame;
