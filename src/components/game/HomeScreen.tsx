import React from 'react';
import { useGame } from '@/context/GameContext';
import { Play, HelpCircle, Settings } from 'lucide-react';

const HomeScreen: React.FC = () => {
  const { setScreen } = useGame();

  return (
    <div className="min-h-screen flex flex-col p-6 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-40 h-40 bg-imposter/10 rounded-full blur-3xl" />
      
      
      {/* Settings Icon */}
      <div className="relative z-10 flex justify-start">
        <button className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <Settings size={24} />
        </button>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Logo with Icon */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4 animate-float">
            <span className="text-7xl drop-shadow-2xl">😈</span>
          </div>
          <h1 className="text-5xl font-black text-gradient mb-2">IMPOSTER</h1>
          <p className="text-muted-foreground">لعبة الإمبوستر الجماعية</p>
        </div>
        
        {/* Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => setScreen('setup')}
            className="w-full btn-primary-game flex items-center justify-center gap-3 text-xl"
          >
            <Play size={28} fill="currentColor" />
            ابدأ لعبة جديدة
          </button>
          
          <button
            onClick={() => setScreen('howToPlay')}
            className="w-full btn-secondary-game flex items-center justify-center gap-3"
          >
            <HelpCircle size={24} />
            طريقة اللعب
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 text-center py-4">
        <p className="text-sm text-muted-foreground">
          العبوا مع بعض في نفس المكان 🎮
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;
