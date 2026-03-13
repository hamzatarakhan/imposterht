import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useVoiceChat } from '@/hooks/useVoiceChat';

interface VoiceChatContextType {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  activeSpeakers: string[];
  error: string | null;
  enabled: boolean;
  connect: () => void;
  disconnect: () => Promise<void>;
  toggleMute: () => Promise<void>;
  enableVoice: () => void;
  disableVoice: () => void;
}

const VoiceChatContext = createContext<VoiceChatContextType | undefined>(undefined);

interface VoiceChatProviderProps {
  roomId: string | undefined;
  playerName: string;
  playerId: string;
  children: ReactNode;
}

export const VoiceChatProvider: React.FC<VoiceChatProviderProps> = ({
  roomId,
  playerName,
  playerId,
  children,
}) => {
  const [enabled, setEnabled] = useState(false);

  const voiceChat = useVoiceChat({
    roomId,
    playerName,
    playerId,
    enabled,
  });

  const enableVoice = useCallback(() => setEnabled(true), []);
  const disableVoice = useCallback(async () => {
    setEnabled(false);
    await voiceChat.disconnect();
  }, [voiceChat.disconnect]);

  return (
    <VoiceChatContext.Provider value={{
      ...voiceChat,
      enabled,
      enableVoice,
      disableVoice,
    }}>
      {children}
    </VoiceChatContext.Provider>
  );
};

export const useVoiceChatContext = () => {
  const ctx = useContext(VoiceChatContext);
  if (!ctx) {
    // Return a safe default when used outside provider
    return {
      isConnected: false,
      isConnecting: false,
      isMuted: true,
      activeSpeakers: [] as string[],
      error: null,
      enabled: false,
      connect: () => {},
      disconnect: async () => {},
      toggleMute: async () => {},
      enableVoice: () => {},
      disableVoice: () => {},
    };
  }
  return ctx;
};
