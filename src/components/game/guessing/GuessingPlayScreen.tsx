import React from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight } from 'lucide-react';

const GuessingPlayScreen: React.FC = () => {
  const { players, currentRound, totalRounds, markWinner, resetGame } = useGuessingGame();
  const { setScreen: setMainScreen } = useGame();
  const { playSound, vibrate } = useSettings();

  if (players.length < 2) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <button onClick={() => { playSound('click'); vibrate(30); resetGame(); setMainScreen('hub'); }}
        className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowRight size={20} />
      </button>

      <div className="relative z-10 w-full max-w-sm space-y-6">
        <div className="text-sm text-muted-foreground font-bold">
          المواجهة {currentRound} / {totalRounds}
        </div>

        {/* VS Display */}
        <div className="card-game">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">{players[0].avatar}</div>
              <p className="font-bold text-sm">{players[0].name}</p>
              <p className="text-xs text-muted-foreground">{players[0].wins} فوز</p>
            </div>
            <div className="text-3xl font-black text-primary">⚔️</div>
            <div className="text-center">
              <div className="text-4xl mb-2">{players[1].avatar}</div>
              <p className="font-bold text-sm">{players[1].name}</p>
              <p className="text-xs text-muted-foreground">{players[1].wins} فوز</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card-game text-center">
          <p className="text-lg font-bold mb-2">🗣️ اسألوا بعض!</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            كل واحد يسأل الثاني أسئلة عن كلمته
            <br />
            أول واحد يحزر كلمة خصمه يفوز! 🏆
          </p>
        </div>

        {/* Winner Buttons */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-bold text-center">مين حزر أول؟</p>
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => { playSound('win'); vibrate([50, 30, 50]); markWinner(player.id); }}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
                player.id === 1
                  ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-2 border-blue-500/40 text-foreground hover:border-blue-500'
                  : 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/40 text-foreground hover:border-red-500'
              }`}
            >
              <span className="text-2xl">{player.avatar}</span>
              🏆 {player.name} فاز!
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuessingPlayScreen;
