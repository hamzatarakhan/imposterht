import React, { useState, useEffect, useRef } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import * as guessingService from '@/services/guessingRoomService';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight } from 'lucide-react';
import PresenceDot from '@/components/game/PresenceDot';

const GuessingOnlinePlayScreen: React.FC = () => {
  const { room, players, isHost, markWinner, markDraw, changeWords, currentPlayer, leaveRoom } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();
  const [myWord, setMyWord] = useState<string | null>(null);
  const [changingWords, setChangingWords] = useState(false);
  const [bothReady, setBothReady] = useState(false);

  const roundNumber = room?.current_round || 1;

  const hasTwoPlayers = !!room && players.length >= 2;

  useEffect(() => {
    if (!room?.id || !currentPlayer?.player_id) return;
    const channel = supabase.channel(`guessing-play-${room.id}-r${roundNumber}`, {
      config: { presence: { key: currentPlayer.player_id } },
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
        await channel.track({ player_id: currentPlayer.player_id });
      }
    });
    const channelRef = channel;
    return () => {
      supabase.removeChannel(channelRef);
    };
  }, [room?.id, roundNumber, currentPlayer?.player_id]);

  useEffect(() => {
    setBothReady(false);
  }, [roundNumber]);

  useEffect(() => {
    if (!room?.id) return;
    const fetchWord = async () => {
      const w = await guessingService.getMyGuessingWord(room.id);
      setMyWord(w);
      if (!w) setTimeout(async () => { const r = await guessingService.getMyGuessingWord(room.id); if (r) setMyWord(r); }, 1000);
    };
    fetchWord();
  }, [room?.id, room?.current_round]);

  const handleWinner = async (playerId: string) => { playSound('win'); vibrate([50, 30, 50]); await markWinner(playerId); };
  const handleDraw = async () => { playSound('click'); vibrate([50, 30, 50]); await markDraw(); };
  const handleChangeWords = async () => {
    if (changingWords) return;
    setChangingWords(true);
    playSound('click');
    const success = await changeWords();
    if (success && room?.id) {
      const w = await guessingService.getMyGuessingWord(room.id);
      if (w) setMyWord(w);
      // Broadcast to guest so they refetch their word too
      const channel = supabase.channel(`guessing-play-${room.id}-r${roundNumber}`);
      await channel.send({ type: 'broadcast', event: 'words_changed', payload: {} });
      supabase.removeChannel(channel);
    }
    setChangingWords(false);
  };

  if (!room) return null;

  // Opponent disconnected
  if (!hasTwoPlayers || players.length < 2) {
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
              <div className="text-5xl">😢</div>
              <p className="text-lg font-black">الخصم انقطع!</p>
              <p className="text-sm text-muted-foreground">يبدو إنه طلع من اللعبة</p>
            </div>
            <button onClick={async () => { playSound('click'); await leaveRoom(); }}
              className="w-full btn-primary-game text-lg">
              🏠 رجوع للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Header */}
      <div className="relative z-20 bg-background/80 backdrop-blur-md px-4 py-2.5 flex items-center gap-3">
        <button onClick={async () => { playSound('click'); await leaveRoom(); }}
          className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={18} />
        </button>
        <h1 className="text-base font-black flex-1">⚔️ المواجهة {room.current_round}/{room.total_rounds}</h1>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col p-4 gap-3 min-h-0">

        {/* Players VS Card */}
        <div className="card-game !p-3">
          <div className="flex items-center justify-between">
            {players.map((p, idx) => (
              <div key={p.id} className={`flex items-center gap-2 flex-1 ${idx === 1 ? 'flex-row-reverse' : ''}`}>
                <div className="relative">
                  <span className="text-3xl">{p.avatar}</span>
                  <PresenceDot playerId={p.player_id} size="sm" />
                </div>
                <div className={`${idx === 1 ? 'text-right' : ''}`}>
                  <p className="font-bold text-sm leading-tight">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.wins} فوز</p>
                </div>
              </div>
            ))}
            <div className="text-2xl font-black text-primary mx-2 shrink-0">⚔️</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card-game !p-3 text-center">
          <p className="text-lg font-bold mb-1">🗣️ اسألوا بعض!</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            كل واحد يسأل الثاني أسئلة عن كلمته
            <br />
            أول واحد يحزر كلمة خصمه يفوز! 🏆
          </p>
        </div>

        {/* My Word */}
        {myWord && (
          <div className="w-full py-2.5 px-4 rounded-2xl bg-primary/10 border border-primary/30 text-center">
            <span className="text-[11px] text-muted-foreground ml-1">كلمتك</span>
            <span className="text-lg font-black text-primary mr-2">{myWord}</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-0" />

        {/* Host Controls */}
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
