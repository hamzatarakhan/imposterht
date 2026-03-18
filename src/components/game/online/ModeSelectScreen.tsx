import React from 'react';
import { useGame } from '@/context/GameContext';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { Smartphone, Wifi, ArrowRight, Users, Globe } from 'lucide-react';

const ModeSelectScreen: React.FC = () => {
  const { setScreen: setGameScreen } = useGame();
  const { setScreen: setOnlineScreen } = useOnlineGame();
  const { playSound, vibrate } = useSettings();

  const handleLocalPlay = () => {
    playSound('click');
    vibrate(50);
    setGameScreen('setup');
  };

  const handleOnlinePlay = () => {
    playSound('click');
    vibrate(50);
    setOnlineScreen('createRoom');
  };

  const handleBack = () => {
    playSound('click');
    vibrate(30);
    setGameScreen('home');
  };

  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-1/4 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <ArrowRight size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">اختر نوع اللعب 🎮</h1>
              <p className="text-sm text-muted-foreground">محلي أو أونلاين</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex-1 flex flex-col justify-center gap-6">
          {/* Local Play */}
          <button
            onClick={handleLocalPlay}
            className="card-game p-6 hover:border-primary/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Smartphone className="text-primary" size={32} />
              </div>
              <div className="text-right flex-1">
                <h2 className="text-xl font-bold mb-1">📱 لعب محلي</h2>
                <p className="text-muted-foreground text-sm">
                  جهاز واحد - مرّر الجوال بين اللاعبين
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={16} />
              <span>3-10 لاعبين على نفس الجهاز</span>
            </div>
          </button>

          {/* Online Play */}
          <button
            onClick={handleOnlinePlay}
            className="card-game p-6 hover:border-accent/50 transition-all group relative overflow-hidden"
          >
            {/* New Badge */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">
              جديد! 🔥
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <Wifi className="text-accent" size={32} />
              </div>
              <div className="text-right flex-1">
                <h2 className="text-xl font-bold mb-1">🌐 لعب أونلاين</h2>
                <p className="text-muted-foreground text-sm">
                  كل واحد على جهازه - بكود الغرفة
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Globe size={16} />
              <span>العب مع أصدقائك من أي مكان</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectScreen;
