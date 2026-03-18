import React from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ArrowLeft, Volume2, VolumeX, Moon, Sun, Vibrate, Globe } from 'lucide-react';

const SettingsScreen: React.FC = () => {
  const { setScreen } = useGame();
  const { 
    soundEnabled, 
    vibrationEnabled, 
    darkMode, 
    setSoundEnabled, 
    setVibrationEnabled, 
    setDarkMode,
    playSound,
    vibrate 
  } = useSettings();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      setTimeout(() => playSound('click'), 100);
    }
  };

  const handleVibrationToggle = () => {
    setVibrationEnabled(!vibrationEnabled);
    if (!vibrationEnabled) {
      setTimeout(() => vibrate(100), 100);
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    playSound('click');
    vibrate(50);
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
    playSound('click');
    vibrate(50);
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-40 h-40 bg-imposter/10 rounded-full blur-3xl" />
      
      {/* Header - Sticky */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              playSound('click');
              vibrate(30);
              setScreen('hub');
            }}
            className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <BackArrow size={24} />
          </button>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        </div>
      </div>
      
      {/* Settings Options */}
      <div className="relative z-10 flex-1 space-y-4">
        {/* Language Toggle */}
        <div className="card-game p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={24} className="text-primary" />
            <div>
              <p className="font-medium">{t('settings.language')}</p>
              <p className="text-sm text-muted-foreground">{t('settings.languageDesc')}</p>
            </div>
          </div>
          <button
            onClick={handleLanguageToggle}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
          >
            {language === 'ar' ? 'English' : 'عربي'}
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="card-game p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 size={24} className="text-primary" /> : <VolumeX size={24} className="text-muted-foreground" />}
            <div>
              <p className="font-medium">{t('settings.soundEffects')}</p>
              <p className="text-sm text-muted-foreground">{t('settings.soundDesc')}</p>
            </div>
          </div>
          <button
            onClick={handleSoundToggle}
            className={`w-14 h-8 rounded-full transition-colors relative ${
              soundEnabled ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <div 
              className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                soundEnabled ? (isRTL ? 'left-1' : 'right-1') : (isRTL ? 'right-1' : 'left-1')
              }`}
            />
          </button>
        </div>

        {/* Vibration Toggle */}
        <div className="card-game p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vibrate size={24} className={vibrationEnabled ? 'text-primary' : 'text-muted-foreground'} />
            <div>
              <p className="font-medium">{t('settings.vibration')}</p>
              <p className="text-sm text-muted-foreground">{t('settings.vibrationDesc')}</p>
            </div>
          </div>
          <button
            onClick={handleVibrationToggle}
            className={`w-14 h-8 rounded-full transition-colors relative ${
              vibrationEnabled ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <div 
              className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                vibrationEnabled ? (isRTL ? 'left-1' : 'right-1') : (isRTL ? 'right-1' : 'left-1')
              }`}
            />
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="card-game p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={24} className="text-primary" /> : <Sun size={24} className="text-primary" />}
            <div>
              <p className="font-medium">{t('settings.darkMode')}</p>
              <p className="text-sm text-muted-foreground">{t('settings.darkModeDesc')}</p>
            </div>
          </div>
          <button
            onClick={handleDarkModeToggle}
            className={`w-14 h-8 rounded-full transition-colors relative ${
              darkMode ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <div 
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                darkMode ? (isRTL ? 'left-1' : 'right-1') : (isRTL ? 'right-1' : 'left-1')
              }`}
            />
          </button>
        </div>

        {/* App Info */}
        <div className="card-game p-4 mt-8">
          <div className="text-center">
            <span className="text-4xl mb-2 block">😈</span>
            <h2 className="text-xl font-bold text-gradient">IMPOSTER</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('settings.version')} 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
