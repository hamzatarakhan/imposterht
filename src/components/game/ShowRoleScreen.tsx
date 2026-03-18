import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { EyeOff } from 'lucide-react';
import RestartButton from './RestartButton';

const ShowRoleScreen: React.FC = () => {
  const { players, currentPlayerIndex, secretWord, markPlayerAsSeen, nextPlayer } = useGame();
  const { playSound, vibrate } = useSettings();
  const { t } = useLanguage();
  const [revealed, setRevealed] = useState(false);
  
  const currentPlayer = players[currentPlayerIndex];
  const isImposter = currentPlayer?.isImposter;

  const handleReveal = () => {
    playSound('reveal');
    vibrate(isImposter ? [100, 50, 100, 50, 100] : 100);
    setRevealed(true);
    markPlayerAsSeen();
  };

  const handleNext = () => {
    playSound('click');
    vibrate(50);
    setRevealed(false);
    nextPlayer();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className={`absolute inset-0 transition-colors duration-500 ${
        revealed && isImposter 
          ? 'bg-gradient-to-br from-red-950 via-background to-background' 
          : 'bg-gradient-to-br from-background via-card/50 to-background'
      }`} />
      
      {revealed && isImposter && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-imposter/20 rounded-full blur-3xl animate-pulse" />
      )}
      {revealed && !isImposter && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      )}
      
      <div className="relative z-10 text-center max-w-sm w-full">
        {!revealed ? (
          <div className="animate-slide-up">
            <div className="w-32 h-32 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6">
              <span className="text-6xl">{currentPlayer?.avatar || '🎭'}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{currentPlayer?.name}</h2>
            <p className="text-muted-foreground mb-6">{t('showRole.pressToReveal')}</p>
            <button onClick={handleReveal} className="w-full btn-secondary-game text-xl border-2 border-primary/50">
              {t('showRole.revealRole')}
            </button>
          </div>
        ) : (
          <div className="animate-reveal">
            {isImposter ? (
              <>
                <div className="w-32 h-32 mx-auto rounded-full bg-imposter/20 flex items-center justify-center mb-6 glow-imposter animate-pulse-glow">
                  <span className="text-7xl">😈</span>
                </div>
                <h1 className="text-4xl font-black text-gradient-imposter mb-4">
                  {t('showRole.youAreImposter')}
                </h1>
                <div className="card-game bg-imposter/10 border-imposter/30 mb-8">
                  <p className="text-lg">{t('showRole.tryToBlend')}</p>
                  <p className="text-sm text-muted-foreground mt-2">{t('showRole.watchClues')}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-32 h-32 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-6 glow-accent">
                  <span className="text-7xl">✨</span>
                </div>
                <h2 className="text-2xl font-bold text-accent mb-2">{t('showRole.yourWord')}</h2>
                <div className="card-game bg-accent/10 border-accent/30 mb-4">
                  <span className="text-5xl font-black text-gradient block py-4">{secretWord}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-8">{t('showRole.describeSmartly')}</p>
              </>
            )}
            
            <div className="space-y-3">
              <button
                onClick={handleNext}
                className={`w-full text-xl flex items-center justify-center gap-3 ${
                  isImposter ? 'btn-imposter' : 'btn-accent-game'
                }`}
              >
                <EyeOff size={24} />
                {t('showRole.hideAndPass')}
              </button>
              <div className="flex justify-center">
                <RestartButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowRoleScreen;
