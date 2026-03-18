import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { RotateCcw, X } from 'lucide-react';

const RestartButton: React.FC = () => {
  const { resetGame } = useGame();
  const { playSound, vibrate } = useSettings();
  const { t } = useLanguage();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!showConfirm) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevTouchAction = body.style.touchAction;
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    return () => { body.style.overflow = prevOverflow; body.style.touchAction = prevTouchAction; };
  }, [showConfirm]);

  return (
    <>
      <button
        onClick={() => { playSound('click'); vibrate(30); setShowConfirm(true); }}
        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/60 text-sm text-muted-foreground hover:bg-secondary/80 transition-all"
      >
        <RotateCcw size={16} />
        {t('restart.restartGame')}
      </button>

      {showConfirm && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 animate-fade-in"
          role="dialog" aria-modal="true" aria-label={t('restart.restartConfirm')}
          onClick={() => { playSound('click'); setShowConfirm(false); }}
        >
          <div className="card-game w-[min(24rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-auto text-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <RotateCcw size={32} className="text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('restart.restartConfirm')}</h2>
            <p className="text-muted-foreground mb-6">{t('restart.restartMessage')}</p>
            <div className="flex gap-3">
              <button onClick={() => { playSound('click'); setShowConfirm(false); }}
                className="flex-1 btn-secondary-game flex items-center justify-center gap-2">
                <X size={20} /> {t('restart.cancel')}
              </button>
              <button onClick={() => { playSound('click'); vibrate(100); setShowConfirm(false); resetGame(); }}
                className="flex-1 btn-imposter flex items-center justify-center gap-2">
                <RotateCcw size={20} /> {t('restart.restart')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default RestartButton;
