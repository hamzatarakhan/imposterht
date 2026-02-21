import React, { useState, useEffect, useRef } from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight } from 'lucide-react';

const GuessingPlayScreen: React.FC = () => {
  const { players, currentRound, totalRounds, turnTime, markWinner, resetGame } = useGuessingGame();
  const { setScreen: setMainScreen } = useGame();
  const { playSound, vibrate } = useSettings();

  // Turn timer state
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(turnTime);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasPlayedWarning = useRef(false);

  // Reset timer when turn changes
  useEffect(() => {
    setTimeLeft(turnTime);
    hasPlayedWarning.current = false;
  }, [currentTurnIndex, turnTime]);

  // Countdown
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          playSound('click');
          vibrate(100);
          setCurrentTurnIndex(i => (i + 1) % 2);
          return turnTime;
        }
        if (prev === 6 && !hasPlayedWarning.current) {
          playSound('click');
          hasPlayedWarning.current = true;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentTurnIndex, turnTime, playSound, vibrate]);

  if (players.length < 2) return null;

  const currentAsker = players[currentTurnIndex];
  const currentAnswerer = players[(currentTurnIndex + 1) % 2];
  const progress = (timeLeft / turnTime) * 100;
  const isLow = timeLeft <= 5;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <button onClick={() => { playSound('click'); vibrate(30); resetGame(); setMainScreen('hub'); }}
        className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowRight size={20} />
      </button>

      <div className="relative z-10 w-full max-w-sm space-y-5">
        <div className="text-sm text-muted-foreground font-bold">
          المواجهة {currentRound} / {totalRounds}
        </div>

        {/* Turn Indicator with Timer */}
        <div className={`card-game transition-all ${isLow ? 'border-destructive/50' : ''}`}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-3xl">{currentAsker.avatar}</span>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">دور</p>
              <p className="font-black text-lg">{currentAsker.name}</p>
              <p className="text-xs text-muted-foreground">يسأل {currentAnswerer.name}</p>
            </div>
          </div>

          {/* Circular Timer */}
          <div className="flex items-center justify-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" strokeWidth="6"
                  className="stroke-secondary" />
                <circle cx="40" cy="40" r="35" fill="none" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress / 100)}`}
                  className={`transition-all duration-1000 linear ${isLow ? 'stroke-destructive' : 'stroke-primary'}`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-black ${isLow ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* VS Display */}
        <div className="card-game">
          <div className="flex items-center justify-center gap-6">
            {players.map((player, idx) => (
              <div key={player.id} className={`text-center transition-all ${currentTurnIndex === idx ? 'scale-110 opacity-100' : 'scale-90 opacity-50'}`}>
                <div className="text-4xl mb-2">{player.avatar}</div>
                <p className="font-bold text-sm">{player.name}</p>
                <p className="text-xs text-muted-foreground">{player.wins} فوز</p>
              </div>
            ))}
          </div>
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
