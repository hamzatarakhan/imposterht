import React, { useState } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Copy, Check, Users, Crown, Loader2, Share2, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import * as roomService from '@/services/roomService';
import OnlineRestartButton from './OnlineRestartButton';
import { usePresence } from '@/context/PresenceContext';

const LobbyScreen: React.FC = () => {
  const { room, players, isHost, currentPlayer, startGame, leaveRoom } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  const { activeSpeakers } = useActiveSpeakers();
  const { awayPlayers } = usePresence();
  
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const handleCopyCode = async () => {
    if (!room?.code) return;
    playSound('click');
    vibrate(30);
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      toast.success('تم نسخ الكود!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('فشل النسخ');
    }
  };

  const handleShare = async () => {
    if (!room?.code) return;
    playSound('click');
    vibrate(30);
    const joinUrl = `${window.location.origin}?join=${room.code}`;
    const shareMessage = `🎭 انضم للعبة الإمبوستر!\n\n🔗 اضغط على الرابط للانضمام مباشرة:\n${joinUrl}`;
    const shareData = { title: 'انضم للعبة الإمبوستر! 🎭', text: shareMessage };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareMessage);
        toast.success('تم نسخ الدعوة!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(shareMessage);
        toast.success('تم نسخ الدعوة!');
      }
    }
  };

  const handleStartGame = async () => {
    if (players.length < 3) {
      toast.error('تحتاج 3 لاعبين على الأقل للبدء');
      return;
    }
    playSound('click');
    vibrate(50);
    setIsStarting(true);
    const success = await startGame();
    if (!success) {
      setIsStarting(false);
      toast.error('فشل بدء اللعبة');
    }
  };

  const handleLeave = async () => {
    playSound('click');
    vibrate(50);
    await leaveRoom();
  };

  const handleEditPlayer = (playerId: string, name: string, avatar: string) => {
    // Only allow self-edit or host editing anyone
    const isSelf = playerId === currentPlayer?.player_id;
    if (!isSelf && !isHost) return;
    
    playSound('click');
    vibrate(30);
    setEditingPlayer(playerId);
    setEditName(name);
    setEditAvatar(avatar);
  };

  const handleSaveEdit = async () => {
    if (!room?.id || !editingPlayer || !editName.trim()) return;
    
    playSound('click');
    vibrate(50);
    
    const success = await roomService.renamePlayer(room.id, editingPlayer, editName.trim(), editAvatar);
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

  const canStart = isHost && players.length >= 3 && players.length <= (room?.player_count || 10);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-1/4 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeave}
              className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <ArrowRight size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">غرفة الانتظار 🎮</h1>
              <p className="text-sm text-muted-foreground">
                في انتظار اللاعبين...
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 pb-32">
          {/* Room Code */}
          <div className="card-game bg-gradient-to-br from-primary/20 to-accent/20 mb-6">
            <p className="text-sm text-muted-foreground text-center mb-2">كود الغرفة</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-mono font-black tracking-[0.3em] text-gradient">
                {room?.code}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  {copied ? <Check size={20} className="text-accent" /> : <Copy size={20} />}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="card-game">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-primary" />
                <span className="font-bold">اللاعبين</span>
              </div>
              <span className="text-muted-foreground">
                {players.length} / {room?.player_count}
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-auto">
              {players.map((player, index) => {
                const isSelf = player.player_id === currentPlayer?.player_id;
                const canEdit = isSelf || isHost;
                console.log('[LobbyDebug]', { playerName: player.name, playerId: player.player_id, currentPlayerId: currentPlayer?.player_id, isSelf, isHost, canEdit });
                const isEditing = editingPlayer === player.player_id;

                if (isEditing) {
                  return (
                    <div key={player.id} className="p-3 rounded-xl bg-primary/10 border border-primary/30">
                      {/* Name input + actions */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium outline-none focus:ring-2 ring-primary"
                          maxLength={15}
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

                const isSpeaking = activeSpeakers.includes(player.player_id);
                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      player.is_host ? 'bg-primary/20' : 'bg-secondary'
                    } ${isSpeaking ? 'ring-2 ring-accent/50 shadow-md shadow-accent/10' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-xl">
                      {player.avatar}
                    </div>
                    <span className="font-medium flex-1">{player.name}</span>
                    {canEdit && (
                      <button
                        onClick={() => handleEditPlayer(player.player_id, player.name, player.avatar)}
                        className="p-1.5 rounded-lg hover:bg-card/80 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {player.is_host && (
                      <Crown size={18} className="text-yellow-500" />
                    )}
                  </div>
                );
              })}

              {/* Empty slots */}
              {room && Array.from({ length: room.player_count - players.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border-2 border-dashed border-secondary"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                    <span className="text-muted-foreground">?</span>
                  </div>
                  <span className="text-muted-foreground">في الانتظار...</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Start Button */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3">
          <div className="w-full max-w-md mx-auto space-y-3">
            {isHost ? (
              <button
                onClick={handleStartGame}
                disabled={!canStart || isStarting}
                className={`w-full btn-primary-game text-xl ${
                  !canStart || isStarting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isStarting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    جاري البدء...
                  </span>
                ) : players.length < 3 ? (
                  `تحتاج ${3 - players.length} لاعبين إضافيين`
                ) : (
                  '🚀 ابدأ اللعبة'
                )}
              </button>
            ) : (
              <div className="card-game bg-secondary/50 text-center">
                <p className="text-muted-foreground">
                  ⏳ في انتظار صاحب الغرفة لبدء اللعبة...
                </p>
              </div>
            )}
            
            <div className="flex justify-center">
              <OnlineRestartButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;
