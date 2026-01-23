import React from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { Smartphone } from 'lucide-react';
import RestartButton from './RestartButton';

const PassPhoneScreen: React.FC = () => {
  const { currentPlayerIndex, players, setScreen } = useGame();
  const { playSound, vibrate } = useSettings();
  
  const currentPlayer = players[currentPlayerIndex];

  const handleShowRole = () => {
    playSound('click');
    vibrate(50);
    setScreen('showRole');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center max-w-sm">
        {/* Player Avatar */}
        <div className="mb-8 animate-float">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center glow-primary">
            <span className="text-5xl">{currentPlayer?.avatar || '👤'}</span>
          </div>
        </div>
        
        {/* Text */}
        <h1 className="text-3xl font-black mb-4">
          مرّر الهاتف إلى
        </h1>
        
        <div className="card-game mb-8 inline-block">
          <span className="text-4xl font-black text-gradient">
            {currentPlayer?.name || `لاعب ${currentPlayerIndex + 1}`}
          </span>
        </div>
        
        <p className="text-muted-foreground mb-8">
          تأكد إن محد غيرك يشوف الشاشة 🤫
        </p>
        
        {/* Button */}
        <div className="space-y-3">
          <button
            onClick={handleShowRole}
            className="w-full btn-primary-game text-xl"
          >
            👁️ عرض دوري
          </button>
          <div className="flex justify-center">
            <RestartButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassPhoneScreen;