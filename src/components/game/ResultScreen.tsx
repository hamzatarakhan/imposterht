import React, { useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { RotateCcw, Home, Trophy, Medal } from 'lucide-react';

const ResultScreen: React.FC = () => {
  const { players, winner, secretWord, playAgain, resetGame, getLeaderboard, roundNumber, resetScores } = useGame();
  const { playSound, vibrate } = useSettings();
  const hasPlayedSoundRef = useRef(false);
  
  const imposters = players.filter(p => p.isImposter);
  const sortedByVotes = [...players].sort((a, b) => b.votes - a.votes);
  const mostVoted = sortedByVotes[0];
  const playersWon = winner === 'players';
  const leaderboard = getLeaderboard();

  // Calculate per-player round points breakdown
  const roundBreakdown = players.map(player => {
    let teamPoints = 0;
    let votePoints = 0;
    let imposterPoints = 0;

    if (player.isImposter) {
      if (!playersWon) imposterPoints = 3;
    } else {
      if (playersWon) teamPoints = 1;
      if (player.votedFor !== null) {
        const votedForPlayer = players.find(p => p.id === player.votedFor);
        if (votedForPlayer?.isImposter) votePoints = 2;
      }
    }

    return {
      ...player,
      teamPoints,
      votePoints,
      imposterPoints,
      totalPoints: teamPoints + votePoints + imposterPoints,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  // Play result sound on mount
  useEffect(() => {
    if (!hasPlayedSoundRef.current) {
      if (playersWon) {
        playSound('win');
        vibrate([100, 50, 100, 50, 200]);
      } else {
        playSound('lose');
        vibrate([200, 100, 200]);
      }
      hasPlayedSoundRef.current = true;
    }
  }, [playersWon, playSound, vibrate]);

  const handlePlayAgain = () => {
    playSound('click');
    vibrate(50);
    playAgain();
  };

  const handleGoHome = () => {
    playSound('click');
    vibrate(30);
    resetScores();
    resetGame();
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 transition-colors ${
        playersWon 
          ? 'bg-gradient-to-br from-accent/20 via-background to-background'
          : 'bg-gradient-to-br from-imposter/20 via-background to-background'
      }`} />
      
      {/* Celebratory or sad effect */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl ${
        playersWon ? 'bg-accent/20' : 'bg-imposter/20'
      } animate-pulse`} />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-6 pb-48">
        {/* Round Number */}
        <div className="mb-4 px-4 py-1 rounded-full bg-secondary text-sm font-medium">
          الجولة {roundNumber}
        </div>

        {/* Result Icon */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
          playersWon ? 'bg-accent/20 glow-accent' : 'bg-imposter/20 glow-imposter'
        } animate-reveal`}>
          <span className="text-5xl">{playersWon ? '🎉' : '😈'}</span>
        </div>
        
        {/* Result Message */}
        {playersWon ? (
          <>
            <h1 className="text-3xl font-black mb-2 text-accent animate-slide-up">
              اكتشفتوا الإمبوستر!
            </h1>
            <p className="text-lg text-muted-foreground mb-4 animate-slide-up">
              فوز اللاعبين! 🏆
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black mb-2 text-gradient-imposter animate-slide-up">
              الإمبوستر فاز!
            </h1>
            <p className="text-lg text-muted-foreground mb-4 animate-slide-up">
              خدع الجميع بنجاح 😈
            </p>
          </>
        )}
        
        {/* Imposter Reveal & Secret Word - Combined */}
        <div className="card-game w-full max-w-sm mb-4 animate-slide-up">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-muted-foreground text-sm mb-1">الإمبوستر:</p>
              <div className="flex gap-2">
                {imposters.map((imposter) => (
                  <div key={imposter.id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-imposter/20">
                    <span className="text-xl">{imposter.avatar || '😈'}</span>
                    <span className="text-imposter font-bold text-sm">{imposter.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-left">
              <p className="text-muted-foreground text-sm mb-1">الكلمة:</p>
              <span className="text-xl font-black text-gradient">{secretWord}</span>
            </div>
          </div>
        </div>

        {/* Round Score Breakdown */}
        <div className="card-game w-full max-w-sm mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Medal size={18} className="text-primary" />
            <p className="font-bold">نقاط الجولة</p>
          </div>
          <div className="space-y-2">
            {roundBreakdown.map((player, index) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between p-2 rounded-xl ${
                  player.totalPoints > 0 ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 text-center">{getMedalEmoji(index)}</span>
                  <span className="text-lg">{player.avatar || '👤'}</span>
                  <span className={`font-medium text-sm ${player.isImposter ? 'text-imposter' : ''}`}>
                    {player.name}
                    {player.isImposter && ' 😈'}
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
                  <span className={`font-bold ${player.totalPoints > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    +{player.totalPoints}
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
        {leaderboard.length > 0 && roundNumber > 1 && (
          <div className="card-game w-full max-w-sm mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy size={18} className="text-yellow-500" />
              <p className="font-bold">الترتيب التراكمي</p>
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((player, index) => (
                <div 
                  key={player.playerId}
                  className={`flex items-center justify-between p-2 rounded-xl ${
                    index === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">{getMedalEmoji(index)}</span>
                    <span className="text-lg">{player.avatar}</span>
                    <span className="font-medium text-sm">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{player.score}</span>
                    <span className="text-xs text-muted-foreground">نقطة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Voting Results */}
        <div className="card-game w-full max-w-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-muted-foreground mb-2 text-sm">نتائج التصويت:</p>
          <div className="space-y-1">
            {sortedByVotes.slice(0, 3).map((player, index) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between p-2 rounded-xl ${
                  index === 0 ? 'bg-secondary' : 'bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  <span className="text-lg">{player.avatar || '👤'}</span>
                  <span className={`text-sm ${player.isImposter ? 'text-imposter' : ''}`}>
                    {player.name}
                    {player.isImposter && ' 😈'}
                  </span>
                </div>
                <span className="font-bold text-sm">{player.votes} صوت</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Actions - Fixed */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3">
        <button
          onClick={handlePlayAgain}
          className="w-full btn-primary-game flex items-center justify-center gap-3"
        >
          <RotateCcw size={24} />
          العب مرة أخرى
        </button>
        
        <button
          onClick={handleGoHome}
          className="w-full btn-secondary-game flex items-center justify-center gap-3"
        >
          <Home size={24} />
          الصفحة الرئيسية
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;