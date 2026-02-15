import React from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useSettings } from '@/context/SettingsContext';

const GuessingPassPhoneScreen: React.FC = () => {
  const { players, currentDescriberIndex, currentRound, totalRounds, showWord } = useGuessingGame();
  const { playSound, vibrate } = useSettings();

  const describer = players[currentDescriberIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-4 text-sm text-muted-foreground font-bold">
          الجولة {currentRound} / {totalRounds}
        </div>

        <div className="card-game text-center">
          <div className="text-6xl mb-4">{describer?.avatar}</div>
          <h2 className="text-2xl font-black mb-2">{describer?.name}</h2>
          <p className="text-muted-foreground mb-6">
            أعطِ الجوال لـ <span className="text-primary font-bold">{describer?.name}</span>
          </p>

          <button
            onClick={() => { playSound('click'); vibrate(50); showWord(); }}
            className="w-full btn-primary-game text-lg"
          >
            👀 أنا جاهز، وريني الكلمة
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingPassPhoneScreen;
