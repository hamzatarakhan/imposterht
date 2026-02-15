import React from 'react';
import { useGame } from '@/context/GameContext';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import { Smartphone, Wifi, ArrowRight, Globe } from 'lucide-react';

const GuessingModeSelectScreen: React.FC = () => {
  const { setScreen: setMainScreen } = useGame();
  const { setScreen } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();

  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => { playSound('click'); vibrate(30); setMainScreen('hub'); }}
              className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors">
              <ArrowRight size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">🤔 لعبة التخمين</h1>
              <p className="text-sm text-muted-foreground">اختر نوع اللعب</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-6">
          <button onClick={() => { playSound('click'); vibrate(50); setMainScreen('guessingSetup'); }}
            className="card-game p-6 hover:border-primary/50 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Smartphone className="text-primary" size={32} />
              </div>
              <div className="text-right flex-1">
                <h2 className="text-xl font-bold mb-1">📱 لعب محلي</h2>
                <p className="text-muted-foreground text-sm">جهاز واحد - مرّر الجوال</p>
              </div>
            </div>
          </button>

          <button onClick={() => { playSound('click'); vibrate(50); setScreen('guessingCreateRoom'); }}
            className="card-game p-6 hover:border-accent/50 transition-all group relative overflow-hidden">
            <div className="absolute top-3 left-3 px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">
              جديد! 🔥
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Wifi className="text-accent" size={32} />
              </div>
              <div className="text-right flex-1">
                <h2 className="text-xl font-bold mb-1">🌐 لعب أونلاين</h2>
                <p className="text-muted-foreground text-sm">كل واحد على جهازه</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Globe size={16} /><span>شارك الكود مع خصمك</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingModeSelectScreen;
