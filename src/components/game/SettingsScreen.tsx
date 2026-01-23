import React from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Volume2, VolumeX, Moon, Sun, Vibrate } from 'lucide-react';

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

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      // Play a test sound when enabling
      setTimeout(() => playSound('click'), 100);
    }
  };

  const handleVibrationToggle = () => {
    setVibrationEnabled(!vibrationEnabled);
    if (!vibrationEnabled) {
      // Test vibration when enabling
      setTimeout(() => vibrate(100), 100);
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    playSound('click');
    vibrate(50);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-40 h-40 bg-imposter/10 rounded-full blur-3xl" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 mb-8">
        <button 
          onClick={() => {
            playSound('click');
            vibrate(30);
            setScreen('home');
          }}
          className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight size={24} />
        </button>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
      </div>
      
      {/* Settings Options */}
      <div className="relative z-10 flex-1 space-y-4">
        {/* Sound Toggle */}
        <div className="card-game p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 size={24} className="text-primary" /> : <VolumeX size={24} className="text-muted-foreground" />}
            <div>
              <p className="font-medium">المؤثرات الصوتية</p>
              <p className="text-sm text-muted-foreground">تفعيل أصوات اللعبة</p>
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
                soundEnabled ? 'left-1' : 'right-1'
              }`}
            />
          </button>
        </div>

        {/* Vibration Toggle */}
        <div className="card-game p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vibrate size={24} className={vibrationEnabled ? 'text-primary' : 'text-muted-foreground'} />
            <div>
              <p className="font-medium">الاهتزاز</p>
              <p className="text-sm text-muted-foreground">اهتزاز عند الأحداث المهمة</p>
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
                vibrationEnabled ? 'left-1' : 'right-1'
              }`}
            />
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="card-game p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={24} className="text-primary" /> : <Sun size={24} className="text-muted-foreground" />}
            <div>
              <p className="font-medium">الوضع الداكن</p>
              <p className="text-sm text-muted-foreground">تغيير مظهر التطبيق</p>
            </div>
          </div>
          <button
            onClick={handleDarkModeToggle}
            className={`w-14 h-8 rounded-full transition-colors relative ${
              darkMode ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <div 
              className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                darkMode ? 'left-1' : 'right-1'
              }`}
            />
          </button>
        </div>

        {/* App Info */}
        <div className="card-game p-4 mt-8">
          <div className="text-center">
            <span className="text-4xl mb-2 block">😈</span>
            <h2 className="text-xl font-bold text-gradient">IMPOSTER</h2>
            <p className="text-sm text-muted-foreground mt-1">الإصدار 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
