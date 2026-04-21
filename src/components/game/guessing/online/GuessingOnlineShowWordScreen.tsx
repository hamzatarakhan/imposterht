import React from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight } from 'lucide-react';
import SpectatorShareButton from './SpectatorShareButton';
import { getRoundCategoryId, getCategoryMeta } from '@/lib/guessingRoundCategory';

const GuessingOnlineShowWordScreen: React.FC = () => {
  const { room, currentPlayer, setScreen, leaveRoom } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();

  if (!room || !currentPlayer) return null;

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
        <button onClick={async () => { playSound('click'); await leaveRoom(); }}
          className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black flex-1">🤔 كلمتك</h1>
        {room && <SpectatorShareButton roomCode={room.code} variant="icon" />}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm">
          <div className="text-sm text-muted-foreground font-bold mb-2">
            المواجهة {room.current_round} / {room.total_rounds}
          </div>
          {(() => {
            const catId = getRoundCategoryId(room.categories, room.current_round);
            const cat = getCategoryMeta(catId);
            return (
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-bold text-primary">مواجهة {cat.label}</span>
              </div>
            );
          })()}
          <div className="card-game text-center">
            <div className="text-5xl mb-4">{currentPlayer.avatar}</div>
            <h2 className="text-xl font-black mb-2">{currentPlayer.name}</h2>
            <p className="text-muted-foreground mb-6">اضغط عشان تشوف كلمتك وتبدأ المواجهة</p>
            <button onClick={() => { playSound('reveal'); vibrate(50); setScreen('guessingOnlinePlay'); }}
              className="w-full btn-primary-game text-lg">
              تمام ورجيني كلمتي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuessingOnlineShowWordScreen;
