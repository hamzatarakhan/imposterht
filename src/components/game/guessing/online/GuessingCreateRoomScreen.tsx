import React, { useState } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import { AVATAR_OPTIONS } from '@/context/GameContext';
import { GUESSING_CATEGORIES, GuessingCategory } from '@/data/guessingWords';
import { ArrowRight, Shuffle } from 'lucide-react';

const GuessingCreateRoomScreen: React.FC = () => {
  const { createRoom, setScreen } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [categories, setCategories] = useState<GuessingCategory[]>(['random']);
  const [totalRounds, setTotalRounds] = useState(5);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (cat: GuessingCategory) => {
    if (cat === 'random') { setCategories(['random']); return; }
    if (categories.includes('random')) { setCategories([cat]); return; }
    if (categories.includes(cat)) {
      if (categories.length === 1) return;
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    playSound('click'); vibrate(50);
    const success = await createRoom(name.trim(), avatar, { categories, totalRounds });
    if (!success) setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
        <button onClick={() => { playSound('click'); setScreen('guessingModeSelect'); }}
          className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black">🏠 إنشاء غرفة تخمين</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-5">
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
          <div className="flex items-center gap-2 mb-3">
            <Shuffle size={20} className="text-primary" />
            <h2 className="font-bold">الفئات</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {GUESSING_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { playSound('click'); toggleCategory(cat.id); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${categories.includes(cat.id) ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-muted-foreground'}`}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <button onClick={handleCreate} disabled={!name.trim() || loading}
          className="w-full btn-primary-game text-xl disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? '⏳ جاري الإنشاء...' : '🏠 إنشاء الغرفة'}
        </button>
      </div>
    </div>
  );
};

export default GuessingCreateRoomScreen;
