import React from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import WordImage from '../WordImage';

const GuessingOnlineRoundResultScreen: React.FC = () => {
  const { room, players, isHost, nextRound, roundWords } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();

  if (!room || players.length < 2) return null;

  const winner = players.find(p => p.player_id === room.round_winner_id);

  const handleNext = async () => {
    playSound('click'); vibrate(50);
    await nextRound();
  };

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
        {roundWords && (
          <div className="card-game">
            <h3 className="font-bold mb-3 text-center">📝 الكلمات كانت:</h3>
            <div className="space-y-3">
              {players.map((p, i) => {
                const w = i === 0 ? roundWords.player1_word : roundWords.player2_word;
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.avatar}</span>
                      <span className="font-bold text-sm">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <WordImage word={w} size="sm" />
                      <span className="font-black text-primary">{w}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Score */}
        <div className="card-game">
          <div className="flex items-center justify-center gap-6">
            {players.map(p => (
              <div key={p.id} className="text-center">
                <span className="text-2xl">{p.avatar}</span>
                <p className="text-2xl font-black text-primary">{p.wins}</p>
                <p className="text-xs text-muted-foreground">{p.name}</p>
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button onClick={handleNext} className="w-full btn-primary-game text-lg">
            ⚔️ المواجهة التالية
          </button>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground animate-pulse">⏳ بانتظار المضيف...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuessingOnlineRoundResultScreen;
