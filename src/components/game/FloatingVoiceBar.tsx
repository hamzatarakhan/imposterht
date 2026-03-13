import React from 'react';
import { Mic, MicOff, Volume2, Phone } from 'lucide-react';
import { useVoiceChatContext } from '@/context/VoiceChatContext';
import { useSettings } from '@/context/SettingsContext';

interface FloatingVoiceBarProps {
  currentPlayerId?: string;
}

const FloatingVoiceBar: React.FC<FloatingVoiceBarProps> = ({ currentPlayerId }) => {
  const { isConnected, isConnecting, isMuted, activeSpeakers, toggleMute, disableVoice, enableVoice, error } = useVoiceChatContext();
  const { playSound, vibrate } = useSettings();

  const isSpeaking = currentPlayerId ? activeSpeakers.includes(currentPlayerId) : false;

  // Not connected — show small join pill
  if (!isConnected && !isConnecting) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
        <button
          onClick={() => { playSound('click'); vibrate(30); enableVoice(); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-accent-foreground font-bold text-sm shadow-lg shadow-accent/25 active:scale-95 transition-all"
        >
          <Mic size={16} />
          <span>🎙️ انضم للصوت</span>
          {!error && <span className="w-2.5 h-2.5 rounded-full bg-accent-foreground/80 animate-ping" />}
        </button>
      </div>
    );
  }

  // Connecting
  if (isConnecting) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-muted-foreground font-medium text-sm shadow-lg">
          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          <span>جاري الاتصال...</span>
        </div>
      </div>
    );
  }

  // Connected — show floating control bar
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className={`flex items-center gap-2 px-2 py-1.5 rounded-full shadow-xl backdrop-blur-md transition-all ${
        isMuted
          ? 'bg-card/90 border border-border'
          : isSpeaking
          ? 'bg-accent/20 border border-accent/40 shadow-accent/15'
          : 'bg-card/90 border border-accent/30'
      }`}>
        {/* Mic toggle */}
        <button
          onClick={() => { playSound('click'); vibrate(30); toggleMute(); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-sm transition-all active:scale-95 ${
            isMuted
              ? 'bg-destructive text-destructive-foreground'
              : isSpeaking
              ? 'bg-accent text-accent-foreground'
              : 'bg-accent text-accent-foreground'
          }`}
        >
          {isMuted ? (
            <MicOff size={15} />
          ) : isSpeaking ? (
            <Volume2 size={15} className="animate-pulse" />
          ) : (
            <Mic size={15} />
          )}
          <span>{isMuted ? 'مكتوم' : 'مفتوح'}</span>
          {!isMuted && (
            <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-accent-foreground animate-ping' : 'bg-accent-foreground/60'}`} />
          )}
        </button>

        {/* Disconnect */}
        <button
          onClick={() => { playSound('click'); vibrate(30); disableVoice(); }}
          className="p-2 rounded-full bg-secondary text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all active:scale-95"
          title="قطع الاتصال"
        >
          <Phone size={14} className="rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
};

export default FloatingVoiceBar;
