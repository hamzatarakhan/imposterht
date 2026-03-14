import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrackPublication,
  RemoteParticipant,
  LocalParticipant,
  ConnectionState,
} from 'livekit-client';
import { supabase } from '@/integrations/supabase/client';

interface UseVoiceChatOptions {
  roomId: string | undefined;
  playerName: string;
  playerId: string;
  enabled?: boolean;
}

interface VoiceChatState {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  activeSpeakers: string[];
  error: string | null;
}

export const useVoiceChat = ({ roomId, playerName, playerId, enabled = false }: UseVoiceChatOptions) => {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isConnecting: false,
    isMuted: false,
    isDeafened: false,
    activeSpeakers: [],
    error: null,
  });

  const roomRef = useRef<Room | null>(null);
  const cleanupRef = useRef(false);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const connect = useCallback(async () => {
    if (!roomId || !playerId || !playerName) return;
    if (roomRef.current) {
      // Already connected
      setState(prev => ({ ...prev, isConnected: true, isConnecting: false }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('livekit-token', {
        body: { roomId, playerName, playerId },
      });

      if (error || !data?.token || !data?.url) {
        throw new Error(error?.message || 'Failed to get voice token');
      }

      if (cleanupRef.current) return;

      const livekitRoom = new Room({
        audioCaptureDefaults: { autoGainControl: true, noiseSuppression: true, echoCancellation: true },
        adaptiveStream: true,
        dynacast: true,
      });

      livekitRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        setState(prev => ({
          ...prev,
          activeSpeakers: speakers.map(s => s.identity),
        }));
      });

      livekitRoom.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach();
          el.id = `audio-${participant.identity}`;
          document.body.appendChild(el);
          audioElementsRef.current.set(participant.identity, el);
        }
      });

      livekitRoom.on(RoomEvent.TrackUnsubscribed, (track, pub, participant) => {
        track.detach().forEach(el => el.remove());
        audioElementsRef.current.delete(participant.identity);
      });

      livekitRoom.on(RoomEvent.Disconnected, () => {
        setState(prev => ({ ...prev, isConnected: false, isConnecting: false, activeSpeakers: [] }));
        roomRef.current = null;
      });

      await livekitRoom.connect(data.url, data.token);

      if (cleanupRef.current) {
        await livekitRoom.disconnect();
        return;
      }

      // Start with mic on by default
      await livekitRoom.localParticipant.setMicrophoneEnabled(true);

      roomRef.current = livekitRoom;
      setState(prev => ({ ...prev, isConnected: true, isConnecting: false, isMuted: false, isDeafened: false }));
    } catch (err) {
      console.error('Voice chat connection error:', err);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err instanceof Error ? err.message : 'Connection failed',
      }));
    }
  }, [roomId, playerName, playerId]);

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    audioElementsRef.current.forEach(el => el.remove());
    audioElementsRef.current.clear();
    setState(prev => ({ ...prev, isConnected: false, isMuted: false, isDeafened: false, activeSpeakers: [] }));
  }, []);

  const toggleMute = useCallback(async () => {
    if (!roomRef.current) return;
    const newMuted = !state.isMuted;
    await roomRef.current.localParticipant.setMicrophoneEnabled(!newMuted);
    setState(prev => ({ ...prev, isMuted: newMuted }));
  }, [state.isMuted]);

  const toggleDeafen = useCallback(() => {
    const newDeafened = !state.isDeafened;
    // Mute/unmute all remote audio elements
    audioElementsRef.current.forEach(el => {
      el.muted = newDeafened;
    });
    setState(prev => ({ ...prev, isDeafened: newDeafened }));
  }, [state.isDeafened]);

  // Auto-connect when enabled
  useEffect(() => {
    cleanupRef.current = false;
    if (enabled && roomId && playerId && playerName) {
      connect();
    }
    return () => {
      cleanupRef.current = true;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      audioElementsRef.current.forEach(el => el.remove());
      audioElementsRef.current.clear();
    };
  }, [enabled, roomId, playerId, playerName]);

  return {
    ...state,
    connect,
    disconnect,
    toggleMute,
    toggleDeafen,
  };
};
