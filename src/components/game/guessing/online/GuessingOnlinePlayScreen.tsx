import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import * as guessingService from '@/services/guessingRoomService';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const GuessingOnlinePlayScreen: React.FC = () => {
  const { room, players, isHost, markWinner, currentPlayer } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();
  const [myWord, setMyWord] = useState<string | null>(null);

  const roundNumber = room?.current_round || 1;
  const startingIndex = (roundNumber - 1) % 2;
  const [activeAskerIndex, setActiveAskerIndex] = useState(startingIndex);
  const turnTime = room?.turn_time || 60;
  const [timeLeft, setTimeLeft] = useState(turnTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isChannelReadyRef = useRef(false);

  const applyTurnSwitchLocally = useCallback((newAskerIndex: number) => {
    setActiveAskerIndex(newAskerIndex);
    setTimeLeft(turnTime);
    playSound('alarm');
    vibrate([50, 30, 50]);
  }, [turnTime, playSound, vibrate]);

  const broadcastTurnSwitch = useCallback((newAskerIndex: number) => {
    applyTurnSwitchLocally(newAskerIndex);

    if (!channelRef.current || !isChannelReadyRef.current) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'turn_switch',
      payload: {
        newAskerIndex,
        resetTime: turnTime,
        at: Date.now(),
      },
    });
  }, [applyTurnSwitchLocally, turnTime]);

  // Setup one stable channel for turn sync across both devices
  useEffect(() => {
    if (!room?.id) return;

    const channel = supabase.channel(`guessing-turn-${room.id}`, {
      config: { broadcast: { self: true } },
    });

    channel.on('broadcast', { event: 'turn_switch' }, ({ payload }) => {
      const nextIndex = Number(payload?.newAskerIndex);
      if (!Number.isFinite(nextIndex)) return;

      setActiveAskerIndex(nextIndex);
      setTimeLeft(Number(payload?.resetTime) || turnTime);
      playSound('alarm');
      vibrate([50, 30, 50]);
    });

    channel.subscribe((status) => {
      isChannelReadyRef.current = status === 'SUBSCRIBED';
    });

    channelRef.current = channel;

    return () => {
      isChannelReadyRef.current = false;
      supabase.removeChannel(channel);
      if (channelRef.current === channel) channelRef.current = null;
    };
  }, [room?.id, turnTime, playSound, vibrate]);

  // Reset turn state when round changes
  useEffect(() => {
    const newStartIndex = (roundNumber - 1) % 2;
    setActiveAskerIndex(newStartIndex);
    setTimeLeft(turnTime);
  }, [roundNumber, turnTime]);

  const hasTwoPlayers = !!room && players.length >= 2;
  const activeAsker = hasTwoPlayers ? players[activeAskerIndex] : null;
  const activeTarget = hasTwoPlayers ? players[activeAskerIndex === 0 ? 1 : 0] : null;
  const isMyTurn = !!activeAsker && currentPlayer?.player_id === activeAsker.player_id;
  const progressPercent = (timeLeft / turnTime) * 100;

  // One local visual countdown on both devices.
  // Only صاحب الدور triggers auto-switch when timer ends.
  useEffect(() => {
    if (!hasTwoPlayers) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isMyTurn) {
            const newIndex = activeAskerIndex === 0 ? 1 : 0;
            broadcastTurnSwitch(newIndex);
            return turnTime;
          }
          return 1;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasTwoPlayers, isMyTurn, activeAskerIndex, broadcastTurnSwitch, turnTime]);

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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleWinner = async (playerId: string) => {
    playSound('win');
    vibrate([50, 30, 50]);
    await markWinner(playerId);
  };

  const handleSkipTurn = () => {
    if (!isMyTurn) return;
    const newIndex = activeAskerIndex === 0 ? 1 : 0;
    broadcastTurnSwitch(newIndex);
  };

  if (!room || !activeAsker || !activeTarget) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="relative z-10 w-full max-w-sm space-y-5">
        <div className="text-sm text-muted-foreground font-bold">
          المواجهة {room.current_round} / {room.total_rounds}
        </div>

        <div className="card-game text-center space-y-3">
          <p className="text-lg font-black">
            🎯 {activeAsker.name} اسأل {activeTarget.name}!
          </p>

          <div className={`text-4xl font-black tabular-nums ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
            {formatTime(timeLeft)}
          </div>

          <Progress value={progressPercent} className="h-2" />

          {isMyTurn ? (
            <button
              onClick={handleSkipTurn}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 font-bold text-base text-primary-foreground active:scale-95 transition-all shadow-lg shadow-primary/30 border-2 border-primary/50"
            >
              ⏭️ خلصت، دور المنافس
            </button>
          ) : (
            <div className="w-full py-3 px-4 rounded-2xl bg-muted/40 text-muted-foreground font-bold text-sm text-center border border-border/50">
              🎙️ دور {activeAsker.name} بالسؤال...
            </div>
          )}
        </div>

        <div className="card-game">
          <div className="flex items-center justify-center gap-6">
            {players.map((p, idx) => (
              <div key={p.id} className={`text-center transition-all duration-300 ${idx === activeAskerIndex ? 'scale-110 opacity-100' : 'scale-90 opacity-50'}`}>
                <div className="text-4xl mb-2">{p.avatar}</div>
                <p className="font-bold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.wins} فوز</p>
                {idx === activeAskerIndex && (
                  <span className="inline-block mt-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">🗣️ يسأل</span>
                )}
              </div>
            ))}
          </div>
          <div className="text-3xl font-black text-primary text-center my-2">⚔️</div>
        </div>

        {myWord && (
          <div className="card-game text-center">
            <p className="text-xs text-muted-foreground mb-1">كلمتك:</p>
            <p className="text-2xl font-black text-primary">{myWord}</p>
          </div>
        )}

        {isHost ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-bold text-center">مين حزر أول؟</p>
            {players.map(player => (
              <button
                key={player.id}
                onClick={() => handleWinner(player.player_id)}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
                  player.is_host
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-2 border-blue-500/40 text-foreground hover:border-blue-500'
                    : 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/40 text-foreground hover:border-red-500'
                }`}
              >
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
