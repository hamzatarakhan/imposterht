import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';

const SplashScreen: React.FC = () => {
  const { setScreen } = useGame();

  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen('home');
    }, 3000);
    return () => clearTimeout(timer);
  }, [setScreen]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-imposter/20 rounded-full blur-3xl animate-pulse" />
      
      <div className="relative z-10 text-center">
        {/* Logo/Title */}
        <div className="animate-float mb-8">
          <span className="text-8xl mb-4 block">😈</span>
        </div>
        
        <h1 className="text-6xl font-black mb-4 text-gradient tracking-tight animate-reveal">
          IMPOSTER
        </h1>
        
        <p className="text-xl text-muted-foreground font-medium mb-8 animate-slide-up">
          لعبة الإمبوستر
        </p>
        
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-lg text-foreground/80 max-w-xs mx-auto leading-relaxed">
            هل تستطيع كشف الإمبوستر قبل فوات الأوان؟ 🔍
          </p>
        </div>
        
        {/* Loading indicator */}
        <div className="mt-12 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
