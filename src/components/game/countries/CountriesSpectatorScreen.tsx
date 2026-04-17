import React, { useState, useMemo } from 'react';
import { useCountries } from '@/context/CountriesGameContext';
import { useSettings } from '@/context/SettingsContext';
import { LogOut, Search, Users, Flame, Skull, ArrowDownAZ, Clock, ArrowUpAZ, History } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type TabKey = 'players' | 'burned' | 'eliminated';
type SortKey = 'newest' | 'oldest' | 'az' | 'za';

const CountriesSpectatorScreen: React.FC = () => {
  const { room, players, burned, leaveRoom } = useCountries();
  const { playSound, vibrate } = useSettings();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [burnedSearch, setBurnedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('players');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const activePlayers = players.filter(p => p.status === 'active');
  const eliminatedPlayers = players.filter(p => p.status === 'eliminated');


  const handleTabChange = (tab: TabKey) => {
    playSound('click');
    vibrate(20);
    setActiveTab(tab);
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number; color: string }[] = [
    { key: 'players', label: 'اللاعبين', icon: <Users size={16} />, count: activePlayers.length, color: 'text-emerald-500' },
    { key: 'burned', label: 'المحروقة', icon: <Flame size={16} />, count: burned.length, color: 'text-orange-500' },
    { key: 'eliminated', label: 'الخارجين', icon: <Skull size={16} />, count: eliminatedPlayers.length, color: 'text-rose-500' },
  ];

  const sortOptions: { key: SortKey; label: string; icon: React.ReactNode }[] = [
    { key: 'newest', label: 'الأحدث أولاً', icon: <Clock size={14} /> },
    { key: 'oldest', label: 'الأقدم أولاً', icon: <History size={14} /> },
    { key: 'az', label: 'أبجدي (أ - ي)', icon: <ArrowDownAZ size={14} /> },
    { key: 'za', label: 'أبجدي (ي - أ)', icon: <ArrowUpAZ size={14} /> },
  ];

  const sortedBurned = useMemo(() => {
    const filtered = burned.filter(b => !burnedSearch || b.country_name.includes(burnedSearch));
    const arr = [...filtered];
    switch (sortKey) {
      case 'newest':
        return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'az':
        return arr.sort((a, b) => a.country_name.localeCompare(b.country_name, 'ar'));
      case 'za':
        return arr.sort((a, b) => b.country_name.localeCompare(a.country_name, 'ar'));
      default:
        return arr;
    }
  }, [burned, burnedSearch, sortKey]);

  const currentSort = sortOptions.find(s => s.key === sortKey)!;

  const handleSortSelect = (key: SortKey) => {
    playSound('click');
    vibrate(20);
    setSortKey(key);
    setShowSortMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { playSound('click'); vibrate(30); setShowLeaveDialog(true); }}
            className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="مغادرة"
          >
            <LogOut size={20} />
          </button>
          <div className="text-center">
            <span className="text-3xl block leading-none">🌍</span>
            <h1 className="text-base font-black text-foreground mt-1">لعبة الدول</h1>
          </div>
          <div className="w-10" />
        </div>

        <p className="text-[11px] text-muted-foreground text-center mb-4">📡 متابعة لحظية</p>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1 rounded-2xl bg-secondary/40 border border-border/50 mb-4">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-card shadow-sm border border-border/60'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`flex items-center gap-1 ${isActive ? tab.color : 'text-muted-foreground'}`}>
                  {tab.icon}
                  <span className="text-[11px] font-bold">{tab.count}</span>
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'players' && (
            <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
              {activePlayers.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-2 opacity-50">👥</span>
                  <p className="text-xs text-muted-foreground">لا يوجد لاعبين بعد</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activePlayers.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-card/70 border border-border/40">
                      <span className="font-bold text-sm">{p.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: p.lives }).map((_, i) => <span key={i} className="text-sm">❤️</span>)}
                        {Array.from({ length: Math.max(0, 3 - p.lives) }).map((_, i) => <span key={i} className="text-sm opacity-20">🖤</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'burned' && (
            <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
              {burned.length > 3 && (
                <div className="relative mb-3">
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={burnedSearch}
                    onChange={(e) => setBurnedSearch(e.target.value)}
                    placeholder="ابحث عن دولة..."
                    className="w-full text-sm py-2 pr-9 pl-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              )}
              {burned.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-2 opacity-50">🔥</span>
                  <p className="text-xs text-muted-foreground">لا يوجد دول محروقة بعد</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 max-h-[55vh] overflow-y-auto">
                  {burned
                    .filter(b => !burnedSearch || b.country_name.includes(burnedSearch))
                    .map((b, index) => (
                      <div key={b.id} className="flex items-center gap-1.5 py-2 px-2.5 rounded-xl bg-card/70 border border-border/40">
                        <span className="text-xs text-muted-foreground font-mono shrink-0">{index + 1}.</span>
                        <span className="text-xs font-medium text-foreground truncate">{b.country_name}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'eliminated' && (
            <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
              {eliminatedPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-2 opacity-50">💀</span>
                  <p className="text-xs text-muted-foreground">ما حدا طلع لسا</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {eliminatedPlayers.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-card/70 border border-border/40 opacity-70">
                      <span className="font-bold text-sm line-through">{p.name}</span>
                      <span className="text-base">💀</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
