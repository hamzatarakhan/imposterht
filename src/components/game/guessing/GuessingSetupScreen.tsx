import React, { useState } from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useGame, AVATAR_OPTIONS } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { useSavedPlayers } from '@/hooks/useSavedPlayers';
import { ArrowRight, Shuffle, Swords, Timer } from 'lucide-react';
import { GUESSING_CATEGORIES } from '@/data/guessingWords';

const GuessingSetupScreen: React.FC = () => {
  const { categories, toggleCategory, totalRounds, setTotalRounds, turnTime, setTurnTime, startGame } = useGuessingGame();
  const { setScreen: setMainScreen } = useGame();
  const { playSound, vibrate } = useSettings();
  const { savedPlayers } = useSavedPlayers();

  const [p1, setP1] = useState({ name: savedPlayers[0]?.name || '', avatar: savedPlayers[0]?.avatar || '👤' });
  const [p2, setP2] = useState({ name: savedPlayers[1]?.name || '', avatar: savedPlayers[1]?.avatar || '👤' });

  const canStart = p1.name.trim() && p2.name.trim();

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
        <button
          onClick={() => { playSound('click'); vibrate(30); setMainScreen('guessingModeSelect'); }}
          className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black">🤔 لعبة التخمين</h1>
          <p className="text-xs text-muted-foreground">مواجهة 1 ضد 1</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-5">
        {/* Players */}
        <div className="card-game">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Swords size={20} className="text-primary" /> اللاعبين
          </h2>

          {/* Player 1 */}
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => {
              playSound('click');
              const idx = AVATAR_OPTIONS.indexOf(p1.avatar);
              setP1(prev => ({ ...prev, avatar: AVATAR_OPTIONS[(idx + 1) % AVATAR_OPTIONS.length] }));
            }}
              className="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center text-2xl hover:scale-110 transition-transform flex-shrink-0">
              {p1.avatar}
            </button>
            <input
              type="text" value={p1.name} onChange={(e) => setP1(prev => ({ ...prev, name: e.target.value.slice(0, 20) }))}
              placeholder="اللاعب الأول" maxLength={20}
              className="flex-1 text-sm font-bold py-2.5 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="text-center text-2xl font-black text-primary my-2">⚔️</div>

          {/* Player 2 */}
          <div className="flex items-center gap-3">
            <button onClick={() => {
              playSound('click');
              const idx = AVATAR_OPTIONS.indexOf(p2.avatar);
              setP2(prev => ({ ...prev, avatar: AVATAR_OPTIONS[(idx + 1) % AVATAR_OPTIONS.length] }));
            }}
              className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center text-2xl hover:scale-110 transition-transform flex-shrink-0">
              {p2.avatar}
            </button>
            <input
              type="text" value={p2.name} onChange={(e) => setP2(prev => ({ ...prev, name: e.target.value.slice(0, 20) }))}
              placeholder="اللاعب الثاني" maxLength={20}
              className="flex-1 text-sm font-bold py-2.5 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-red-500 focus:outline-none transition-all placeholder:text-muted-foreground/50"
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
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  totalRounds === n ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-muted-foreground'
                }`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Turn Timer */}
        <div className="card-game">
          <div className="flex items-center gap-2 mb-3">
            <Timer size={20} className="text-primary" />
            <h2 className="font-bold">وقت الدور</h2>
            <span className="mr-auto text-2xl font-black text-primary">{turnTime}ث</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">الوقت المسموح لكل لاعب عشان يسأل سؤاله</p>
          <div className="flex gap-2">
            {[15, 30, 45, 60].map(t => (
              <button key={t} onClick={() => { playSound('click'); setTurnTime(t); }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  turnTime === t ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-muted-foreground'
                }`}>
                {t}ث
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
            {GUESSING_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { playSound('click'); toggleCategory(cat.id); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  categories.includes(cat.id)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="sticky bottom-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={() => { playSound('click'); vibrate(50); startGame(p1, p2); }}
          disabled={!canStart}
          className="w-full btn-primary-game text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⚔️ ابدأ المواجهة!
        </button>
      </div>
    </div>
  );
};

export default GuessingSetupScreen;
