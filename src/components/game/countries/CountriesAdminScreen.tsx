import React, { useState } from 'react';
import { useCountries } from '@/context/CountriesGameContext';
import { useSettings } from '@/context/SettingsContext';
import { Plus, Minus, X, ArrowLeftRight, Trash2, Copy, LogOut, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CountriesAdminScreen: React.FC = () => {
  const { room, players, burned, addPlayer, removePlayer, updateLives, addBurned, removeBurned, swapPlayers, leaveRoom } = useCountries();
  const { playSound, vibrate } = useSettings();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newCountryName, setNewCountryName] = useState('');
  const [swapActive, setSwapActive] = useState<string | null>(null);
  const [swapEliminated, setSwapEliminated] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const activePlayers = players.filter(p => p.status === 'active');
  const eliminatedPlayers = players.filter(p => p.status === 'eliminated');

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    playSound('click'); vibrate(30);
    await addPlayer(newPlayerName.trim());
    setNewPlayerName('');
  };

  const handleAddCountry = async () => {
    if (!newCountryName.trim()) return;
    playSound('click'); vibrate(30);
    await addBurned(newCountryName.trim());
    setNewCountryName('');
  };

  const handleSwap = async () => {
    if (!swapActive || !swapEliminated) return;
    playSound('click'); vibrate(50);
    await swapPlayers(swapActive, swapEliminated);
    setSwapActive(null);
    setSwapEliminated(null);
  };

  const copyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!room) return null;

  return (
    <div className="min-h-screen flex flex-col p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />

      <div className="relative z-10 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setShowLeaveDialog(true)} className="p-2 rounded-xl bg-secondary/50 text-muted-foreground">
            <LogOut size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">كود الغرفة:</span>
            <button onClick={copyCode} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/20 text-primary font-black text-lg tracking-widest">
              {room.code}
              <Copy size={14} />
            </button>
            {copied && <span className="text-xs text-green-500">تم النسخ!</span>}
          </div>
        </div>

        <h1 className="text-xl font-black text-foreground mb-4 text-center">👑 لوحة تحكم الـ Admin</h1>

        {/* Add Player */}
        <div className="mb-4 p-3 rounded-2xl bg-secondary/30 border border-border/50">
          <h3 className="text-sm font-bold text-foreground mb-2">➕ إضافة لاعب</h3>
          <div className="flex gap-2">
            <input
              type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value.slice(0, 20))}
              placeholder="اسم اللاعب" maxLength={20}
              className="flex-1 text-sm py-2 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddPlayer(); }}
            />
            <button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50">
              أضف
            </button>
          </div>
        </div>

        {/* Active Players */}
        <div className="mb-4 p-3 rounded-2xl bg-secondary/30 border border-border/50">
          <h3 className="text-sm font-bold text-foreground mb-2">🟢 اللاعبون ({activePlayers.length})</h3>
          {activePlayers.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">لا يوجد لاعبين بعد</p>}
          <div className="space-y-2">
            {activePlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-card/50 border border-border/30">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{p.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: p.lives }).map((_, i) => <span key={i} className="text-sm">❤️</span>)}
                    {Array.from({ length: Math.max(0, 3 - p.lives) }).map((_, i) => <span key={i} className="text-sm opacity-20">🖤</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { playSound('click'); vibrate(20); updateLives(p.id, -1); }}
                    className="w-8 h-8 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive/30">
                    <Minus size={16} />
                  </button>
                  <button onClick={() => { playSound('click'); vibrate(20); updateLives(p.id, 1); }}
                    className="w-8 h-8 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500/30">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => { playSound('click'); vibrate(20); removePlayer(p.id); }}
                    className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center hover:text-destructive">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eliminated Players */}
        {eliminatedPlayers.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-secondary/30 border border-border/50">
            <h3 className="text-sm font-bold text-foreground mb-2">🔴 خارج اللعبة ({eliminatedPlayers.length})</h3>
            <div className="space-y-2">
              {eliminatedPlayers.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-card/50 border border-border/30 opacity-60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm line-through">{p.name}</span>
                    <span className="text-xs text-destructive">💀</span>
                  </div>
                  <button onClick={() => { playSound('click'); vibrate(20); removePlayer(p.id); }}
                    className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center hover:text-destructive">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Swap Section */}
        {activePlayers.length > 0 && eliminatedPlayers.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
            <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <ArrowLeftRight size={16} /> تبديل لاعبين
            </h3>
            <p className="text-xs text-muted-foreground mb-3">اللاعب البرا يدخل بأرواح اللاعب الداخل</p>
            <div className="flex flex-col gap-2 mb-3">
              <select value={swapActive || ''} onChange={(e) => setSwapActive(e.target.value || null)}
                className="w-full py-2 px-3 rounded-xl bg-secondary text-sm text-foreground">
                <option value="">اختر لاعب داخل اللعبة...</option>
                {activePlayers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.lives} ❤️)</option>)}
              </select>
              <select value={swapEliminated || ''} onChange={(e) => setSwapEliminated(e.target.value || null)}
                className="w-full py-2 px-3 rounded-xl bg-secondary text-sm text-foreground">
                <option value="">اختر لاعب برا اللعبة...</option>
                {eliminatedPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button onClick={handleSwap} disabled={!swapActive || !swapEliminated}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-sm disabled:opacity-50 hover:bg-amber-500/30 transition-colors">
              🔄 تبديل
            </button>
          </div>
        )}

        {/* Add Burned Country */}
        <div className="mb-4 p-3 rounded-2xl bg-secondary/30 border border-border/50">
          <h3 className="text-sm font-bold text-foreground mb-2">🔥 الدول المحترقة ({burned.length})</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text" value={newCountryName} onChange={(e) => setNewCountryName(e.target.value.slice(0, 30))}
              placeholder="اسم الدولة" maxLength={30}
              className="flex-1 text-sm py-2 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCountry(); }}
            />
            <button onClick={handleAddCountry} disabled={!newCountryName.trim()}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50">
              أضف
            </button>
          </div>
          {burned.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {burned.map(b => (
                <span key={b.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                  {b.country_name}
                  <button onClick={() => { playSound('click'); removeBurned(b.id); }} className="hover:text-destructive/80">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leave Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">🚪 مغادرة الغرفة؟</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              إذا طلعت رح تنحذف الغرفة وكل البيانات
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 justify-center">
            <AlertDialogCancel className="flex-1 m-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={leaveRoom} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
              نعم، طلّعني
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CountriesAdminScreen;
