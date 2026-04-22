import React, { useEffect, useRef } from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { useFeedbackTrigger } from '@/context/FeedbackContext';

const GuessingFinalResultScreen: React.FC = () => {
  const { players, resetGame, totalRounds } = useGuessingGame();
  const { setScreen: setMainScreen } = useGame();
  const { playSound, vibrate } = useSettings();
  const { notifyRoundCompleted } = useFeedbackTrigger();
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!triggeredRef.current && players.length >= 2) {
      triggeredRef.current = true;
      notifyRoundCompleted(`local-guessing-${Date.now()}`, 'guessing', totalRounds || 1);
    }
  }, [players.length, notifyRoundCompleted, totalRounds]);

  if (players.length < 2) return null;

  const winner = players[0].wins >= players[1].wins ? players[0] : players[1];
  const loser = players[0].id === winner.id ? players[1] : players[0];
  const isDraw = players[0].wins === players[1].wins;

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

      <div className="relative z-10 w-full max-w-sm space-y-5">
        {/* Winner */}
        <div className="card-game text-center">
          <div className="text-6xl mb-2 animate-float">{isDraw ? '🤝' : '🏆'}</div>
          <h2 className="text-2xl font-black mb-3">
            {isDraw ? 'تعادل!' : `${winner.name} بطل المواجهة!`}
          </h2>
          {!isDraw && <div className="text-5xl mb-2">{winner.avatar}</div>}
        </div>

        {/* Final Score */}
        <div className="card-game">
          <h3 className="font-bold mb-4 text-center">📊 النتيجة النهائية</h3>
          <div className="flex items-center justify-center gap-6">
            {players.map(p => (
              <div key={p.id} className={`text-center p-4 rounded-2xl flex-1 ${
                !isDraw && p.id === winner.id ? 'bg-primary/20 ring-2 ring-primary/40' : 'bg-secondary/50'
              }`}>
                <div className="text-3xl mb-2">{p.avatar}</div>
                <p className="font-bold">{p.name}</p>
                <p className="text-3xl font-black text-primary mt-1">{p.wins}</p>
                <p className="text-xs text-muted-foreground">فوز</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button onClick={handlePlayAgain} className="w-full btn-primary-game text-lg">
            🔄 العب كمان مرة
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
