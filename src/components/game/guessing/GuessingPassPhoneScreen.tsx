import React from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight } from 'lucide-react';

const GuessingPassPhoneScreen: React.FC = () => {
  const { players, currentPlayerViewIndex, currentRound, totalRounds, setScreen, resetGame } = useGuessingGame();
  const { setScreen: setMainScreen } = useGame();
  const { playSound, vibrate } = useSettings();

  if (players.length < 2) return null;
  const currentPlayer = players[currentPlayerViewIndex];

  const handleQuit = () => {
    playSound('click');
    vibrate(30);
    resetGame();
    setMainScreen('hub');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <button onClick={handleQuit}
        className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowRight size={20} />
      </button>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-4 text-sm text-muted-foreground font-bold">
          المواجهة {currentRound} / {totalRounds}
        </div>

        <div className="card-game text-center">
          <div className="text-6xl mb-4">{currentPlayer.avatar}</div>
          <h2 className="text-2xl font-black mb-2">{currentPlayer.name}</h2>
          <p className="text-muted-foreground mb-6">
            أعطِ الجوال لـ <span className="text-primary font-bold">{currentPlayer.name}</span>
            <br />
            <span className="text-sm">عشان يشوف كلمته</span>
          </p>

          <button
            onClick={() => { playSound('click'); vibrate(50); setScreen('guessingShowWord'); }}
            className="w-full btn-primary-game text-lg"
          >
            👀 أنا {currentPlayer.name}، وريني كلمتي
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingPassPhoneScreen;
