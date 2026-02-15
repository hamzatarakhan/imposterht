import React from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useSettings } from '@/context/SettingsContext';

const GuessingShowWordScreen: React.FC = () => {
  const { currentWord, setScreen } = useGuessingGame();
  const { playSound, vibrate } = useSettings();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="card-game text-center">
          <p className="text-muted-foreground mb-4 text-sm">الكلمة المطلوبة هي:</p>
          <div className="text-5xl font-black text-primary mb-6 animate-reveal">
            {currentWord}
          </div>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            وصّف هاي الكلمة لباقي اللاعبين<br />
            <span className="text-destructive font-bold">بدون ما تقولها أو تقول حرف منها!</span>
          </p>

          <button
            onClick={() => { playSound('click'); vibrate(50); setScreen('guessingPlay'); }}
            className="w-full btn-primary-game text-lg"
          >
            ⏱️ يلا نبدأ!
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingShowWordScreen;
