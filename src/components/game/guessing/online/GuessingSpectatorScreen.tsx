import React, { useState, useEffect } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Eye } from 'lucide-react';

const GuessingSpectatorScreen: React.FC = () => {
  const { room, players, leaveRoom, spectatorWords } = useOnlineGuessing();
  const { playSound } = useSettings();

  if (!room) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center">
        <div className="card-game space-y-4">
          <div className="text-5xl">😢</div>
          <p className="text-lg font-black">الغرفة غير موجودة</p>
          <button onClick={() => leaveRoom()} className="w-full btn-primary-game">🏠 رجوع</button>
        </div>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    waiting: '⏳ بانتظار بدء اللعبة...',
    playing: '⚔️ جاري اللعب',
    round_result: '📊 نتيجة الجولة',
    finished: '🏆 انتهت المباراة',
  };

  const player1 = players[0];
  const player2 = players[1];

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background pointer-events-none" />

      {/* Header */}
      <div className="relative z-20 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3">
        <button onClick={() => { playSound('click'); leaveRoom(); }}
          className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-black flex items-center gap-2">
            <Eye size={20} className="text-primary" /> وضع المتفرج
          </h1>
        </div>
        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-bold">
          مشاهدة فقط
        </span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-5 gap-4">
        {/* Status */}
        <div className="text-center">
          <span className="text-sm font-bold text-muted-foreground">
            {statusLabels[room.status] || room.status}
          </span>
          {room.status !== 'waiting' && (
            <p className="text-xs text-muted-foreground mt-1">
              المواجهة {room.current_round} / {room.total_rounds}
            </p>
          )}
        </div>

        {/* Players & Words */}
        {player1 && player2 ? (
          <div className="space-y-3">
            {[player1, player2].map((p, idx) => {
              const word = spectatorWords
                ? (idx === 0 ? spectatorWords.player1_word : spectatorWords.player2_word)
                : null;
              return (
                <div key={p.id} className="card-game !p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{p.avatar}</span>
                    <div className="flex-1">
                      <p className="font-bold text-base">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.wins} فوز</p>
                    </div>
                    {p.is_host && (
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">المضيف</span>
                    )}
                  </div>
                  {word && room.status !== 'waiting' && (
                    <div className="mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30 text-center">
                      <span className="text-[10px] text-muted-foreground block mb-0.5">كلمته</span>
                      <span className="text-xl font-black text-primary">{word}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-game text-center">
            <p className="text-muted-foreground">بانتظار اللاعبين...</p>
          </div>
        )}

        {/* Score Summary */}
        {player1 && player2 && room.status !== 'waiting' && (
          <div className="card-game !p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2 font-bold">النتيجة</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <span className="text-2xl">{player1.avatar}</span>
                <p className="text-2xl font-black text-primary mt-1">{player1.wins}</p>
              </div>
              <span className="text-xl font-black text-muted-foreground">-</span>
              <div className="text-center">
                <span className="text-2xl">{player2.avatar}</span>
                <p className="text-2xl font-black text-primary mt-1">{player2.wins}</p>
              </div>
            </div>
          </div>
        )}

        {/* Round result info */}
        {room.status === 'round_result' && room.round_winner_id && (
          <div className="card-game !p-3 text-center bg-accent/10 border-accent/30">
            <p className="font-bold text-accent">
              🏆 {players.find(p => p.player_id === room.round_winner_id)?.name || 'لاعب'} فاز بالجولة!
            </p>
          </div>
        )}

        {room.status === 'round_result' && !room.round_winner_id && (
          <div className="card-game !p-3 text-center">
            <p className="font-bold">🤝 تعادل!</p>
          </div>
        )}

        {room.status === 'finished' && player1 && player2 && (
          <div className="card-game !p-4 text-center bg-accent/10 border-accent/30">
            {player1.wins > player2.wins ? (
              <p className="text-lg font-black text-accent">🏆 {player1.name} فاز بالمباراة!</p>
            ) : player2.wins > player1.wins ? (
              <p className="text-lg font-black text-accent">🏆 {player2.name} فاز بالمباراة!</p>
            ) : (
              <p className="text-lg font-black">🤝 تعادل عام!</p>
            )}
          </div>
        )}

        <div className="flex-1" />

        <button onClick={() => { playSound('click'); leaveRoom(); }}
          className="w-full btn-secondary-game flex items-center justify-center gap-2">
          <ArrowRight size={18} /> خروج
        </button>
      </div>
    </div>
  );
};

export default GuessingSpectatorScreen;
