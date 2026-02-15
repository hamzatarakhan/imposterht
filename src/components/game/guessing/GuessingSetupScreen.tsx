import React, { useState } from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { AVATAR_OPTIONS } from '@/context/GameContext';
import { useSavedPlayers } from '@/hooks/useSavedPlayers';
import { ArrowRight, Users, Clock, Hash, Shuffle } from 'lucide-react';
import { Category, CATEGORIES } from '@/data/words';

const GuessingSetupScreen: React.FC = () => {
  const { playerCount, setPlayerCount, categories, toggleCategory, roundTime, setRoundTime, totalRounds, setTotalRounds, startGame } = useGuessingGame();
  const { setScreen: setMainScreen } = useGame();
  const { playSound, vibrate } = useSettings();
  const { savedPlayers } = useSavedPlayers();

  const [playerData, setPlayerData] = useState<{ name: string; avatar: string }[]>(
    Array.from({ length: playerCount }, (_, i) => ({
      name: savedPlayers[i]?.name || '',
      avatar: savedPlayers[i]?.avatar || '👤',
    }))
  );

  React.useEffect(() => {
    setPlayerData(prev => {
      const newData = Array.from({ length: playerCount }, (_, i) => prev[i] || {
        name: savedPlayers[i]?.name || '',
        avatar: savedPlayers[i]?.avatar || '👤',
      });
      return newData;
    });
  }, [playerCount, savedPlayers]);

  const updatePlayerName = (index: number, name: string) => {
    setPlayerData(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name: name.slice(0, 20) };
      return copy;
    });
  };

  const updatePlayerAvatar = (index: number) => {
    setPlayerData(prev => {
      const copy = [...prev];
      const currentIdx = AVATAR_OPTIONS.indexOf(copy[index].avatar);
      copy[index] = { ...copy[index], avatar: AVATAR_OPTIONS[(currentIdx + 1) % AVATAR_OPTIONS.length] };
      return copy;
    });
  };

  const allNamed = playerData.slice(0, playerCount).every(p => p.name.trim());

  const handleStart = () => {
    if (!allNamed) return;
    playSound('click');
    vibrate(50);
    startGame(playerData.slice(0, playerCount));
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
        <button
          onClick={() => { playSound('click'); vibrate(30); setMainScreen('hub'); }}
          className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black">🤔 لعبة التخمين</h1>
          <p className="text-xs text-muted-foreground">اضبط الإعدادات وادخل الأسماء</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-6">
        {/* Player Count */}
        <div className="card-game">
          <div className="flex items-center gap-2 mb-3">
            <Users size={20} className="text-primary" />
            <h2 className="font-bold">عدد اللاعبين</h2>
            <span className="mr-auto text-2xl font-black text-primary">{playerCount}</span>
          </div>
          <input type="range" min={2} max={10} value={playerCount}
            onChange={(e) => { playSound('click'); setPlayerCount(Number(e.target.value)); }}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>2</span><span>10</span>
          </div>
        </div>

        {/* Round Time */}
        <div className="card-game">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={20} className="text-primary" />
            <h2 className="font-bold">وقت الجولة</h2>
            <span className="mr-auto text-2xl font-black text-primary">{roundTime}ث</span>
          </div>
          <input type="range" min={15} max={120} step={15} value={roundTime}
            onChange={(e) => setRoundTime(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>15ث</span><span>120ث</span>
          </div>
        </div>

        {/* Total Rounds */}
        <div className="card-game">
          <div className="flex items-center gap-2 mb-3">
            <Hash size={20} className="text-primary" />
            <h2 className="font-bold">عدد الجولات</h2>
            <span className="mr-auto text-2xl font-black text-primary">{totalRounds}</span>
          </div>
          <input type="range" min={3} max={20} value={totalRounds}
            onChange={(e) => setTotalRounds(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>3</span><span>20</span>
          </div>
        </div>

        {/* Categories */}
        <div className="card-game">
          <div className="flex items-center gap-2 mb-3">
            <Shuffle size={20} className="text-primary" />
            <h2 className="font-bold">الفئات</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
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

        {/* Player Names */}
        <div className="card-game">
          <h2 className="font-bold mb-3">👥 أسماء اللاعبين</h2>
          <div className="space-y-3">
            {Array.from({ length: playerCount }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <button onClick={() => { playSound('click'); updatePlayerAvatar(i); }}
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl hover:scale-110 transition-transform flex-shrink-0">
                  {playerData[i]?.avatar || '👤'}
                </button>
                <input
                  type="text"
                  value={playerData[i]?.name || ''}
                  onChange={(e) => updatePlayerName(i, e.target.value)}
                  placeholder={`لاعب ${i + 1}`}
                  maxLength={20}
                  className="flex-1 text-sm font-bold py-2.5 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="sticky bottom-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={handleStart}
          disabled={!allNamed}
          className="w-full btn-primary-game text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎯 ابدأ اللعب!
        </button>
      </div>
    </div>
  );
};

export default GuessingSetupScreen;
