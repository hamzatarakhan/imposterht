import React from 'react';
import { useGame } from '@/context/GameContext';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { Smartphone, Wifi, ArrowRight, ArrowLeft, Users, Globe } from 'lucide-react';

const ModeSelectScreen: React.FC = () => {
  const { setScreen: setGameScreen } = useGame();
  const { setScreen: setOnlineScreen } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  const { t, isRTL } = useLanguage();

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const handleLocalPlay = () => { playSound('click'); vibrate(50); setGameScreen('setup'); };
  const handleOnlinePlay = () => { playSound('click'); vibrate(50); setOnlineScreen('createRoom'); };
  const handleBack = () => { playSound('click'); vibrate(30); setGameScreen('home'); };

  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-1/4 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-4">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors">
              <BackArrow size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{t('modeSelect.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('modeSelect.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-6">
          <button onClick={handleLocalPlay} className="card-game p-6 hover:border-primary/50 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Smartphone className="text-primary" size={32} />
              </div>
              <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1`}>
                <h2 className="text-xl font-bold mb-1">{t('modeSelect.localPlay')}</h2>
                <p className="text-muted-foreground text-sm">{t('modeSelect.localDesc')}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={16} />
              <span>{t('modeSelect.localPlayers')}</span>
            </div>
          </button>

          <button onClick={handleOnlinePlay} className="card-game p-6 hover:border-accent/50 transition-all group relative overflow-hidden">
            <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full`}>
              {t('modeSelect.newBadge')}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <Wifi className="text-accent" size={32} />
              </div>
              <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1`}>
                <h2 className="text-xl font-bold mb-1">{t('modeSelect.onlinePlay')}</h2>
                <p className="text-muted-foreground text-sm">{t('modeSelect.onlineDesc')}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Globe size={16} />
              <span>{t('modeSelect.onlinePlayers')}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectScreen;
