import React from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useSettings } from '@/context/SettingsContext';

const GuessingRoundResultScreen: React.FC = () => {
  const { roundWinner, words, players, currentRound, totalRounds, nextRound } = useGuessingGame();
  const { playSound, vibrate } = useSettings();

  if (players.length < 2 || words.length < 2) return null;

  const winner = players.find(p => p.id === roundWinner) || players[0];
  const loser = players.find(p => p.id !== roundWinner) || players[1];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="relative z-10 w-full max-w-sm space-y-5">
        <div className="card-game text-center">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-black mb-1">{winner?.name} فاز!</h2>
          <div className="text-4xl mb-3">{winner?.avatar}</div>
        </div>

        {/* Words Reveal */}
        <div className="card-game">
          <h3 className="font-bold mb-3 text-center">📝 الكلمات كانت:</h3>
          <div className="space-y-2">
            {players.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p.avatar}</span>
                  <span className="font-bold text-sm">{p.name}</span>
                </div>
                <span className="font-black text-primary">{words[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="card-game">
          <div className="flex items-center justify-center gap-8">
            {players.map(p => (
              <div key={p.id} className="text-center">
                <span className="text-2xl">{p.avatar}</span>
                <p className="text-2xl font-black text-primary">{p.wins}</p>
                <p className="text-xs text-muted-foreground">{p.name}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { playSound('click'); vibrate(50); nextRound(); }}
          className="w-full btn-primary-game text-lg"
        >
          {currentRound >= totalRounds ? '🏆 النتائج النهائية' : '⚔️ المواجهة التالية'}
        </button>
      </div>
    </div>
  );
};

export default GuessingRoundResultScreen;
