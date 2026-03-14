import React, { useState } from 'react';
import { Mic, MicOff, Loader2, Volume2, VolumeX, PhoneOff } from 'lucide-react';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useSettings } from '@/context/SettingsContext';
import { ActiveSpeakersProvider } from '@/context/ActiveSpeakersContext';

interface VoiceChatOverlayProps {
  roomId: string | undefined;
  playerName: string;
  playerId: string;
  children?: React.ReactNode;
}

const VoiceChatOverlay: React.FC<VoiceChatOverlayProps> = ({ roomId, playerName, playerId, children }) => {
  const { playSound, vibrate } = useSettings();
  const [enabled, setEnabled] = useState(true);

  const voiceChat = useVoiceChat({
    roomId,
    playerName,
    playerId,
    enabled,
  });

  const isSpeaking = voiceChat.activeSpeakers.includes(playerId);

  const renderControls = () => {
    if (!roomId || !playerId) return null;

    // Not connected
    if (!voiceChat.isConnected && !voiceChat.isConnecting) {
      return (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => { playSound('click'); vibrate(30); voiceChat.connect(); }}
            className="p-2.5 rounded-xl bg-accent/20 text-accent hover:bg-accent/30 transition-all shadow-md backdrop-blur-md border border-accent/20"
            title={voiceChat.error ? `فشل الاتصال: ${voiceChat.error}` : 'انضم للمحادثة الصوتية 🎙️'}
          >
            <Mic size={20} />
          </button>
        </div>
      );
    }

    // Connecting
    if (voiceChat.isConnecting) {
      return (
        <div className="fixed top-4 left-4 z-50">
          <button
            disabled
            className="p-2.5 rounded-xl bg-secondary/80 text-muted-foreground animate-pulse shadow-md backdrop-blur-md"
          >
            <Loader2 size={20} className="animate-spin" />
          </button>
        </div>
      );
    }

    // Connected
    return (
      <div className="fixed top-4 left-4 z-50 flex items-center gap-1.5">
        <button
          onClick={() => { playSound('click'); vibrate(30); voiceChat.toggleMute(); }}
          className={`p-2.5 rounded-xl transition-all shadow-md backdrop-blur-md border ${
            voiceChat.isMuted
              ? 'bg-destructive/20 text-destructive border-destructive/30'
              : isSpeaking
              ? 'bg-accent/30 text-accent border-accent/50 ring-2 ring-accent/40 shadow-accent/20'
              : 'bg-accent/20 text-accent border-accent/20'
          }`}
          title={voiceChat.isMuted ? 'فتح المايك' : 'كتم المايك'}
        >
          {voiceChat.isMuted ? <MicOff size={20} /> : isSpeaking ? <Volume2 size={20} /> : <Mic size={20} />}
        </button>

        <button
          onClick={() => { playSound('click'); vibrate(30); voiceChat.toggleDeafen(); }}
          className={`p-2.5 rounded-xl transition-all shadow-md backdrop-blur-md border ${
            voiceChat.isDeafened
              ? 'bg-destructive/20 text-destructive border-destructive/30'
              : 'bg-secondary/80 text-foreground border-border/50'
          }`}
          title={voiceChat.isDeafened ? 'تشغيل الصوت' : 'كتم الصوت'}
        >
          {voiceChat.isDeafened ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <button
          onClick={() => { playSound('click'); vibrate(30); voiceChat.disconnect(); setEnabled(false); }}
          className="p-2.5 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all shadow-md backdrop-blur-md border border-destructive/20"
          title="قطع الاتصال"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    );
  };

  return (
    <ActiveSpeakersProvider activeSpeakers={voiceChat.activeSpeakers}>
      {children}
      {renderControls()}
    </ActiveSpeakersProvider>
  );
};

export default VoiceChatOverlay;
