import React, { useState } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Loader2, X } from 'lucide-react';
import PresenceDot from '@/components/game/PresenceDot';
import { GUESSING_CATEGORIES, GuessingCategory } from '@/data/guessingWords';

const GuessingOnlineFinalResultScreen: React.FC = () => {
  const { players, isHost, leaveRoom, resetOnlineGuessing, replayRoom, setScreen } = useOnlineGuessing();
  const { setScreen: setMainScreen } = useGame();
  const { playSound, vibrate } = useSettings();
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [newCategories, setNewCategories] = useState<GuessingCategory[]>(['random']);
  const [replayLoading, setReplayLoading] = useState(false);

  if (players.length < 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="card-game text-center space-y-4">
          <div className="text-5xl">😢</div>
          <p className="text-lg font-black">الخصم انقطع!</p>
        </div>
        <button onClick={async () => { playSound('click'); vibrate(50); await leaveRoom(); resetOnlineGuessing(); setMainScreen('hub'); }}
          className="w-full btn-primary-game text-lg mt-4">
          🏠 رجوع للرئيسية
        </button>
      </div>
    );
  }

  const winner = players[0].wins >= players[1].wins ? players[0] : players[1];
  const isDraw = players[0].wins === players[1].wins;

  const handleReplay = async () => {
    if (loading) return;
    playSound('click'); vibrate(50);
    setLoading(true);
    await replayRoom();
    setLoading(false);
  };

  const toggleNewCategory = (cat: GuessingCategory) => {
    if (cat === 'random') { setNewCategories(['random']); return; }
    if (newCategories.includes('random')) { setNewCategories([cat]); return; }
    if (newCategories.includes(cat)) {
      if (newCategories.length === 1) return;
      setNewCategories(newCategories.filter(c => c !== cat));
    } else {
      setNewCategories([...newCategories, cat]);
    }
  };

  const handleReplayNewCategory = async () => {
    playSound('click'); vibrate(50);
    setShowCategoryPicker(true);
  };

  const handleConfirmNewCategory = async () => {
    if (replayLoading) return;
    playSound('click'); vibrate(50);
    setReplayLoading(true);
    await replayRoom(newCategories);
    setReplayLoading(false);
    setShowCategoryPicker(false);
  };

  const handleBackToHub = async () => {
    playSound('click'); vibrate(50);
    await leaveRoom();
    resetOnlineGuessing();
    setMainScreen('hub');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
        <button onClick={handleBackToHub}
          className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black">🏆 النتيجة النهائية</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm space-y-5">
        <div className="card-game text-center">
          <div className="text-6xl mb-2 animate-float">{isDraw ? '🤝' : '🏆'}</div>
          <h2 className="text-2xl font-black mb-3">
            {isDraw ? 'تعادل!' : `${winner.name} بطل المواجهة!`}
          </h2>
          {!isDraw && <div className="text-5xl mb-2">{winner.avatar}</div>}
        </div>

        <div className="card-game">
          <h3 className="font-bold mb-4 text-center">📊 النتيجة النهائية</h3>
          <div className="flex items-center justify-center gap-6">
            {players.map(p => (
              <div key={p.id} className={`text-center p-4 rounded-2xl flex-1 ${
                !isDraw && p.player_id === winner.player_id ? 'bg-primary/20 ring-2 ring-primary/40' : 'bg-secondary/50'
              }`}>
                <div className="relative inline-block text-3xl mb-2">
                  {p.avatar}
                  <PresenceDot playerId={p.player_id} size="sm" />
                </div>
                <p className="font-bold">{p.name}</p>
                <p className="text-3xl font-black text-primary mt-1">{p.wins}</p>
                <p className="text-xs text-muted-foreground">فوز</p>
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <div className="space-y-3">
            <button onClick={handleReplay} disabled={loading} className="w-full btn-primary-game flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : '🔄'} العب كمان مرة
            </button>
            <button onClick={handleReplayNewCategory} className="w-full btn-secondary-game">
              🔀 العب بفئة ثانية
            </button>
            <button onClick={handleBackToHub} className="w-full btn-secondary-game">
              🏠 الرئيسية
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground animate-pulse">⏳ بانتظار المضيف...</p>
          </div>
        )}
      </div>
      </div>
      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card-game w-full max-w-sm space-y-4 relative">
            <button onClick={() => { setShowCategoryPicker(false); }} className="absolute top-3 left-3 p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
            <h3 className="text-lg font-black text-center">🔀 اختر الفئة الجديدة</h3>
            <div className="grid grid-cols-3 gap-2">
              {GUESSING_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { playSound('click'); toggleNewCategory(cat.id); }}
                  className={`p-3 rounded-xl text-center transition-all ${
                    newCategories.includes(cat.id)
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 scale-105'
                      : 'bg-secondary/50 hover:bg-secondary/80'
                  }`}
                >
                  <div className="text-xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-bold">{cat.label}</div>
                </button>
              ))}
            </div>
            <button
              onClick={handleConfirmNewCategory}
              disabled={replayLoading}
              className="w-full btn-primary-game flex items-center justify-center gap-2"
            >
              {replayLoading ? <Loader2 size={18} className="animate-spin" /> : '🚀'} ابدأ بالفئة الجديدة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuessingOnlineFinalResultScreen;
