import React from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useSettings } from '@/context/SettingsContext';

const GuessingRoundResultScreen: React.FC = () => {
  const { roundResult, currentWord, players, currentDescriberIndex, nextRound, currentRound, totalRounds } = useGuessingGame();
  const { playSound, vibrate } = useSettings();

  const describer = players[currentDescriberIndex];
  const isCorrect = roundResult === 'correct';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="card-game text-center">
          <div className="text-6xl mb-4">
            {isCorrect ? '🎉' : '😅'}
          </div>
          <h2 className="text-2xl font-black mb-2">
            {isCorrect ? 'أحسنتوا!' : 'ما قدروا يحزروها'}
          </h2>
          <p className="text-muted-foreground mb-2">الكلمة كانت:</p>
          <p className="text-3xl font-black text-primary mb-4">{currentWord}</p>

          {isCorrect && (
            <p className="text-accent font-bold mb-4">
              +1 نقطة لـ {describer?.avatar} {describer?.name}
            </p>
          )}

          {/* Quick Scores */}
          <div className="bg-secondary/50 rounded-2xl p-3 mb-6">
            <div className="flex flex-wrap justify-center gap-3">
              {[...players].sort((a, b) => b.score - a.score).map(p => (
                <div key={p.id} className="flex items-center gap-1.5 text-sm">
                  <span>{p.avatar}</span>
                  <span className="font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => { playSound('click'); vibrate(50); nextRound(); }}
            className="w-full btn-primary-game text-lg"
          >
            {currentRound >= totalRounds ? '🏆 النتائج النهائية' : '➡️ الجولة التالية'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingRoundResultScreen;
