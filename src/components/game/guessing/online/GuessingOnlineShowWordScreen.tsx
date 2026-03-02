import React, { useState, useEffect } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import * as guessingService from '@/services/guessingRoomService';
import { ArrowRight } from 'lucide-react';
import WordImage from '../WordImage';

const GuessingOnlineShowWordScreen: React.FC = () => {
  const { room, currentPlayer, setScreen } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();
  const [myWord, setMyWord] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!room) return;
    guessingService.getMyGuessingWord(room.id).then(w => setMyWord(w));
  }, [room?.id, room?.current_round]);

  if (!room || !currentPlayer) return null;

  if (!revealed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />
        <div className="relative z-10 w-full max-w-sm">
          <div className="text-sm text-muted-foreground font-bold mb-4">
            المواجهة {room.current_round} / {room.total_rounds}
          </div>
          <div className="card-game text-center">
            <div className="text-5xl mb-4">{currentPlayer.avatar}</div>
            <h2 className="text-xl font-black mb-2">{currentPlayer.name}</h2>
            <p className="text-muted-foreground mb-6">اضغط عشان تشوف كلمتك</p>
            <button onClick={() => { playSound('reveal'); vibrate(50); setRevealed(true); }}
              className="w-full btn-primary-game text-lg">
              👀 وريني كلمتي
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="card-game text-center">
          <p className="text-sm text-muted-foreground mb-2">كلمتك هي:</p>
          {myWord && <WordImage word={myWord} size="lg" />}
          <div className="text-4xl font-black text-primary mb-4 animate-reveal py-4 px-6 bg-primary/10 rounded-2xl">
            {myWord || '...'}
          </div>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            الخصم لازم يحزرها! احفظها 🤫
            <br />
            <span className="text-destructive font-bold">لا تخلي حد يشوف شاشتك!</span>
          </p>
          <button onClick={() => { playSound('click'); vibrate(50); setScreen('guessingOnlinePlay'); }}
            className="w-full btn-primary-game text-lg">
            ✅ حفظتها، يلا نبدأ!
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingOnlineShowWordScreen;
