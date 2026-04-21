import React, { useState } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import { AVATAR_OPTIONS } from '@/context/GameContext';
import { useUserName } from '@/hooks/useUserName';
import { GUESSING_CATEGORIES, GuessingCategory } from '@/data/guessingWords';
import { ArrowRight, Shuffle, Mic, Eye } from 'lucide-react';

const GuessingCreateRoomScreen: React.FC = () => {
  const { createRoom, setScreen } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();
  const { name, setName, avatar, setAvatar, persist } = useUserName('👤');

  const [categories, setCategories] = useState<GuessingCategory[]>(['random']);
  const [totalRounds, setTotalRounds] = useState(5);
  
  const [voiceChatEnabled, setVoiceChatEnabled] = useState(false);
  const [presenceEnabled, setPresenceEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (cat: GuessingCategory) => {
    if (cat === 'random') { setCategories(['random']); return; }
    setCategories(prev => {
      const withoutRandom = prev.filter(c => c !== 'random');
      if (withoutRandom.includes(cat)) {
        const next = withoutRandom.filter(c => c !== cat);
        return next.length === 0 ? ['random'] : next;
      }
      return [...withoutRandom, cat];
    });
  };

  const handleCreate = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    playSound('click'); vibrate(50);
    const success = await createRoom(name.trim(), avatar, { categories, totalRounds, voiceChatEnabled, presenceEnabled });
    if (success) persist(name.trim(), avatar);
    else setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
        <button onClick={(e) => { e.stopPropagation(); playSound('click'); setScreen('guessingModeSelect'); }}
          className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black">🏠 إنشاء غرفة تخمين</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-56 space-y-5">
        {/* Name & Avatar */}
        <div className="card-game">
          <h2 className="font-bold mb-3">👤 اسمك</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => {
              playSound('click');
              const idx = AVATAR_OPTIONS.indexOf(avatar);
              setAvatar(AVATAR_OPTIONS[(idx + 1) % AVATAR_OPTIONS.length]);
            }} className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl hover:scale-110 transition-transform flex-shrink-0">
              {avatar}
            </button>
            <input type="text" value={name} onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="اسم اللاعب" maxLength={20}
              className="flex-1 text-sm font-bold py-2.5 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Rounds */}
        <div className="card-game">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏆</span>
            <h2 className="font-bold">عدد المواجهات</h2>
            <span className="mr-auto text-2xl font-black text-primary">{totalRounds}</span>
          </div>
          <div className="flex gap-2">
            {[3, 5, 7].map(n => (
              <button key={n} onClick={() => { playSound('click'); setTotalRounds(n); }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${totalRounds === n ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-muted-foreground'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>


        {/* Categories */}
        <div className="card-game">
          <div className="flex items-center gap-2 mb-1">
            <Shuffle size={20} className="text-primary" />
            <h2 className="font-bold">الفئات</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">اختر فئة أو أكثر — كل مواجهة بتاخد فئة منهم 🎯</p>
          <div className="grid grid-cols-3 gap-2">
            {GUESSING_CATEGORIES.map(cat => {
              const isSelected = categories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => { playSound('click'); vibrate(20); toggleCategory(cat.id); }}
                  className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Voice Chat & Presence Toggles */}
        <div className="card-game space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">ميزات إضافية</h3>
          <p className="text-xs text-muted-foreground/70">مفيدة إذا بتلعب أونلاين مع ناس وكل واحد على جهازه 📱</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic size={18} className={voiceChatEnabled ? 'text-primary' : 'text-muted-foreground'} />
              <div>
                <p className="font-medium text-sm">محادثة صوتية</p>
                <p className="text-xs text-muted-foreground">تكلم مع اللاعبين بالصوت</p>
              </div>
            </div>
            <button
              onClick={() => { playSound('click'); setVoiceChatEnabled(!voiceChatEnabled); }}
              className={`w-14 h-8 rounded-full transition-colors relative ${voiceChatEnabled ? 'bg-primary' : 'bg-secondary'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${voiceChatEnabled ? 'left-1' : 'right-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye size={18} className={presenceEnabled ? 'text-primary' : 'text-muted-foreground'} />
              <div>
                <p className="font-medium text-sm">تتبع الخصم</p>
                <p className="text-xs text-muted-foreground">اعرف مين طلع من التطبيق</p>
              </div>
            </div>
            <button
              onClick={() => { playSound('click'); setPresenceEnabled(!presenceEnabled); }}
              className={`w-14 h-8 rounded-full transition-colors relative ${presenceEnabled ? 'bg-primary' : 'bg-secondary'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${presenceEnabled ? 'left-1' : 'right-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent space-y-3 z-30 max-w-md mx-auto">
        <button onClick={handleCreate} disabled={!name.trim() || loading}
          className="w-full btn-primary-game text-xl disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? '⏳ جاري الإنشاء...' : '🏠 إنشاء الغرفة'}
        </button>
        <button onClick={() => { playSound('click'); setScreen('guessingJoinRoom'); }}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-accent/20 border-2 border-accent/50 text-foreground hover:border-accent active:scale-95 transition-all shadow-[0_0_15px_hsl(var(--accent)/0.3)]">
          🔗 انضمام لغرفة
        </button>
      </div>
    </div>
  );
};

export default GuessingCreateRoomScreen;
