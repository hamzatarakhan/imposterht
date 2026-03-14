import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceContextType {
  awayPlayers: string[]; // player_ids who left the app
}

const PresenceContext = createContext<PresenceContextType>({ awayPlayers: [] });

export const usePresence = () => useContext(PresenceContext);

interface PresenceProviderProps {
  roomId: string;
  playerId: string;
  children: ReactNode;
}

export const PresenceProvider: React.FC<PresenceProviderProps> = ({ roomId, playerId, children }) => {
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

      // Get all tracked player_ids
      const allIds = new Set<string>();
      Object.values(state).forEach((presences: any[]) => {
        presences.forEach((p: any) => {
          allIds.add(p.player_id);
        });
      });

      // Away = tracked but not online, OR not tracked at all (they left completely)
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

    // Handle visibility change (tab switch, app minimize)
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

    // Handle focus/blur for additional coverage
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
      
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomId, playerId]);

  return (
    <PresenceContext.Provider value={{ awayPlayers }}>
      {children}
    </PresenceContext.Provider>
  );
};
