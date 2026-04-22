import React, { useState, useMemo } from 'react';
import { useCountries } from '@/context/CountriesGameContext';
import { useSettings } from '@/context/SettingsContext';
import { useFeedbackTrigger } from '@/context/FeedbackContext';
import { useSavedPlayers, SavedPlayer } from '@/hooks/useSavedPlayers';
import { Plus, Minus, X, ArrowLeftRight, LogOut, Share2, Search, Clock, History, ArrowDownAZ, ArrowUpAZ, Users } from 'lucide-react';
import GroupManagementModal from '../GroupManagementModal';

type SortKey = 'newest' | 'oldest' | 'az' | 'za';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CountriesAdminScreen: React.FC = () => {
  const { room, players, burned, addPlayer, removePlayer, updateLives, addBurned, removeBurned, swapPlayers, leaveRoom } = useCountries();
  const { playSound, vibrate } = useSettings();
  const { notifyRoundCompleted } = useFeedbackTrigger();
  const { savedPlayers } = useSavedPlayers();

  const handleConfirmLeave = () => {
    if (room?.id) notifyRoundCompleted(`countries-${room.id}`);
    leaveRoom();
  };

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newCountryName, setNewCountryName] = useState('');
  const [burnedSearch, setBurnedSearch] = useState('');
  const [swapActive, setSwapActive] = useState<string | null>(null);
  const [swapEliminated, setSwapEliminated] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'players' | 'burned'>('players');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);

  const activePlayers = players.filter(p => p.status === 'active');
  const eliminatedPlayers = players.filter(p => p.status === 'eliminated');

  // Saved names not yet added as players
  const existingNames = new Set(players.map(p => p.name.toLowerCase()));
  const availableSavedNames = savedPlayers.filter(s => !existingNames.has(s.name.toLowerCase()));

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

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    playSound('click'); vibrate(30);
    await addPlayer(newPlayerName.trim());
    setNewPlayerName('');
  };

  const handleAddSavedName = async (name: string) => {
    if (existingNames.has(name.toLowerCase())) return;
    playSound('click'); vibrate(20);
    await addPlayer(name);
  };

  const handleSelectGroup = async (members: SavedPlayer[]) => {
    playSound('click'); vibrate(50);
    let added = 0;
    for (const m of members) {
      if (!existingNames.has(m.name.toLowerCase())) {
        await addPlayer(m.name);
        added++;
      }
    }
    toast.success(added > 0 ? `تمّت إضافة ${added} لاعبين` : 'كل اللاعبين موجودين');
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

  const shareUrl = room ? `${window.location.origin}?countries_join=${room.code}` : '';

  const handleShare = async () => {
    if (!room) return;
    playSound('click'); vibrate(30);
    try {
      await navigator.share({ title: '🌍 لعبة الدول - فعاليات', text: 'تعال تابع معنا لعبة الدول!', url: shareUrl });
    } catch {
      navigator.clipboard.writeText(shareUrl);
      toast.success('تم نسخ الرابط!');
    }
  };

  if (!room) return null;

  return (
    <div className="min-h-screen flex flex-col p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setShowLeaveDialog(true)} className="p-2 rounded-xl bg-secondary/50 text-muted-foreground">
            <LogOut size={20} />
          </button>
          <h1 className="text-lg font-black text-foreground">👑 لوحة التحكم</h1>
          <div className="w-9" />
        </div>

        {/* Share Button */}
        <button onClick={handleShare}
          className="w-full mb-3 py-2.5 px-4 rounded-2xl bg-primary/10 border border-primary/30 text-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors">
          <Share2 size={16} />
          شارك رابط المتابعة
        </button>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { playSound('click'); setActiveTab('players'); }}
            className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'players'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-secondary/50 text-muted-foreground'
            }`}
          >
            🎮 اللاعبون ({activePlayers.length})
          </button>
          <button
            onClick={() => { playSound('click'); setActiveTab('burned'); }}
            className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'burned'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-secondary/50 text-muted-foreground'
            }`}
          >
            🔥 الدول المحروقة ({burned.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'players' ? (
            <div className="space-y-4">
              {/* Add Player */}
              <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50 space-y-2.5">
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

                {/* Pick from saved group */}
                <button
                  onClick={() => { playSound('click'); vibrate(30); setShowGroupsModal(true); }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary/20 transition-colors"
                >
                  <Users size={14} />
                  اختر مجموعة جاهزة
                </button>

                {/* Saved individual names */}
                {availableSavedNames.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1.5">اضغط لإضافة لاعب محفوظ:</p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {availableSavedNames.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAddSavedName(s.name)}
                          className="px-2 py-1 rounded-lg bg-secondary hover:bg-primary/20 hover:text-primary border border-border/40 text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Plus size={10} />
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Players */}
              {activePlayers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا يوجد لاعبين بعد</p>}
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
                        disabled={p.lives >= 3}
                        className="w-8 h-8 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed">
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

              {/* Eliminated Players */}
              {eliminatedPlayers.length > 0 && (
                <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
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
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
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
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add Burned Country */}
              <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="flex gap-2">
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
              </div>

              {/* Search + Sort */}
              {burned.length > 0 && (
                <div className="flex gap-2">
                  {burned.length > 3 && (
                    <div className="relative flex-1">
                      <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text" value={burnedSearch} onChange={(e) => setBurnedSearch(e.target.value)}
                        placeholder="ابحث عن دولة..."
                        className="w-full text-sm py-2 pr-9 pl-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => { playSound('click'); vibrate(20); setShowSortMenu(v => !v); }}
                      className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-secondary border-2 border-transparent hover:border-primary/40 transition-all text-xs font-bold text-foreground"
                      aria-label="ترتيب"
                    >
                      {currentSort.icon}
                      <span className="hidden xs:inline">{currentSort.label}</span>
                    </button>
                    {showSortMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                        <div className="absolute left-0 top-full mt-1.5 z-20 min-w-[160px] rounded-xl bg-card border border-border/60 shadow-lg overflow-hidden">
                          {sortOptions.map(opt => {
                            const isActive = sortKey === opt.key;
                            return (
                              <button
                                key={opt.key}
                                onClick={() => handleSortSelect(opt.key)}
                                className={`w-full flex items-center gap-2 py-2 px-3 text-xs font-bold transition-colors text-right ${
                                  isActive ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-secondary/60'
                                }`}
                              >
                                {opt.icon}
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Burned List */}
              {burned.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">ما في دول محروقة بعد</p>}
              {burned.length > 0 && sortedBurned.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-2 opacity-50">🔍</span>
                  <p className="text-xs text-muted-foreground">ما في نتائج للبحث</p>
                </div>
              )}
              {sortedBurned.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                  {sortedBurned.map((b, index) => (
                    <div key={b.id} className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-card/50 border border-border/30">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs text-muted-foreground font-mono shrink-0">{index + 1}.</span>
                        <span className="text-xs font-medium text-foreground truncate">{b.country_name}</span>
                      </div>
                      <button onClick={() => { playSound('click'); removeBurned(b.id); }}
                        className="w-5 h-5 rounded-md bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors shrink-0 ml-1">
                        <X size={10} />
                      </button>
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
            <AlertDialogTitle className="text-center">🚪 مغادرة الغرفة؟</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              إذا طلعت رح تنحذف الغرفة وكل البيانات
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 justify-center">
            <AlertDialogCancel className="flex-1 m-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLeave} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
              نعم، طلّعني
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Saved Groups Modal */}
      <GroupManagementModal
        isOpen={showGroupsModal}
        onClose={() => setShowGroupsModal(false)}
        onSelectGroup={handleSelectGroup}
      />
    </div>
  );
};

export default CountriesAdminScreen;
