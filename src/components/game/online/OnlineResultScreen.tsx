import React, { useEffect, useMemo, useState } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { Trophy, Skull, Home, RotateCcw, Medal } from 'lucide-react';
import * as roomService from '@/services/roomService';
import PresenceDot from '@/components/game/PresenceDot';

interface PlayerWithScore {
  id: string;
  name: string;
  avatar: string;
  score: number;
  is_imposter: boolean;
  teamPoints: number;
  votePoints: number;
  imposterPoints: number;
  totalRoundPoints: number;
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

  // Calculate scores based on the round result
  const playersWithScores = useMemo((): PlayerWithScore[] => {
    return players.map(player => {
      const isImposter = imposters.some(imp => imp.player_id === player.player_id);
      
      let teamPoints = 0;
      let votePoints = 0;
      let imposterPoints = 0;

      if (isImposter) {
        if (room?.winner === 'imposters') imposterPoints = 3;
      } else {
        if (room?.winner === 'players') teamPoints = 1;
        // Check if voted for an actual imposter
        if (player.voted_for) {
          const votedForIsImposter = imposters.some(imp => imp.player_id === player.voted_for);
          if (votedForIsImposter) votePoints = 2;
        }
      }

      return {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        score: player.score, // cumulative from DB
        is_imposter: isImposter,
        teamPoints,
        votePoints,
        imposterPoints,
        totalRoundPoints: teamPoints + votePoints + imposterPoints,
      };
    }).sort((a, b) => b.totalRoundPoints - a.totalRoundPoints);
  }, [players, room?.winner, imposters]);

  // Sound and vibration on result
  useEffect(() => {
    if (imposters.length > 0) {
      if (isWinner) {
        playSound('win');
        vibrate(100);
      } else {
        playSound('lose');
        vibrate(200);
      }
    }
  }, [isWinner, playSound, vibrate, imposters.length]);

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
        <div className="mb-6 animate-reveal">
          {room?.winner === 'players' ? (
            <>
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-accent/20 flex items-center justify-center glow-accent">
                <Trophy className="text-accent" size={40} />
              </div>
              <h1 className="text-3xl font-black text-accent mb-1">
                🎉 فاز اللاعبون!
              </h1>
              <p className="text-muted-foreground text-sm">
                تم كشف الإمبوستر!
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-imposter/20 flex items-center justify-center glow-imposter">
                <Skull className="text-imposter" size={40} />
              </div>
              <h1 className="text-3xl font-black text-imposter mb-1">
                😈 فاز الإمبوستر!
              </h1>
              <p className="text-muted-foreground text-sm">
                ما قدروا يكتشفوه!
              </p>
            </>
          )}
        </div>

        {/* Personal Result */}
        <div className={`card-game mb-4 ${
          isWinner ? 'bg-accent/20 border-accent' : 'bg-imposter/20 border-imposter'
        }`}>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">{currentPlayer?.avatar}</span>
            <div>
              <p className="font-bold text-sm">{currentPlayer?.name}</p>
              <p className={`text-xs ${isWinner ? 'text-accent' : 'text-imposter'}`}>
                {isWinner ? '🎊 أنت فزت!' : '😢 خسرت هالمرة'}
              </p>
            </div>
          </div>
        </div>

        {/* Secret Word & Imposter - Combined */}
        <div className="card-game mb-4 w-full max-w-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">الكلمة السرية</p>
              <span className="text-xl font-black text-gradient">{secretWord || '...'}</span>
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground mb-1">الإمبوستر{imposters.length > 1 ? 'ز' : ''}</p>
              <div className="flex gap-1">
                {imposters.map((imposter) => (
                  <div key={imposter.player_id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-imposter/20">
                    <span className="text-lg">{imposter.avatar}</span>
                    <span className="text-xs font-medium text-imposter">{imposter.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Round Score Breakdown */}
        <div className="card-game mb-4 w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Medal size={16} className="text-primary" />
            <p className="font-bold text-sm">نقاط الجولة</p>
          </div>
          <div className="space-y-2">
            {playersWithScores.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2 rounded-xl ${
                  player.totalRoundPoints > 0 ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-sm">{getMedalEmoji(index)}</span>
                  <div className="relative">
                    <span className="text-lg">{player.avatar}</span>
                    <PresenceDot playerId={player.id} size="sm" />
                  </div>
                  <span className={`text-sm ${player.is_imposter ? 'text-imposter' : ''}`}>
                    {player.name}
                    {player.is_imposter && ' 😈'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {player.votePoints > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-accent/20 text-accent">🎯+2</span>
                  )}
                  {player.teamPoints > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">🏆+1</span>
                  )}
                  {player.imposterPoints > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-imposter/20 text-imposter">😈+3</span>
                  )}
                  <span className={`font-bold ${player.totalRoundPoints > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    +{player.totalRoundPoints}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-muted-foreground text-center">
              🎯 تصويت صحيح = +2 | 🏆 فوز الفريق = +1 | 😈 إمبوستر ناجي = +3
            </p>
          </div>
        </div>

        {/* Cumulative Leaderboard */}
        <div className="card-game mb-4 w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy size={16} className="text-yellow-500" />
            <p className="font-bold text-sm">الترتيب التراكمي</p>
          </div>
          <div className="space-y-2">
            {[...playersWithScores].sort((a, b) => b.score - a.score).map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2 rounded-xl ${
                  index === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-sm">{getMedalEmoji(index)}</span>
                  <div className="relative">
                    <span className="text-lg">{player.avatar}</span>
                    <PresenceDot playerId={player.id} size="sm" />
                  </div>
                  <span className="text-sm">{player.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-primary">{player.score}</span>
                  <span className="text-xs text-muted-foreground">نقطة</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Voted */}
        <div className="card-game mb-4 w-full max-w-sm">
          <p className="text-xs text-muted-foreground mb-2">الأكثر تصويتاً</p>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              mostVotedIsImposter ? 'bg-imposter' : 'bg-secondary'
            }`}>
              <span className="text-lg">{mostVoted?.avatar}</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">{mostVoted?.name}</p>
              <p className="text-xs text-muted-foreground">
                {mostVoted?.votes} أصوات
                {mostVotedIsImposter && (
                  <span className="text-imposter mr-1">😈</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          {isHost && (
            <button
              onClick={handlePlayAgain}
              disabled={isRestarting}
              className="w-full btn-primary-game text-lg disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                <RotateCcw size={20} className={isRestarting ? 'animate-spin' : ''} />
                {isRestarting ? 'جاري إعادة اللعب...' : 'العب مرة ثانية'}
              </span>
            </button>
          )}
          
          {isHost && (
            <button
              onClick={handleLeave}
              className="w-full p-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
            >
              <Home size={20} />
              الرئيسية
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlineResultScreen;
