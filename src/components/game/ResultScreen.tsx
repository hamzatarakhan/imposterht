import React from 'react';
import { useGame } from '@/context/GameContext';
import { RotateCcw, Home } from 'lucide-react';

const ResultScreen: React.FC = () => {
  const { players, winner, secretWord, playAgain, resetGame } = useGame();
  
  const imposters = players.filter(p => p.isImposter);
  const sortedByVotes = [...players].sort((a, b) => b.votes - a.votes);
  const mostVoted = sortedByVotes[0];
  const playersWon = winner === 'players';

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden">
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
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        {/* Result Icon */}
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
          playersWon ? 'bg-accent/20 glow-accent' : 'bg-imposter/20 glow-imposter'
        } animate-reveal`}>
          <span className="text-7xl">{playersWon ? '🎉' : '😈'}</span>
        </div>
        
        {/* Result Message */}
        {playersWon ? (
          <>
            <h1 className="text-4xl font-black mb-4 text-accent animate-slide-up">
              اكتشفتوا الإمبوستر!
            </h1>
            <p className="text-xl text-muted-foreground mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              فوز اللاعبين! 🏆
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-black mb-4 text-gradient-imposter animate-slide-up">
              الإمبوستر فاز!
            </h1>
            <p className="text-xl text-muted-foreground mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              خدع الجميع بنجاح 😈
            </p>
          </>
        )}
        
        {/* Imposter Reveal */}
        <div className="card-game w-full max-w-sm mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-muted-foreground mb-2">الإمبوستر كان:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {imposters.map((imposter) => (
              <span 
                key={imposter.id}
                className="px-4 py-2 rounded-xl bg-imposter/20 text-imposter font-bold text-xl"
              >
                {imposter.name} 😈
              </span>
            ))}
          </div>
        </div>
        
        {/* Secret Word */}
        <div className="card-game w-full max-w-sm mb-6 bg-primary/10 border-primary/30 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-muted-foreground mb-2">الكلمة السرية:</p>
          <span className="text-3xl font-black text-gradient">{secretWord}</span>
        </div>
        
        {/* Voting Results */}
        <div className="card-game w-full max-w-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-muted-foreground mb-3">نتائج التصويت:</p>
          <div className="space-y-2">
            {sortedByVotes.slice(0, 3).map((player, index) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  index === 0 ? 'bg-secondary' : 'bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  <span className={player.isImposter ? 'text-imposter' : ''}>
                    {player.name}
                    {player.isImposter && ' 😈'}
                  </span>
                </div>
                <span className="font-bold">{player.votes} صوت</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="relative z-10 space-y-3 mt-6">
        <button
          onClick={playAgain}
          className="w-full btn-primary-game flex items-center justify-center gap-3"
        >
          <RotateCcw size={24} />
          العب مرة أخرى
        </button>
        
        <button
          onClick={resetGame}
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
