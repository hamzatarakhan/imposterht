import React, { useState } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import { Copy, Share2, LogOut, ArrowRight, Pencil, Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import * as guessingService from '@/services/guessingRoomService';
import { useActiveSpeakers } from '@/context/ActiveSpeakersContext';
import { usePresence } from '@/context/PresenceContext';
import PresenceDot, { AwayLabel } from '@/components/game/PresenceDot';

const GuessingLobbyScreen: React.FC = () => {
  const { room, players, isHost, currentPlayer, startGame, leaveRoom } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();
  const { activeSpeakers } = useActiveSpeakers();
  const { awayPlayers } = usePresence();

  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!room) return null;

  const canStart = isHost && players.length === 2;
  const shareUrl = `${window.location.origin}?guessing_join=${room.code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(room.code);
    playSound('click'); vibrate(30);
    toast.success('تم نسخ الكود!');
  };

  const handleShare = async () => {
    playSound('click'); vibrate(30);
    try {
      await navigator.share({ title: '🤔 لعبة التخمين - فعاليات', text: 'تعال نلعب تخمين!', url: shareUrl });
    } catch {
      navigator.clipboard.writeText(shareUrl);
      toast.success('تم نسخ الرابط!');
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

  const handleEditPlayer = (playerId: string, name: string) => {
    const isSelf = playerId === currentPlayer?.player_id;
    if (!isSelf && !isHost) return;
    playSound('click'); vibrate(30);
    setEditingPlayer(playerId);
    setEditName(name);
  };

  const handleSaveEdit = async () => {
    if (!room?.id || !editingPlayer || !editName.trim()) return;
    playSound('click'); vibrate(50);
    const success = await guessingService.renameGuessingPlayer(room.id, editingPlayer, editName.trim());
    if (success) {
      toast.success('تم تحديث الاسم!');
    } else {
      toast.error('فشل التحديث');
    }
    setEditingPlayer(null);
  };

  const handleCancelEdit = () => {
    playSound('click');
    setEditingPlayer(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
        <button onClick={async () => { playSound('click'); await leaveRoom(); }}
          className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black flex-1">⚔️ غرفة التخمين</h1>
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
          <button onClick={() => {
            playSound('click'); vibrate(30);
            const spectateUrl = `${window.location.origin}?guessing_spectate=${room.code}`;
            if (navigator.share) {
              navigator.share({ title: '👁️ تفرّج على لعبة التخمين', text: 'تعال شوف مين بيفوز!', url: spectateUrl }).catch(() => {
                navigator.clipboard.writeText(spectateUrl);
                toast.success('تم نسخ رابط المتفرج!');
              });
            } else {
              navigator.clipboard.writeText(spectateUrl);
              toast.success('تم نسخ رابط المتفرج!');
            }
          }}
            className="w-full py-2.5 px-4 rounded-xl bg-secondary/50 text-muted-foreground font-bold flex items-center justify-center gap-2 hover:bg-secondary/70 transition-colors text-sm">
            <Eye size={16} /> رابط المتفرجين
          </button>
        </div>

        {/* Players */}
        <div className="card-game mb-6">
          <h2 className="font-bold mb-3">⚔️ اللاعبين ({players.length}/2)</h2>
          <div className="space-y-3">
            {players.map(p => {
              const isSelf = p.player_id === currentPlayer?.player_id;
              const canEdit = isSelf || isHost;
              const isEditing = editingPlayer === p.player_id;

              if (isEditing) {
                return (
                  <div key={p.id} className="p-3 rounded-xl bg-primary/10 border border-primary/30">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium outline-none focus:ring-2 ring-primary"
                        maxLength={20}
                        autoFocus
                        dir="auto"
                      />
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editName.trim()}
                        className="p-2 rounded-xl bg-accent text-accent-foreground disabled:opacity-50"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 rounded-xl bg-secondary hover:bg-secondary/80"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                );
              }

              const isSpeaking = activeSpeakers.includes(p.player_id);
              const isAway = awayPlayers.includes(p.player_id);
              return (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl bg-secondary/50 transition-all ${isSpeaking ? 'ring-2 ring-accent/50 shadow-md shadow-accent/10' : ''} ${isAway ? 'opacity-50' : ''}`}>
                  <div className="relative">
                    <span className="text-2xl">{p.avatar}</span>
                    <PresenceDot playerId={p.player_id} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold">{p.name}</span>
                    <AwayLabel playerId={p.player_id} />
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleEditPlayer(p.player_id, p.name)}
                      className="p-1.5 rounded-lg hover:bg-card/80 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {p.is_host && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-bold">المضيف</span>}
                </div>
              );
            })}
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
