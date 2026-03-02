import React from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import { Copy, Share2, LogOut, ArrowRight } from 'lucide-react';

const GuessingLobbyScreen: React.FC = () => {
  const { room, players, isHost, startGame, leaveRoom } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();

  if (!room) return null;

  const canStart = isHost && players.length === 2;
  const shareUrl = `https://imposterht.lovable.app?guessing_join=${room.code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(room.code);
    playSound('click'); vibrate(30);
  };

  const handleShare = async () => {
    playSound('click'); vibrate(30);
    try {
      await navigator.share({ title: '🤔 لعبة التخمين - فعاليات', text: `تعال نلعب تخمين!\n${shareUrl}` });
    } catch {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const handleStart = async () => {
    playSound('click'); vibrate(50);
    await startGame();
  };

  const handleLeave = async () => {
    playSound('click'); vibrate(30);
    await leaveRoom();
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
        <button onClick={async () => { playSound('click'); await leaveRoom(); }}
          className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black">⚔️ غرفة التخمين</h1>
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-6 pt-2">
        {/* Room Code */}
        <div className="card-game text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">كود الغرفة</p>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl font-black tracking-[0.3em] text-primary">{room.code}</span>
            <button onClick={handleCopy} className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <Copy size={20} />
            </button>
          </div>
          <button onClick={handleShare}
            className="w-full py-3 px-4 rounded-xl bg-accent/20 text-accent font-bold flex items-center justify-center gap-2 hover:bg-accent/30 transition-colors">
            <Share2 size={18} /> مشاركة الرابط
          </button>
        </div>

        {/* Players */}
        <div className="card-game mb-6">
          <h2 className="font-bold mb-3">⚔️ اللاعبين ({players.length}/2)</h2>
          <div className="space-y-3">
            {players.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <span className="text-2xl">{p.avatar}</span>
                <span className="font-bold flex-1">{p.name}</span>
                {p.is_host && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-bold">المضيف</span>}
              </div>
            ))}
            {players.length < 2 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border-2 border-dashed border-border">
                <span className="text-2xl opacity-30">👤</span>
                <span className="text-muted-foreground text-sm">بانتظار الخصم...</span>
              </div>
            )}
          </div>
        </div>

        {/* Settings Summary */}
        <div className="card-game mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">عدد المواجهات</span>
            <span className="font-bold">{room.total_rounds}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-3">
          {isHost && (
            <button onClick={handleStart} disabled={!canStart}
              className="w-full btn-primary-game text-xl disabled:opacity-50 disabled:cursor-not-allowed">
              {canStart ? '⚔️ ابدأ المواجهة!' : '⏳ بانتظار الخصم...'}
            </button>
          )}
          {!isHost && (
            <div className="text-center py-4">
              <p className="text-muted-foreground animate-pulse">⏳ بانتظار المضيف يبدأ اللعبة...</p>
            </div>
          )}
          <button onClick={handleLeave}
            className="w-full btn-secondary-game flex items-center justify-center gap-2">
            <LogOut size={18} /> {isHost ? 'حذف الغرفة' : 'مغادرة'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingLobbyScreen;
