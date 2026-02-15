import React, { useState, useEffect, useRef } from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useSettings } from '@/context/SettingsContext';

const GuessingPlayScreen: React.FC = () => {
  const { currentWord, roundTime, players, currentDescriberIndex, markCorrect, markSkip } = useGuessingGame();
  const { playSound, vibrate } = useSettings();
  const [timeLeft, setTimeLeft] = useState(roundTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(roundTime);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          playSound('alarm');
          vibrate([100, 50, 100]);
          markSkip();
          return 0;
        }
        if (prev === 11) { playSound('tick'); vibrate(20); }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [roundTime]);

  const describer = players[currentDescriberIndex];
  const progress = (timeLeft / roundTime) * 100;
  const isLow = timeLeft <= 10;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Timer */}
        <div className="card-game">
          <p className="text-sm text-muted-foreground mb-2">الوقت المتبقي</p>
          <div className={`text-6xl font-black mb-3 ${isLow ? 'text-destructive animate-pulse' : 'text-primary'}`}>
            {timeLeft}
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Describer info */}
        <div className="text-center">
          <span className="text-3xl">{describer?.avatar}</span>
          <p className="text-lg font-bold mt-1">{describer?.name} يوصّف</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              playSound('win');
              vibrate(50);
              markCorrect();
            }}
            className="w-full btn-accent-game text-xl"
          >
            ✅ حزروها!
          </button>
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              playSound('click');
              vibrate(30);
              markSkip();
            }}
            className="w-full btn-secondary-game"
          >
            ⏭️ تخطي
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingPlayScreen;
