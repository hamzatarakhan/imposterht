import React from 'react';
import { Mic, MicOff, Loader2, Volume2, Phone } from 'lucide-react';

interface VoiceChatButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  onToggleMute: () => void;
  onConnect: () => void;
  onDisconnect?: () => void;
  error?: string | null;
  compact?: boolean;
}

const VoiceChatButton: React.FC<VoiceChatButtonProps> = ({
  isConnected,
  isConnecting,
  isMuted,
  isSpeaking,
  onToggleMute,
  onConnect,
  onDisconnect,
  error,
  compact = false,
}) => {
  // Not connected — show join button
  if (!isConnected && !isConnecting) {
    return (
      <button
        onClick={onConnect}
        className={`group relative flex items-center gap-2 rounded-2xl font-bold transition-all active:scale-95
          bg-accent text-accent-foreground hover:brightness-110 shadow-md shadow-accent/20
          ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-base'}
          ${error ? 'animate-shake' : 'animate-fade-in'}
        `}
        title={error ? `فشل الاتصال — اضغط للمحاولة مرة أخرى` : 'انضم للمحادثة الصوتية'}
      >
        <Phone size={compact ? 16 : 18} />
        <span>{error ? 'أعد المحاولة' : '🎙️ انضم للصوت'}</span>
        {!error && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-ping" />
        )}
      </button>
    );
  }

  // Connecting
  if (isConnecting) {
    return (
      <div className={`flex items-center gap-2 rounded-2xl bg-secondary text-muted-foreground
        ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-base'}`}>
        <Loader2 size={compact ? 16 : 18} className="animate-spin" />
        <span className="font-medium">جاري الاتصال...</span>
      </div>
    );
  }

  // Connected — show mic toggle + disconnect
  return (
    <div className="flex items-center gap-1.5 animate-fade-in">
      {/* Mic toggle */}
      <button
        onClick={onToggleMute}
        className={`relative flex items-center gap-2 rounded-2xl font-bold transition-all active:scale-95
          ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-base'}
          ${isMuted
            ? 'bg-destructive text-destructive-foreground shadow-md shadow-destructive/20'
            : isSpeaking
            ? 'bg-accent text-accent-foreground ring-2 ring-accent/60 shadow-lg shadow-accent/30'
            : 'bg-accent text-accent-foreground shadow-md shadow-accent/20'
          }
        `}
        title={isMuted ? 'فتح المايك 🎤' : 'كتم المايك 🔇'}
      >
        {isMuted ? (
          <MicOff size={compact ? 16 : 18} />
        ) : isSpeaking ? (
          <Volume2 size={compact ? 16 : 18} className="animate-pulse" />
        ) : (
          <Mic size={compact ? 16 : 18} />
        )}
        <span>{isMuted ? 'مكتوم' : 'مفتوح'}</span>

        {/* Live indicator dot */}
        {!isMuted && (
          <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-accent-foreground animate-ping' : 'bg-accent-foreground/60'}`} />
        )}
      </button>

      {/* Disconnect button */}
      {onDisconnect && (
        <button
          onClick={onDisconnect}
          className={`rounded-2xl bg-secondary text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all active:scale-95
            ${compact ? 'p-2' : 'p-3'}`}
          title="قطع الاتصال الصوتي"
        >
          <Phone size={compact ? 14 : 16} className="rotate-[135deg]" />
        </button>
      )}
    </div>
  );
};

export default VoiceChatButton;
