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

  // Not connected — show mic icon button top-left
  if (!isConnected && !isConnecting) {
    return (
      <div className="fixed top-4 left-4 z-50 animate-fade-in">
        <button
          onClick={() => { playSound('click'); vibrate(30); enableVoice(); }}
          className={`relative p-3 rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/25 active:scale-95 transition-all ${error ? 'animate-shake' : ''}`}
          title={error ? 'فشل الاتصال — اضغط للمحاولة' : 'انضم للمحادثة الصوتية'}
        >
          <Mic size={20} />
          {!error && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-foreground/80 animate-ping" />
          )}
        </button>
      </div>
    );
  }

  // Connecting
  if (isConnecting) {
    return (
      <div className="fixed top-4 left-4 z-50 animate-fade-in">
        <div className="p-3 rounded-full bg-secondary text-muted-foreground shadow-lg">
          <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Connected — show mic toggle + disconnect
  return (
    <div className="fixed top-4 left-4 z-50 animate-fade-in flex items-center gap-1.5">
      <button
        onClick={() => { playSound('click'); vibrate(30); toggleMute(); }}
        className={`relative p-3 rounded-full shadow-lg transition-all active:scale-95 ${
          isMuted
            ? 'bg-destructive text-destructive-foreground shadow-destructive/20'
            : isSpeaking
            ? 'bg-accent text-accent-foreground ring-2 ring-accent/60 shadow-accent/30'
            : 'bg-accent text-accent-foreground shadow-accent/20'
        }`}
        title={isMuted ? 'فتح المايك 🎤' : 'كتم المايك 🔇'}
      >
        {isMuted ? (
          <MicOff size={20} />
        ) : isSpeaking ? (
          <Volume2 size={20} className="animate-pulse" />
        ) : (
          <Mic size={20} />
        )}
        {!isMuted && (
          <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${isSpeaking ? 'bg-accent-foreground animate-ping' : 'bg-accent-foreground/60'}`} />
        )}
      </button>

      <button
        onClick={() => { playSound('click'); vibrate(30); disableVoice(); }}
        className="p-2 rounded-full bg-secondary/80 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all active:scale-95 shadow-md"
        title="قطع الاتصال"
      >
        <Phone size={14} className="rotate-[135deg]" />
      </button>
    </div>
  );
};

export default FloatingVoiceBar;
