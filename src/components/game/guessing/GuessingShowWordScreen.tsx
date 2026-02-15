import React from 'react';
import { useGuessingGame } from '@/context/GuessingGameContext';
import { useSettings } from '@/context/SettingsContext';

const GuessingShowWordScreen: React.FC = () => {
  const { words, currentPlayerViewIndex, players, confirmSeen } = useGuessingGame();
  const { playSound, vibrate } = useSettings();

  if (players.length < 2 || words.length < 2) return null;

  const currentPlayer = players[currentPlayerViewIndex];
  const myWord = words[currentPlayerViewIndex];
  const isFirst = currentPlayerViewIndex === 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="card-game text-center">
          <div className="text-4xl mb-3">{currentPlayer.avatar}</div>
          <p className="text-sm text-muted-foreground mb-2">{currentPlayer.name}، كلمتك هي:</p>
          <div className="text-4xl font-black text-primary mb-4 animate-reveal py-4 px-6 bg-primary/10 rounded-2xl">
            {myWord}
          </div>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            احفظ كلمتك! الخصم لازم يحزرها 🤫
            <br />
            <span className="text-destructive font-bold">لا تخلي حد يشوفها!</span>
          </p>

          <button
            onClick={() => { playSound('click'); vibrate(50); confirmSeen(); }}
            className="w-full btn-primary-game text-lg"
          >
            {isFirst ? '✅ حفظتها، مرّر للخصم' : '✅ حفظتها، يلا نبدأ!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingShowWordScreen;
