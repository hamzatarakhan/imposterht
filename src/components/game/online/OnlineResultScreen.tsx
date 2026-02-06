import React, { useEffect, useMemo, useState } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { Trophy, Skull, Home, RotateCcw, Medal, Crown } from 'lucide-react';
import * as roomService from '@/services/roomService';
import WordGuessScreen from './WordGuessScreen';

interface PlayerWithScore {
  id: string;
  player_id: string;
  name: string;
  avatar: string;
  score: number;
  roundScore: number;
  is_imposter: boolean;
}

interface ImposterInfo {
  player_id: string;
  name: string;
  avatar: string;
}

const OnlineResultScreen: React.FC = () => {
  const { room, players, currentPlayer, leaveRoom, restartGame, isHost } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  const [secretWord, setSecretWord] = useState<string | null>(null);
  const [imposters, setImposters] = useState<ImposterInfo[]>([]);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showWordGuess, setShowWordGuess] = useState(false);
  const [myIsImposter, setMyIsImposter] = useState(false);

  // Check if current player is imposter and should guess word
  useEffect(() => {
    const checkImposterStatus = async () => {
      if (room?.id && currentPlayer?.player_id) {
        const isImp = await roomService.getMyRole(room.id);
        setMyIsImposter(isImp);
        
        // Show word guess screen if imposter was caught and hasn't guessed yet
        if (isImp && room.winner === 'players' && room.word_guess_status === 'pending') {
          setShowWordGuess(true);
        }
      }
    };
    checkImposterStatus();
  }, [room?.id, room?.winner, room?.word_guess_status, currentPlayer?.player_id]);

  // Fetch secret word and imposters when game is finished
  useEffect(() => {
    const fetchGameData = async () => {
      if (room?.id && room.status === 'finished') {
        const [word, impostersList] = await Promise.all([
          roomService.getFinishedGameWord(room.id),
          roomService.getImpostersAfterFinish(room.id)
        ]);
        setSecretWord(word);
        setImposters(impostersList);
      }
    };
    fetchGameData();
  }, [room?.id, room?.status]);

  const isWinner = room?.winner === 'players' 
    ? !imposters.some(imp => imp.player_id === currentPlayer?.player_id)
    : imposters.some(imp => imp.player_id === currentPlayer?.player_id);

  // Calculate round scores based on the round result
  const playersWithScores = useMemo((): PlayerWithScore[] => {
    return players.map(player => {
      const isImposter = imposters.some(imp => imp.player_id === player.player_id);
      const isPlayerWinner = room?.winner === 'players' ? !isImposter : isImposter;
      // Imposter gets 3 points for winning, regular players get 1 point
      const roundScore = isPlayerWinner ? (isImposter ? 3 : 1) : 0;
      return {
        id: player.id,
        player_id: player.player_id,
        name: player.name,
        avatar: player.avatar,
        score: player.score || 0, // Cumulative score from DB
        roundScore,
        is_imposter: isImposter,
      };
    }).sort((a, b) => b.score - a.score); // Sort by cumulative score
  }, [players, room?.winner, imposters]);

  // Sound and vibration on result
  useEffect(() => {
    if (imposters.length > 0 && !showWordGuess) {
      if (isWinner) {
        playSound('win');
        vibrate(100);
      } else {
        playSound('lose');
        vibrate(200);
      }
    }
  }, [isWinner, playSound, vibrate, imposters.length, showWordGuess]);

  const handlePlayAgain = async () => {
    if (!isHost) return;
    
    playSound('click');
    vibrate(50);
    setIsRestarting(true);
    
    const success = await restartGame();
    if (!success) {
      setIsRestarting(false);
    }
    // If success, the room status will change and auto-navigate will handle the rest
  };

  const handleLeave = async () => {
    playSound('click');
    vibrate(50);
    await leaveRoom();
  };

  // Sort players by votes
  const sortedPlayers = [...players].sort((a, b) => b.votes - a.votes);
  const mostVoted = sortedPlayers[0];
  const mostVotedIsImposter = imposters.some(imp => imp.player_id === mostVoted?.player_id);

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  // Show word guess screen for imposter
  if (showWordGuess && secretWord) {
    return (
      <WordGuessScreen 
        secretWord={secretWord} 
        onComplete={() => setShowWordGuess(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 ${
        room?.winner === 'players'
          ? 'bg-gradient-to-br from-background via-accent/10 to-background'
          : 'bg-gradient-to-br from-background via-imposter/10 to-background'
      }`} />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        {/* Winner Announcement */}
        <div className="mb-4 animate-reveal">
          {room?.winner === 'players' ? (
            <>
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-accent/20 flex items-center justify-center glow-accent">
                <Trophy className="text-accent" size={32} />
              </div>
              <h1 className="text-2xl font-black text-accent mb-1">
                🎉 فاز اللاعبون!
              </h1>
              <p className="text-muted-foreground text-xs">
                تم كشف الإمبوستر!
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-imposter/20 flex items-center justify-center glow-imposter">
                <Skull className="text-imposter" size={32} />
              </div>
              <h1 className="text-2xl font-black text-imposter mb-1">
                😈 فاز الإمبوستر!
              </h1>
              <p className="text-muted-foreground text-xs">
                ما قدروا يكتشفوه!
              </p>
            </>
          )}
        </div>

        {/* Word Guess Result */}
        {room?.word_guess_status === 'completed' && room?.winner === 'players' && (
          <div className={`mb-3 px-4 py-2 rounded-xl ${
            room.word_guessed 
              ? 'bg-accent/20 border border-accent' 
              : 'bg-secondary'
          }`}>
            <p className="text-sm">
              {room.word_guessed 
                ? '✅ المحتال خمّن الكلمة صح (+2 نقطة)' 
                : '❌ المحتال ما خمّن الكلمة'}
            </p>
          </div>
        )}

        {/* Secret Word & Imposter - Combined */}
        <div className="card-game mb-3 w-full max-w-sm py-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">الكلمة السرية</p>
              <span className="text-lg font-black text-gradient">{secretWord || '...'}</span>
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground mb-1">المحتال{imposters.length > 1 ? 'ين' : ''}</p>
              <div className="flex gap-1">
                {imposters.map((imposter) => (
                  <div key={imposter.player_id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-imposter/20">
                    <span className="text-base">{imposter.avatar}</span>
                    <span className="text-xs font-medium text-imposter">{imposter.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard - Cumulative Scores */}
        <div className="card-game mb-3 w-full max-w-sm py-3">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown size={16} className="text-primary" />
            <p className="font-bold text-sm">ترتيب اللاعبين</p>
          </div>
          <div className="space-y-2">
            {playersWithScores.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2 rounded-xl ${
                  index === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'
                } ${player.player_id === currentPlayer?.player_id ? 'ring-2 ring-primary/50' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-sm">{getMedalEmoji(index)}</span>
                  <span className="text-lg">{player.avatar}</span>
                  <span className={`text-sm ${player.is_imposter ? 'text-imposter' : ''}`}>
                    {player.name}
                    {player.is_imposter && ' 😈'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {player.roundScore > 0 && (
                    <span className="text-xs text-accent">+{player.roundScore}</span>
                  )}
                  <span className="font-bold text-primary">{player.score}</span>
                  <span className="text-xs text-muted-foreground">نقطة</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            النقاط تراكمية لكل جولات الغرفة
          </p>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          {isHost && (
            <button
              onClick={handlePlayAgain}
              disabled={isRestarting || room?.word_guess_status === 'pending'}
              className="w-full btn-primary-game text-lg disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                <RotateCcw size={20} className={isRestarting ? 'animate-spin' : ''} />
                {isRestarting ? 'جاري إعادة اللعب...' : 
                 room?.word_guess_status === 'pending' ? 'انتظر تخمين المحتال...' : 'العب مرة ثانية'}
              </span>
            </button>
          )}
          
          <button
            onClick={handleLeave}
            className="w-full p-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={20} />
            الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineResultScreen;
