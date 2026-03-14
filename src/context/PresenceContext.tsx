import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PlayerInfo {
  player_id: string;
  name: string;
  avatar: string;
}

interface PresenceContextType {
  awayPlayers: string[]; // player_ids who left the app
}

const PresenceContext = createContext<PresenceContextType>({ awayPlayers: [] });

export const usePresence = () => useContext(PresenceContext);

interface PresenceProviderProps {
  roomId: string;
  playerId: string;
  players?: PlayerInfo[];
  children: ReactNode;
}

export const PresenceProvider: React.FC<PresenceProviderProps> = ({ roomId, playerId, players, children }) => {
  const [awayPlayers, setAwayPlayers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (!roomId || !playerId) return;

    const channelName = `presence-${roomId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    const syncPresence = () => {
      const state = channel.presenceState();
      const onlineIds = new Set<string>();
      
      Object.values(state).forEach((presences: any[]) => {
        presences.forEach((p: any) => {
          if (p.status === 'online') {
            onlineIds.add(p.player_id);
          }
        });
      });

      const allIds = new Set<string>();
      Object.values(state).forEach((presences: any[]) => {
        presences.forEach((p: any) => {
          allIds.add(p.player_id);
        });
      });

      const away: string[] = [];
      allIds.forEach(id => {
        if (!onlineIds.has(id)) {
          away.push(id);
        }
      });

      setAwayPlayers(away);
    };

    channel
      .on('presence', { event: 'sync' }, syncPresence)
      .on('presence', { event: 'join' }, syncPresence)
      .on('presence', { event: 'leave' }, syncPresence)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ player_id: playerId, status: 'online' });
        }
      });

    const handleVisibility = async () => {
      if (!channelRef.current) return;
      if (document.hidden) {
        isVisibleRef.current = false;
        await channelRef.current.track({ player_id: playerId, status: 'away' });
      } else {
        isVisibleRef.current = true;
        await channelRef.current.track({ player_id: playerId, status: 'online' });
      }
    };

    const handleFocus = async () => {
      if (!channelRef.current || isVisibleRef.current) return;
      isVisibleRef.current = true;
      await channelRef.current.track({ player_id: playerId, status: 'online' });
    };

    const handleBlur = async () => {
      if (!channelRef.current) return;
      isVisibleRef.current = false;
      await channelRef.current.track({ player_id: playerId, status: 'away' });
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      
      try {
        if (channelRef.current) {
          channelRef.current.untrack();
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      } catch (e) {
        console.warn('Presence cleanup error:', e);
        channelRef.current = null;
      }
    };
  }, [roomId, playerId]);

  // Filter away players that are not the current user and exist in the players list
  const otherAwayPlayers = awayPlayers.filter(id => id !== playerId);
  const awayPlayerInfos = players
    ? otherAwayPlayers
        .map(id => players.find(p => p.player_id === id))
        .filter(Boolean) as PlayerInfo[]
    : [];

  return (
    <PresenceContext.Provider value={{ awayPlayers }}>
      {children}
      {/* Global away banner - shows on ALL screens when someone leaves */}
      {awayPlayerInfos.length > 0 && (
        <div className="fixed top-14 left-4 right-4 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-destructive/95 backdrop-blur-md text-destructive-foreground rounded-2xl px-4 py-3 shadow-lg shadow-destructive/30 border border-destructive/50">
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-pulse">🚨</div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm">
                  {awayPlayerInfos.length === 1
                    ? `${awayPlayerInfos[0].name} طلع من التطبيق!`
                    : `${awayPlayerInfos.map(p => p.name).join(' و ')} طلعوا من التطبيق!`
                  }
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  ممكن يكون عم يغش 👀
                </p>
              </div>
              <div className="flex -space-x-2 shrink-0">
                {awayPlayerInfos.map(p => (
                  <div key={p.player_id} className="w-9 h-9 rounded-full bg-destructive-foreground/20 flex items-center justify-center text-lg border-2 border-destructive ring-2 ring-destructive/50">
                    {p.avatar}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </PresenceContext.Provider>
  );
};
