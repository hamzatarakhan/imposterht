import React from 'react';
import { useGame } from '@/context/GameContext';
import { Smartphone } from 'lucide-react';

const PassPhoneScreen: React.FC = () => {
  const { currentPlayerIndex, setScreen } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center max-w-sm">
        {/* Icon */}
        <div className="mb-8 animate-float">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-secondary flex items-center justify-center">
            <Smartphone className="text-primary" size={48} />
          </div>
        </div>
        
        {/* Text */}
        <h1 className="text-3xl font-black mb-4">
          مرّر الهاتف إلى
        </h1>
        
        <div className="card-game mb-8 inline-block">
          <span className="text-4xl font-black text-gradient">
            لاعب {currentPlayerIndex + 1}
          </span>
        </div>
        
        <p className="text-muted-foreground mb-8">
          تأكد إن محد غيرك يشوف الشاشة 🤫
        </p>
        
        {/* Button */}
        <button
          onClick={() => setScreen('showRole')}
          className="w-full btn-primary-game text-xl"
        >
          👁️ عرض دوري
        </button>
      </div>
    </div>
  );
};

export default PassPhoneScreen;
