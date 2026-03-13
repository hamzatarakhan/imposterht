import React, { useState } from 'react';
import { Mic, MicOff, Loader2, Volume2, PhoneOff } from 'lucide-react';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useSettings } from '@/context/SettingsContext';

interface VoiceChatOverlayProps {
  roomId: string | undefined;
  playerName: string;
  playerId: string;
}

const VoiceChatOverlay: React.FC<VoiceChatOverlayProps> = ({ roomId, playerName, playerId }) => {
  const { playSound, vibrate } = useSettings();
  const [enabled, setEnabled] = useState(false);

  const voiceChat = useVoiceChat({
    roomId,
    playerName,
    playerId,
    enabled,
  });

  const isSpeaking = voiceChat.activeSpeakers.includes(playerId);

  if (!roomId || !playerId) return null;

  // Not connected - show join button
  if (!voiceChat.isConnected && !voiceChat.isConnecting) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => { playSound('click'); vibrate(30); setEnabled(true); }}
          className="p-4 rounded-full bg-accent/20 text-accent hover:bg-accent/30 transition-all shadow-lg backdrop-blur-md border border-accent/20"
          title={voiceChat.error ? `فشل الاتصال: ${voiceChat.error}` : 'انضم للمحادثة الصوتية 🎙️'}
        >
          <Mic size={24} />
        </button>
      </div>
    );
  }

  // Connecting
  if (voiceChat.isConnecting) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <button
          disabled
          className="p-4 rounded-full bg-secondary/80 text-muted-foreground animate-pulse shadow-lg backdrop-blur-md"
        >
          <Loader2 size={24} className="animate-spin" />
        </button>
      </div>
    );
  }

  // Connected - show mute toggle + disconnect
  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2">
      <button
        onClick={() => { playSound('click'); vibrate(30); voiceChat.toggleMute(); }}
        className={`p-4 rounded-full transition-all shadow-lg backdrop-blur-md border ${
          voiceChat.isMuted
            ? 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30'
            : isSpeaking
            ? 'bg-accent/30 text-accent border-accent/50 ring-2 ring-accent/40 shadow-accent/20'
            : 'bg-accent/20 text-accent border-accent/20 hover:bg-accent/30'
        }`}
        title={voiceChat.isMuted ? 'فتح المايك' : 'كتم المايك'}
      >
        {voiceChat.isMuted ? <MicOff size={24} /> : isSpeaking ? <Volume2 size={24} /> : <Mic size={24} />}
      </button>
      <button
        onClick={() => { playSound('click'); vibrate(30); voiceChat.disconnect(); setEnabled(false); }}
        className="p-3 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all shadow-lg backdrop-blur-md border border-destructive/20"
        title="قطع الاتصال"
      >
        <PhoneOff size={18} />
      </button>
    </div>
  );
};

export default VoiceChatOverlay;
