import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { RotateCcw, X } from 'lucide-react';

const RestartButton: React.FC = () => {
  const { resetGame } = useGame();
  const { playSound, vibrate } = useSettings();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleShowConfirm = () => {
    playSound('click');
    vibrate(30);
    setShowConfirm(true);
  };

  const handleCancel = () => {
    playSound('click');
    setShowConfirm(false);
  };

  const handleRestart = () => {
    playSound('click');
    vibrate(100);
    setShowConfirm(false);
    resetGame();
  };

  return (
    <>
      <button
        onClick={handleShowConfirm}
        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/60 text-sm text-muted-foreground hover:bg-secondary/80 transition-all"
      >
        <RotateCcw size={16} />
        إعادة اللعبة
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 p-6 animate-fade-in flex items-center justify-center">
          <div className="card-game max-w-sm w-[calc(100%-3rem)] text-center animate-scale-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <RotateCcw size={32} className="text-destructive" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">إعادة اللعبة؟</h2>
            <p className="text-muted-foreground mb-6">
              سيتم إنهاء اللعبة الحالية والعودة للبداية
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 btn-secondary-game flex items-center justify-center gap-2"
              >
                <X size={20} />
                إلغاء
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 btn-imposter flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                إعادة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RestartButton;