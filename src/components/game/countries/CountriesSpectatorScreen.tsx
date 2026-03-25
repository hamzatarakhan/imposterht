import React, { useState } from 'react';
import { useCountries } from '@/context/CountriesGameContext';
import { useSettings } from '@/context/SettingsContext';
import { LogOut, X } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CountriesSpectatorScreen: React.FC = () => {
  const { room, players, burned, leaveRoom } = useCountries();
  const { playSound, vibrate } = useSettings();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [burnedSearch, setBurnedSearch] = useState('');

  const activePlayers = players.filter(p => p.status === 'active');
  const eliminatedPlayers = players.filter(p => p.status === 'eliminated');

  if (!room) return null;

  return (
    <div className="min-h-screen flex flex-col p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />

      <div className="relative z-10 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { playSound('click'); vibrate(30); setShowLeaveDialog(true); }}
            className="p-2 rounded-xl bg-secondary/50 text-muted-foreground">
            <LogOut size={20} />
          </button>
        </div>

        <div className="text-center mb-6">
          <span className="text-4xl mb-2 block">🌍</span>
          <h1 className="text-xl font-black text-foreground">لعبة الدول</h1>
          <p className="text-xs text-muted-foreground mt-1">متابعة لحظية 📡</p>
        </div>

        {/* Active Players */}
        <div className="mb-4 p-3 rounded-2xl bg-secondary/30 border border-border/50">
          <h3 className="text-sm font-bold text-foreground mb-2">🟢 اللاعبون ({activePlayers.length})</h3>
          {activePlayers.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">لا يوجد لاعبين</p>}
          <div className="space-y-2">
            {activePlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-card/50 border border-border/30">
                <span className="font-bold text-sm">{p.name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: p.lives }).map((_, i) => <span key={i} className="text-sm">❤️</span>)}
                  {Array.from({ length: Math.max(0, 3 - p.lives) }).map((_, i) => <span key={i} className="text-sm opacity-20">🖤</span>)}
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
                  <span className="font-bold text-sm line-through">{p.name}</span>
                  <span className="text-xs">💀</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Burned Countries */}
        <div className="mb-4 p-3 rounded-2xl bg-secondary/30 border border-border/50">
          <h3 className="text-sm font-bold text-foreground mb-2">🔥 الدول المحروقة ({burned.length})</h3>
          {burned.length > 3 && (
            <div className="relative mb-2">
              <input
                type="text" value={burnedSearch} onChange={(e) => setBurnedSearch(e.target.value)}
                placeholder="🔍 ابحث عن دولة..."
                className="w-full text-sm py-2 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all"
              />
              {burnedSearch && (
                <button onClick={() => setBurnedSearch('')} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
          )}
          {burned.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">لا يوجد دول محروقة بعد</p>}
          {burned.length > 0 && (() => {
            const filtered = burnedSearch.trim()
              ? burned.filter(b => b.country_name.includes(burnedSearch.trim()))
              : burned;
            return filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">ما في نتائج لـ "{burnedSearch}"</p>
            ) : (
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
              {filtered.map((b, index) => (
                <div key={b.id} className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-card/50 border border-border/30">
                  <span className="text-xs text-muted-foreground font-mono shrink-0">{index + 1}.</span>
                  <span className="text-xs font-medium text-foreground truncate">{b.country_name}</span>
                </div>
              ))}
            </div>
            );
          })()}
        </div>
      </div>

      {/* Leave Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">🚪 مغادرة؟</AlertDialogTitle>
            <AlertDialogDescription className="text-center">هل تريد مغادرة غرفة المتابعة؟</AlertDialogDescription>
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

export default CountriesSpectatorScreen;
