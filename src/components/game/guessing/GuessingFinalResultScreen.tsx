import React from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';

const GuessingFinalResultScreen: React.FC = () => {
  const { players, resetGame } = useGuessingGame();
  const { setScreen: setMainScreen } = useGame();
  const { playSound, vibrate } = useSettings();

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  const handleBackToHub = () => {
    playSound('click');
    vibrate(50);
    resetGame();
    setMainScreen('hub');
  };

  const handlePlayAgain = () => {
    playSound('click');
    vibrate(50);
    resetGame();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Winner */}
        <div className="card-game text-center">
          <div className="text-6xl mb-2 animate-float">🏆</div>
          <h2 className="text-2xl font-black mb-1">الفائز!</h2>
          <div className="text-5xl mb-2">{winner?.avatar}</div>
          <p className="text-xl font-bold text-primary">{winner?.name}</p>
          <p className="text-muted-foreground">{winner?.score} نقطة</p>
        </div>

        {/* Leaderboard */}
        <div className="card-game">
          <h3 className="font-bold mb-3">📊 الترتيب النهائي</h3>
          <div className="space-y-2">
            {sorted.map((p, i) => (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl ${i === 0 ? 'bg-primary/20' : 'bg-secondary/50'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-muted-foreground w-6">{i + 1}</span>
                  <span className="text-xl">{p.avatar}</span>
                  <span className="font-bold">{p.name}</span>
                </div>
                <span className="text-lg font-black text-primary">{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button onClick={handlePlayAgain} className="w-full btn-primary-game text-lg">
            🔄 العب مرة ثانية
          </button>
          <button onClick={handleBackToHub} className="w-full btn-secondary-game">
            🏠 الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingFinalResultScreen;
