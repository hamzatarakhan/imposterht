import React from 'react';
import { useCountries } from '@/context/CountriesGameContext';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Plus, LogIn } from 'lucide-react';

const CountriesModeSelect: React.FC = () => {
  const { setScreen } = useCountries();
  const { setScreen: setGameScreen } = useGame();
  const { playSound, vibrate } = useSettings();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        <button
          onClick={() => { playSound('click'); vibrate(30); setGameScreen('hub'); }}
          className="mb-8 p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight size={24} />
        </button>

        <div className="text-center mb-10">
          <span className="text-6xl mb-3 block">🌍</span>
          <h1 className="text-3xl font-black text-foreground mb-2">لعبة الدول</h1>
          <p className="text-muted-foreground text-sm">ابنوا اسم دولة حرف بحرف!</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => { playSound('click'); vibrate(50); setScreen('countriesCreateRoom'); }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-foreground font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={24} />
            إنشاء غرفة (Admin)
          </button>

          <button
            onClick={() => { playSound('click'); vibrate(50); setScreen('countriesJoinRoom'); }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-foreground font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <LogIn size={24} />
            انضمام كمتابع
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          الـ Admin يتحكم باللعبة والباقين يتابعوا لحظياً 📱
        </p>
      </div>
    </div>
  );
};

export default CountriesModeSelect;
