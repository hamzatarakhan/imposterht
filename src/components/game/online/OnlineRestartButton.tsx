import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { RotateCcw, X } from 'lucide-react';

const OnlineRestartButton: React.FC = () => {
  const { leaveRoom, resetOnlineGame, room, isHost, setScreen: setOnlineScreen } = useOnlineGame();
  const { setScreen: setGameScreen } = useGame();
  const { playSound, vibrate } = useSettings();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Prevent background scroll + iOS viewport "jump" while modal is open
  useEffect(() => {
    if (!showConfirm) return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevTouchAction = body.style.touchAction;

    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';

    return () => {
      body.style.overflow = prevOverflow;
      body.style.touchAction = prevTouchAction;
    };
  }, [showConfirm]);

  const handleShowConfirm = () => {
    playSound('click');
    vibrate(30);
    setShowConfirm(true);
  };

  const handleCancel = () => {
    playSound('click');
    setShowConfirm(false);
  };

  const handleRestart = async () => {
    playSound('click');
    vibrate(100);
    setIsLeaving(true);

    // If we're not in a room yet (e.g. Join/Create screens), leaving is a no-op.
    // We must reset the online flow so Game.tsx doesn't keep rendering OnlineGame.
    if (room?.id) {
      await leaveRoom();
    } else {
      resetOnlineGame();
    }

    setOnlineScreen('modeSelect');
    setGameScreen('modeSelect');
    setShowConfirm(false);
    setIsLeaving(false);
  };

  // Only show restart button for host
  if (!isHost) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleShowConfirm}
        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/60 text-sm text-muted-foreground hover:bg-secondary/80 transition-all"
      >
        <RotateCcw size={16} />
        إعادة اللعبة
      </button>

      {/* Confirmation Dialog - Portal to body for proper centering */}
      {showConfirm && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="تأكيد إعادة اللعبة"
          onClick={handleCancel}
        >
          <div
            className="card-game w-[min(24rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-auto text-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <RotateCcw size={32} className="text-destructive" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">إعادة اللعبة؟</h2>
            <p className="text-muted-foreground mb-6">
              سيتم مغادرة الغرفة الحالية والعودة للبداية
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isLeaving}
                className="flex-1 btn-secondary-game flex items-center justify-center gap-2"
              >
                <X size={20} />
                إلغاء
              </button>
              <button
                onClick={handleRestart}
                disabled={isLeaving}
                className="flex-1 btn-imposter flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} className={isLeaving ? 'animate-spin' : ''} />
                {isLeaving ? 'جاري...' : 'إعادة'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default OnlineRestartButton;
