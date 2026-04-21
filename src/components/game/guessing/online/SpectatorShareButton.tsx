import React from 'react';
import { Eye, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/context/SettingsContext';

interface Props {
  roomCode: string;
  variant?: 'full' | 'icon' | 'compact';
  className?: string;
}

const SpectatorShareButton: React.FC<Props> = ({ roomCode, variant = 'full', className = '' }) => {
  const { playSound, vibrate } = useSettings();

  const handleShare = () => {
    playSound('click'); vibrate(30);
    const spectateUrl = `${window.location.origin}?guessing_spectate=${roomCode}`;
    if (navigator.share) {
      navigator.share({ title: '👁️ تفرّج على لعبة التخمين', text: 'تعال شوف مين بيفوز!', url: spectateUrl }).catch(() => {
        navigator.clipboard.writeText(spectateUrl);
        toast.success('تم نسخ رابط المتفرج!');
      });
    } else {
      navigator.clipboard.writeText(spectateUrl);
      toast.success('تم نسخ رابط المتفرج!');
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        title="رابط المتفرجين"
        aria-label="رابط المتفرجين"
        className={`p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors ${className}`}
      >
        <Eye size={18} />
      </button>
    );
  }

  // Compact: واضح بالنص لكن صغير عشان يندمج بالهيدر
  if (variant === 'compact') {
    return (
      <button
        onClick={handleShare}
        title="شارك رابط المتفرجين"
        className={`shrink-0 inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-[11px] hover:bg-primary/20 active:scale-95 transition-all ${className}`}
      >
        <Eye size={13} />
        <span>متفرجين</span>
        <Share2 size={11} className="opacity-70" />
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`py-2 px-3 rounded-xl bg-secondary/60 text-muted-foreground font-bold flex items-center justify-center gap-1.5 hover:bg-secondary/80 transition-colors text-xs ${className}`}
    >
      <Eye size={14} /> رابط المتفرجين
    </button>
  );
};

export default SpectatorShareButton;
