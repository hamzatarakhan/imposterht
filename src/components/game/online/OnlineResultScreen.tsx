import React, { useEffect, useMemo } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { Trophy, Skull, Home, RotateCcw, Medal } from 'lucide-react';

interface PlayerWithScore {
  id: string;
  name: string;
  avatar: string;
  score: number;
  is_imposter: boolean;
}

const OnlineResultScreen: React.FC = () => {
  const { room, players, currentPlayer, leaveRoom, resetOnlineGame } = useOnlineGame();
  const { playSound, vibrate } = useSettings();

  const isWinner = room?.winner === 'players' 
    ? !currentPlayer?.is_imposter 
    : currentPlayer?.is_imposter;

  // Calculate scores based on the round result
  const playersWithScores = useMemo((): PlayerWithScore[] => {
    return players.map(player => {
      const isPlayerWinner = room?.winner === 'players' ? !player.is_imposter : player.is_imposter;
      // Imposter gets 3 points for winning, regular players get 1 point
      const score = isPlayerWinner ? (player.is_imposter ? 3 : 1) : 0;
      return {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        score,
        is_imposter: player.is_imposter,
      };
    }).sort((a, b) => b.score - a.score);
  }, [players, room?.winner]);

  // Sound and vibration on result
  useEffect(() => {
    if (isWinner) {
      playSound('win');
      vibrate(100);
    } else {
      playSound('lose');
      vibrate(200);
    }
  }, [isWinner, playSound, vibrate]);

  const handlePlayAgain = () => {
    playSound('click');
    vibrate(50);
    resetOnlineGame();
  };

  const handleLeave = async () => {
    playSound('click');
    vibrate(50);
    await leaveRoom();
  };

  // Sort players by votes
  const sortedPlayers = [...players].sort((a, b) => b.votes - a.votes);
  const mostVoted = sortedPlayers[0];
  const imposters = players.filter(p => p.is_imposter);

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
              <span className="text-xl font-black text-gradient">{room?.secret_word}</span>
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground mb-1">الإمبوستر{imposters.length > 1 ? 'ز' : ''}</p>
              <div className="flex gap-1">
                {imposters.map((imposter) => (
                  <div key={imposter.id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-imposter/20">
                    <span className="text-lg">{imposter.avatar}</span>
                    <span className="text-xs font-medium text-imposter">{imposter.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Round Scores */}
        <div className="card-game mb-4 w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Medal size={16} className="text-primary" />
            <p className="font-bold text-sm">نقاط الجولة</p>
          </div>
          <div className="space-y-2">
            {playersWithScores.slice(0, 4).map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2 rounded-xl ${
                  player.score > 0 ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-sm">{getMedalEmoji(index)}</span>
                  <span className="text-lg">{player.avatar}</span>
                  <span className={`text-sm ${player.is_imposter ? 'text-imposter' : ''}`}>
                    {player.name}
                    {player.is_imposter && ' 😈'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${player.score > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    +{player.score}
                  </span>
                  <span className="text-xs text-muted-foreground">نقطة</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            الإمبوستر الفائز = 3 نقاط | اللاعب الفائز = 1 نقطة
          </p>
        </div>

        {/* Most Voted */}
        <div className="card-game mb-4 w-full max-w-sm">
          <p className="text-xs text-muted-foreground mb-2">الأكثر تصويتاً</p>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              mostVoted?.is_imposter ? 'bg-imposter' : 'bg-secondary'
            }`}>
              <span className="text-lg">{mostVoted?.avatar}</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">{mostVoted?.name}</p>
              <p className="text-xs text-muted-foreground">
                {mostVoted?.votes} أصوات
                {mostVoted?.is_imposter && (
                  <span className="text-imposter mr-1">😈</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={handlePlayAgain}
            className="w-full btn-primary-game text-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <RotateCcw size={20} />
              العب مرة ثانية
            </span>
          </button>
          
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
