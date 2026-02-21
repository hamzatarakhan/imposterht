import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import * as guessingService from '@/services/guessingRoomService';

const GuessingOnlinePlayScreen: React.FC = () => {
  const { room, players, isHost, markWinner } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();
  const [myWord, setMyWord] = useState<string | null>(null);

  // Turn timer state
  const turnTime = room?.turn_time || 30;
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0); // 0 = player1's turn to ask, 1 = player2
  const [timeLeft, setTimeLeft] = useState(turnTime);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasPlayedWarning = useRef(false);

  useEffect(() => {
    if (!room?.id) return;
    const fetchWord = async () => {
      const w = await guessingService.getMyGuessingWord(room.id);
      setMyWord(w);
      if (!w) {
        setTimeout(async () => {
          const retry = await guessingService.getMyGuessingWord(room.id);
          if (retry) setMyWord(retry);
        }, 1000);
      }
    };
    fetchWord();
  }, [room?.id, room?.current_round]);

  // Reset timer when turn changes or round changes
  useEffect(() => {
    setTimeLeft(turnTime);
    hasPlayedWarning.current = false;
  }, [currentTurnIndex, room?.current_round, turnTime]);

  // Countdown timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - switch turn
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

  if (!room || players.length < 2) return null;

  const currentAsker = players[currentTurnIndex];
  const currentAnswerer = players[(currentTurnIndex + 1) % 2];
  const progress = (timeLeft / turnTime) * 100;
  const isLow = timeLeft <= 5;

  const handleWinner = async (playerId: string) => {
    playSound('win'); vibrate([50, 30, 50]);
    await markWinner(playerId);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="relative z-10 w-full max-w-sm space-y-5">
        <div className="text-sm text-muted-foreground font-bold">
          المواجهة {room.current_round} / {room.total_rounds}
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

        {/* VS */}
        <div className="card-game">
          <div className="flex items-center justify-center gap-6">
            {players.map((p, idx) => (
              <div key={p.id} className={`text-center transition-all ${currentTurnIndex === idx ? 'scale-110 opacity-100' : 'scale-90 opacity-50'}`}>
                <div className="text-4xl mb-2">{p.avatar}</div>
                <p className="font-bold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.wins} فوز</p>
              </div>
            ))}
          </div>
          <div className="text-3xl font-black text-primary text-center my-2">⚔️</div>
        </div>

        {/* My Word Reminder */}
        {myWord && (
          <div className="card-game text-center">
            <p className="text-xs text-muted-foreground mb-1">كلمتك:</p>
            <p className="text-2xl font-black text-primary">{myWord}</p>
          </div>
        )}

        {/* Winner Buttons - Host Only */}
        {isHost ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-bold text-center">مين حزر أول؟</p>
            {players.map(player => (
              <button key={player.id} onClick={() => handleWinner(player.player_id)}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
                  player.is_host
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-2 border-blue-500/40 text-foreground hover:border-blue-500'
                    : 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/40 text-foreground hover:border-red-500'
                }`}>
                <span className="text-2xl">{player.avatar}</span>
                🏆 {player.name} فاز!
              </button>
            ))}
          </div>
        ) : (
          <div className="card-game text-center">
            <p className="text-muted-foreground animate-pulse">⏳ المضيف يحدد الفائز...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuessingOnlinePlayScreen;
