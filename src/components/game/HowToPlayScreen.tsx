import React from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ArrowLeft, Users, Eye, MessageCircle, Vote, Trophy } from 'lucide-react';

const HowToPlayScreen: React.FC = () => {
  const { setScreen } = useGame();
  const { playSound, vibrate } = useSettings();
  const { t, isRTL } = useLanguage();

  const icons = [Users, Eye, MessageCircle, Vote, Trophy];
  const steps = (t('howToPlay.steps') as unknown as { title: string; description: string }[]);
  const tips = (t('howToPlay.tips') as unknown as string[]);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const handleBack = () => { playSound('click'); vibrate(30); setScreen('hub'); };
  const handleStartGame = () => { playSound('click'); vibrate(50); setScreen('setup'); };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30" />
      
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors">
            <BackArrow size={24} />
          </button>
          <h1 className="text-2xl font-bold">{t('howToPlay.title')}</h1>
        </div>
      </div>
      
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-28">
        <div className="space-y-4">
          {Array.isArray(steps) && steps.map((step, index) => {
            const Icon = icons[index];
            return (
              <div key={index} className="card-game flex items-start gap-4 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
                <span className={`text-3xl font-black text-primary/30 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                  {index + 1}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 card-game bg-primary/10 border-primary/30">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>💡</span> {t('howToPlay.tipsTitle')}
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            {Array.isArray(tips) && tips.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button onClick={handleStartGame} className="w-full btn-primary-game">
          {t('howToPlay.letsPlay')}
        </button>
      </div>
    </div>
  );
};

export default HowToPlayScreen;
