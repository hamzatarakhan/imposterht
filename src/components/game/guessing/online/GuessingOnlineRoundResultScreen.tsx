import React, { useState, useEffect } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import * as guessingService from '@/services/guessingRoomService';
import WordImage from '../WordImage';
import { ArrowRight } from 'lucide-react';
import PresenceDot from '@/components/game/PresenceDot';
import SpectatorShareButton from './SpectatorShareButton';

const GuessingOnlineRoundResultScreen: React.FC = () => {
  const { room, players, isHost, nextRound, leaveRoom } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();
  const [words, setWords] = useState<{ player1_word: string; player2_word: string } | null>(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (!room) return;
    guessingService.getGuessingRoundWords(room.id).then(w => setWords(w));
  }, [room?.id, room?.current_round]);

  if (!room) return null;

  if (players.length < 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="card-game text-center space-y-4">
          <div className="text-5xl">😢</div>
          <p className="text-lg font-black">الخصم انقطع!</p>
          <p className="text-sm text-muted-foreground">يبدو إنه طلع من اللعبة</p>
        </div>
        <button onClick={async () => { playSound('click'); await leaveRoom(); }}
          className="w-full btn-primary-game text-lg mt-4">
          🏠 رجوع للرئيسية
        </button>
      </div>
    );
  }

  const winner = room.round_winner_id ? players.find(p => p.player_id === room.round_winner_id) : null;
  const isDraw = !room.round_winner_id;

  const handleNext = async () => {
    if (navigating) return;
    setNavigating(true);
    playSound('click'); vibrate(50);
    const success = await nextRound();
    if (!success) setNavigating(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background pointer-events-none" />

      {/* Header */}
      <div className="relative z-20 bg-background/80 backdrop-blur-md px-4 py-2.5 flex items-center gap-3">
        <button onClick={async () => { playSound('click'); await leaveRoom(); }}
          className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={18} />
        </button>
        <h1 className="text-lg font-black flex-1">📊 نتيجة الجولة</h1>
        {room && <SpectatorShareButton roomCode={room.code} variant="icon" />}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-3 relative z-10">
        <div className="w-full max-w-sm space-y-3">

          {/* Winner announcement + scores in one card */}
          <div className="card-game !p-4">
            {isDraw ? (
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-4xl">🤝</span>
                <h2 className="text-xl font-black">تعادل بالجولة!</h2>
              </div>
            ) : (
              <div className="text-center mb-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl">🎉</span>
                  <h2 className="text-xl font-black">{winner?.name} فاز بالجولة!</h2>
                  <span className="text-2xl">{winner?.avatar}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-6 pt-3 border-t border-border/40">
              {players.map(p => (
                <div key={p.id} className="text-center">
                  <div className="relative inline-block">
                    <span className="text-2xl">{p.avatar}</span>
                    <PresenceDot playerId={p.player_id} size="sm" />
                  </div>
                  <p className="text-2xl font-black text-primary">{p.wins}</p>
                  <p className="text-xs text-muted-foreground">{p.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Words Reveal */}
          {words && (
            <div className="card-game !p-4">
              <h3 className="font-bold mb-2 text-center text-sm">📝 الكلمات كانت:</h3>
              <div className="space-y-2">
                {players.map((p, i) => {
                  const w = i === 0 ? words.player1_word : words.player2_word;
                  return (
                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="text-lg">{p.avatar}</span>
                          <PresenceDot playerId={p.player_id} size="sm" />
                        </div>
                        <span className="font-bold text-sm">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <WordImage word={w} size="sm" />
                        <span className="font-black text-primary text-sm">{w}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="relative z-30 p-4 bg-background/90 backdrop-blur-md border-t border-border/30">
        <div className="max-w-sm mx-auto">
          {isHost ? (
            <button onClick={handleNext} disabled={navigating} className="w-full btn-primary-game text-lg disabled:opacity-50">
              {room.current_round >= room.total_rounds ? '🏆 النتائج النهائية' : '⚔️ المواجهة التالية'}
            </button>
          ) : (
            <p className="text-center text-muted-foreground animate-pulse py-2">⏳ بانتظار المضيف...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuessingOnlineRoundResultScreen;
