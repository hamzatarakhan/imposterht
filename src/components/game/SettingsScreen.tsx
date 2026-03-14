import React from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Volume2, VolumeX, Moon, Sun, Vibrate, Mic, Eye } from 'lucide-react';

const SettingsScreen: React.FC = () => {
  const { setScreen } = useGame();
  const { 
    soundEnabled, 
    vibrationEnabled, 
    darkMode,
    voiceChatEnabled,
    presenceTrackingEnabled,
    setSoundEnabled, 
    setVibrationEnabled, 
    setDarkMode,
    setVoiceChatEnabled,
    setPresenceTrackingEnabled,
    playSound,
    vibrate 
  } = useSettings();

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

  const toggleItems = [
    {
      icon: soundEnabled ? <Volume2 size={24} className="text-primary" /> : <VolumeX size={24} className="text-muted-foreground" />,
      title: 'المؤثرات الصوتية',
      desc: 'تفعيل أصوات اللعبة',
      enabled: soundEnabled,
      onToggle: handleSoundToggle,
    },
    {
      icon: <Vibrate size={24} className={vibrationEnabled ? 'text-primary' : 'text-muted-foreground'} />,
      title: 'الاهتزاز',
      desc: 'اهتزاز عند الأحداث المهمة',
      enabled: vibrationEnabled,
      onToggle: handleVibrationToggle,
    },
    {
      icon: darkMode ? <Moon size={24} className="text-primary" /> : <Sun size={24} className="text-primary" />,
      title: 'الوضع الداكن',
      desc: 'تغيير مظهر التطبيق',
      enabled: darkMode,
      onToggle: handleDarkModeToggle,
    },
    {
      icon: <Mic size={24} className={voiceChatEnabled ? 'text-primary' : 'text-muted-foreground'} />,
      title: 'المحادثة الصوتية',
      desc: 'تفعيل المايك في اللعب أونلاين',
      enabled: voiceChatEnabled,
      onToggle: () => { playSound('click'); vibrate(50); setVoiceChatEnabled(!voiceChatEnabled); },
    },
    {
      icon: <Eye size={24} className={presenceTrackingEnabled ? 'text-primary' : 'text-muted-foreground'} />,
      title: 'تتبع الخصم',
      desc: 'تنبيه لما لاعب يطلع من التطبيق',
      enabled: presenceTrackingEnabled,
      onToggle: () => { playSound('click'); vibrate(50); setPresenceTrackingEnabled(!presenceTrackingEnabled); },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-40 h-40 bg-imposter/10 rounded-full blur-3xl" />
      
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { playSound('click'); vibrate(30); setScreen('hub'); }}
            className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight size={24} />
          </button>
          <h1 className="text-2xl font-bold">الإعدادات</h1>
        </div>
      </div>
      
      <div className="relative z-10 flex-1 space-y-4">
        {toggleItems.map((item, i) => (
          <div key={i} className="card-game p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {item.icon}
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
            <button
              onClick={item.onToggle}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                item.enabled ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <div 
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                  item.enabled ? 'left-1' : 'right-1'
                }`}
              />
            </button>
          </div>
        ))}

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
