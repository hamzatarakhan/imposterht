import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';

const GAME_ICONS = ['😈', '🤔', '🎭', '🃏', '🎲'];

const SplashScreen: React.FC = () => {
  const { setScreen } = useGame();
  const { playSound, unlockAudio, vibrate } = useSettings();
  const { t } = useLanguage();
  const hasPlayedSound = useRef(false);
  const [activeIcon, setActiveIcon] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIcon((prev) => (prev + 1) % GAME_ICONS.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setScreen('hub'), 3000);
    return () => clearTimeout(timer);
  }, [setScreen]);

  const handleTap = () => {
    unlockAudio();
    if (!hasPlayedSound.current) {
      hasPlayedSound.current = true;
      playSound('intro');
      vibrate([50, 30, 50]);
    }
    setTimeout(() => setScreen('hub'), 300);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative cursor-pointer overflow-hidden"
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex items-center justify-center gap-4">
          {GAME_ICONS.map((icon, i) => (
            <span
              key={i}
              className="text-3xl transition-all duration-300"
              style={{
                opacity: activeIcon === i ? 1 : 0.2,
                transform: activeIcon === i ? 'scale(1.5)' : 'scale(1)',
                filter: activeIcon === i ? 'drop-shadow(0 0 12px hsl(var(--primary) / 0.6))' : 'none',
              }}
            >
              {icon}
            </span>
          ))}
        </div>

        <div className="text-center animate-reveal">
          <h1 className="text-7xl font-black text-gradient tracking-tight leading-none mb-3">
            {t('splash.title')}
          </h1>
          <p className="text-base text-muted-foreground font-medium tracking-wide">
            {t('splash.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 w-48">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-xs">🎮</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground animate-pulse">
          {t('splash.tapToContinue')}
        </p>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground/50">
          {t('splash.by')} <span className="text-primary/70 font-semibold">Hamza Tarkhan</span>
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
