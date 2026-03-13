import React from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';

interface VoiceChatButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  onToggleMute: () => void;
  onConnect: () => void;
  error?: string | null;
}

const VoiceChatButton: React.FC<VoiceChatButtonProps> = ({
  isConnected,
  isConnecting,
  isMuted,
  isSpeaking,
  onToggleMute,
  onConnect,
  error,
}) => {
  if (isConnecting) {
    return (
      <button
        disabled
        className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground animate-pulse"
        title="جاري الاتصال..."
      >
        <Loader2 size={22} className="animate-spin" />
      </button>
    );
  }

  if (!isConnected) {
    return (
      <button
        onClick={onConnect}
        className="p-3 rounded-2xl bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
        title={error ? `فشل الاتصال: ${error}` : 'اضغط للانضمام للمحادثة الصوتية'}
      >
        <Mic size={22} />
      </button>
    );
  }

  return (
    <button
      onClick={onToggleMute}
      className={`p-3 rounded-2xl transition-all ${
        isMuted
          ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
          : isSpeaking
          ? 'bg-accent/30 text-accent ring-2 ring-accent/50 shadow-lg shadow-accent/20'
          : 'bg-accent/20 text-accent hover:bg-accent/30'
      }`}
      title={isMuted ? 'فتح المايك' : 'كتم المايك'}
    >
      {isMuted ? <MicOff size={22} /> : isSpeaking ? <Volume2 size={22} /> : <Mic size={22} />}
    </button>
  );
};

export default VoiceChatButton;
