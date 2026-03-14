import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import * as guessingService from '@/services/guessingRoomService';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { ArrowRight } from 'lucide-react';
import PresenceDot from '@/components/game/PresenceDot';

const GuessingOnlinePlayScreen: React.FC = () => {
  const { room, players, isHost, markWinner, markDraw, changeWords, currentPlayer, leaveRoom } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();
  const [myWord, setMyWord] = useState<string | null>(null);
  const [changingWords, setChangingWords] = useState(false);
  const [bothReady, setBothReady] = useState(false);

  const roundNumber = room?.current_round || 1;
  const turnTime = room?.turn_time || 60;
  const startingIndex = (roundNumber - 1) % 2;

  const [activeAskerIndex, setActiveAskerIndex] = useState(startingIndex);
  const [timeLeft, setTimeLeft] = useState(turnTime);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isChannelReadyRef = useRef(false);
  const activeAskerIndexRef = useRef(activeAskerIndex);
  const isMyTurnRef = useRef(false);

  const hasTwoPlayers = !!room && players.length >= 2;
  const activeAsker = hasTwoPlayers ? players[activeAskerIndex] : null;
  const activeTarget = hasTwoPlayers ? players[activeAskerIndex === 0 ? 1 : 0] : null;
  const isMyTurn = !!activeAsker && currentPlayer?.player_id === activeAsker.player_id;

  activeAskerIndexRef.current = activeAskerIndex;
  isMyTurnRef.current = isMyTurn;

  const progressPercent = (timeLeft / turnTime) * 100;

  useEffect(() => {
    if (!room?.id || !currentPlayer?.player_id) return;
    const channel = supabase.channel(`guessing-play-${room.id}-r${roundNumber}`, {
      config: { presence: { key: currentPlayer.player_id } },
    });
    channel.on('broadcast', { event: 'turn_switch' }, ({ payload }) => {
      const nextIndex = Number(payload?.newAskerIndex);
      if (!Number.isFinite(nextIndex)) return;
      setActiveAskerIndex(nextIndex);
      setTimeLeft(Number(payload?.resetTime) || turnTime);
      playSound('alarm');
      vibrate([50, 30, 50]);
    });
    channel.on('broadcast', { event: 'words_changed' }, () => {
      if (room?.id) {
        guessingService.getMyGuessingWord(room.id).then(w => { if (w) setMyWord(w); });
      }
    });
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      if (Object.keys(state).length >= 2) setBothReady(true);
    });
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        isChannelReadyRef.current = true;
        await channel.track({ player_id: currentPlayer.player_id });
      }
    });
    channelRef.current = channel;
    return () => {
      isChannelReadyRef.current = false;
      supabase.removeChannel(channel);
      if (channelRef.current === channel) channelRef.current = null;
    };
  }, [room?.id, roundNumber, turnTime, playSound, vibrate, currentPlayer?.player_id]);

  useEffect(() => {
    const idx = (roundNumber - 1) % 2;
    setActiveAskerIndex(idx);
    setTimeLeft(turnTime);
    setBothReady(false);
  }, [roundNumber, turnTime]);

  const switchTurn = useCallback(() => {
    const newIndex = activeAskerIndexRef.current === 0 ? 1 : 0;
    setActiveAskerIndex(newIndex);
    setTimeLeft(turnTime);
    playSound('alarm');
    vibrate([50, 30, 50]);
    if (channelRef.current && isChannelReadyRef.current) {
      channelRef.current.send({
        type: 'broadcast', event: 'turn_switch',
        payload: { newAskerIndex: newIndex, resetTime: turnTime },
      });
    }
  }, [turnTime, playSound, vibrate]);

  useEffect(() => {
    if (!bothReady) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isMyTurnRef.current) setTimeout(() => switchTurn(), 0);
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [bothReady, switchTurn]);

  useEffect(() => {
    if (!room?.id) return;
    const fetchWord = async () => {
      const w = await guessingService.getMyGuessingWord(room.id);
      setMyWord(w);
      if (!w) setTimeout(async () => { const r = await guessingService.getMyGuessingWord(room.id); if (r) setMyWord(r); }, 1000);
    };
    fetchWord();
  }, [room?.id, room?.current_round]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleWinner = async (playerId: string) => { playSound('win'); vibrate([50, 30, 50]); await markWinner(playerId); };
  const handleDraw = async () => { playSound('click'); vibrate([50, 30, 50]); await markDraw(); };
  const handleChangeWords = async () => {
    if (changingWords) return;
    setChangingWords(true);
    playSound('click');
    const success = await changeWords();
    if (success) {
      if (room?.id) { const w = await guessingService.getMyGuessingWord(room.id); if (w) setMyWord(w); }
      setTimeLeft(turnTime);
      const idx = (roundNumber - 1) % 2;
      setActiveAskerIndex(idx);
      if (channelRef.current && isChannelReadyRef.current) {
        channelRef.current.send({ type: 'broadcast', event: 'words_changed', payload: {} });
        channelRef.current.send({ type: 'broadcast', event: 'turn_switch', payload: { newAskerIndex: idx, resetTime: turnTime } });
      }
    }
    setChangingWords(false);
  };
  const handleSkipTurn = () => { if (isMyTurn) switchTurn(); };

  if (!room || !activeAsker || !activeTarget) return null;

  if (!bothReady) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background pointer-events-none" />
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
          <button onClick={async () => { playSound('click'); await leaveRoom(); }}
            className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black">⚔️ المواجهة</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
          <div className="w-full max-w-sm space-y-5">
            <div className="card-game text-center space-y-4">
              <div className="text-5xl animate-bounce">⏳</div>
              <p className="text-lg font-black">بانتظار الخصم...</p>
              <p className="text-sm text-muted-foreground">المواجهة تبدأ لما تكونوا الاثنين جاهزين</p>
            </div>
            {myWord && (
              <div className="card-game text-center">
                <p className="text-xs text-muted-foreground mb-1">كلمتك:</p>
                <p className="text-2xl font-black text-primary">{myWord}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background pointer-events-none" />

      {/* Compact Header */}
      <div className="relative z-20 bg-background/80 backdrop-blur-md px-4 py-2.5 flex items-center gap-3">
        <button onClick={async () => { playSound('click'); await leaveRoom(); }}
          className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={18} />
        </button>
        <h1 className="text-base font-black flex-1">⚔️ المواجهة {room.current_round}/{room.total_rounds}</h1>
      </div>

      {/* Main Content - fills remaining space */}
      <div className="relative z-10 flex-1 flex flex-col p-4 gap-3 min-h-0">

        {/* Players VS Card */}
        <div className="card-game !p-3">
          <div className="flex items-center justify-between">
            {players.map((p, idx) => {
              const isAsking = idx === activeAskerIndex;
              return (
                <div key={p.id} className={`flex items-center gap-2 flex-1 ${idx === 1 ? 'flex-row-reverse' : ''} transition-all duration-300 ${isAsking ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`relative ${isAsking ? 'scale-110' : 'scale-90'} transition-transform`}>
                    <span className="text-3xl">{p.avatar}</span>
                    <PresenceDot playerId={p.player_id} size="sm" />
                    {isAsking && (
                      <span className="absolute -bottom-1 -left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">🗣️</span>
                    )}
                  </div>
                  <div className={`${idx === 1 ? 'text-right' : ''}`}>
                    <p className="font-bold text-sm leading-tight">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.wins} فوز</p>
                  </div>
                </div>
              );
            })}
            <div className="text-2xl font-black text-primary mx-2 shrink-0">⚔️</div>
          </div>
        </div>

        {/* Timer */}
        <div className="card-game !p-3 text-center space-y-2">
          <p className="text-sm font-bold text-muted-foreground">
            🎯 {activeAsker.name} اسأل {activeTarget.name}!
          </p>
          <div className={`text-3xl font-black tabular-nums ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
            {formatTime(timeLeft)}
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {/* Skip Turn */}
        {isMyTurn ? (
          <button
            onClick={handleSkipTurn}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 font-bold text-sm text-primary-foreground active:scale-95 transition-all shadow-lg shadow-primary/30 border-2 border-primary/50"
          >
            ⏭️ خلصت، دور المنافس
          </button>
        ) : (
          <div className="w-full py-2.5 px-4 rounded-2xl bg-muted/40 text-muted-foreground font-bold text-xs text-center border border-border/50">
            🎙️ دور {activeAsker.name} بالسؤال...
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-0" />

        {/* Host Controls - pinned at bottom */}
        {isHost ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-bold text-center">مين حزر أول؟</p>
            <div className="flex gap-2">
              {players.map(player => (
                <button
                  key={player.id}
                  onClick={() => handleWinner(player.player_id)}
                  className={`flex-1 py-3 px-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    player.is_host
                      ? 'bg-blue-500 border-2 border-blue-400 text-white shadow-md shadow-blue-500/25'
                      : 'bg-red-500 border-2 border-red-400 text-white shadow-md shadow-red-500/25'
                  }`}
                >
                  <span className="text-lg">{player.avatar}</span>
                  🏆 {player.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleDraw}
                className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 bg-card border border-border text-foreground hover:border-primary/60">
                🤝 تعادل
              </button>
              <button onClick={handleChangeWords} disabled={changingWords}
                className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 bg-card border border-border text-foreground hover:border-primary/60 disabled:opacity-50">
                🔄 {changingWords ? 'جاري...' : 'غيّر الكلمات'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-3 text-center">
            <p className="text-muted-foreground text-sm animate-pulse">⏳ المضيف يحدد الفائز...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuessingOnlinePlayScreen;
