import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { HelpCircle, Check, X, Eye } from 'lucide-react';

const WordGuessScreen: React.FC = () => {
  const { players, secretWord, wordGuessOptions, wordGuessed, winner, submitWordGuess, skipWordGuess, setScreen } = useGame();
  const { playSound, vibrate } = useSettings();
  
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showPassPhone, setShowPassPhone] = useState(true);

  // Find the imposter who gets to guess
  const guessingImposter = winner === 'players'
    ? [...players].sort((a, b) => b.votes - a.votes)[0]
    : players.find(p => p.isImposter) || players[0];

  // Auto-navigate to result after guess
  useEffect(() => {
    if (wordGuessed !== null) {
      const timer = setTimeout(() => {
        setScreen('result');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [wordGuessed, setScreen]);

  const handleSelectWord = (word: string) => {
    if (selectedWord !== null) return;
    playSound('click');
    vibrate(50);
    setSelectedWord(word);
    submitWordGuess(word);
    
    if (word === secretWord) {
      playSound('win');
      vibrate(100);
    } else {
      playSound('lose');
      vibrate(200);
    }
  };

  const handleReady = () => {
    playSound('click');
    vibrate(30);
    setShowPassPhone(false);
  };

  // Result display after guess
  if (wordGuessed !== null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
        
        <div className="relative z-10 text-center max-w-sm">
          <div className="mb-6 animate-reveal">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              wordGuessed ? 'bg-accent/20 glow-accent' : 'bg-imposter/20 glow-imposter'
            }`}>
              {wordGuessed ? (
                <Check className="text-accent" size={40} />
              ) : (
                <X className="text-imposter" size={40} />
              )}
            </div>
          </div>
          
          <h2 className={`text-2xl font-black mb-2 ${wordGuessed ? 'text-accent' : 'text-imposter'}`}>
            {wordGuessed ? '😱 الإمبوستر عرف الكلمة!' : '😅 الإمبوستر ما عرف الكلمة!'}
          </h2>
          
          <p className="text-muted-foreground mb-4">
            {wordGuessed ? 'أخذ نقطتين إضافيتين! 🎯' : 'ما قدر يحزرها! 🎉'}
          </p>
          
          <p className="text-sm text-muted-foreground animate-pulse">
            جاري الانتقال للنتائج...
          </p>
        </div>
      </div>
    );
  }

  // Pass phone to imposter screen
  if (showPassPhone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-imposter/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center max-w-sm">
          <div className="mb-6 animate-reveal">
            <div className="w-20 h-20 mx-auto rounded-full bg-imposter/20 flex items-center justify-center glow-imposter">
              <HelpCircle className="text-imposter" size={40} />
            </div>
          </div>
          
          <h1 className="text-2xl font-black mb-2">🎭 مرحلة التخمين!</h1>
          <p className="text-muted-foreground mb-6">
            مرّر الهاتف إلى الإمبوستر
          </p>
          
          <div className="w-20 h-20 mx-auto rounded-full bg-imposter/20 flex items-center justify-center mb-3">
            <span className="text-4xl">{guessingImposter?.avatar || '😈'}</span>
          </div>
          <div className="card-game mb-6 inline-block">
            <span className="text-2xl font-black text-gradient-imposter">
              {guessingImposter?.name}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-8">
            عنده فرصة يحزر الكلمة السرية ويأخد نقاط إضافية 🎯
          </p>
          
          <button
            onClick={handleReady}
            className="w-full btn-imposter text-xl"
          >
            😈 جاهز أحزر
          </button>
          
          <button
            onClick={skipWordGuess}
            className="w-full btn-secondary-game mt-3"
          >
            تخطي ➡️
          </button>
        </div>
      </div>
    );
  }

  // Imposter guessing view
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-imposter/10 to-background" />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-imposter/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center max-w-sm w-full">
        <div className="mb-6 animate-reveal">
          <div className="w-20 h-20 mx-auto rounded-full bg-imposter/20 flex items-center justify-center glow-imposter">
            <HelpCircle className="text-imposter" size={40} />
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-imposter mb-2">
          😈 فرصتك الأخيرة!
        </h1>
        <p className="text-muted-foreground mb-6">
          حاول تحزر الكلمة السرية عشان تاخد نقاط إضافية
        </p>
        
        <div className="space-y-3 mb-6">
          {wordGuessOptions.map((word, index) => (
            <button
              key={index}
              onClick={() => handleSelectWord(word)}
              disabled={selectedWord !== null}
              className={`w-full p-4 rounded-2xl text-lg font-bold transition-all duration-300 ${
                selectedWord === word
                  ? word === secretWord
                    ? 'bg-accent/30 border-2 border-accent text-accent scale-105'
                    : 'bg-imposter/30 border-2 border-imposter text-imposter'
                  : 'bg-secondary/80 hover:bg-secondary border-2 border-transparent'
              } disabled:opacity-70`}
            >
              {word}
              {selectedWord === word && word === secretWord && ' ✅'}
              {selectedWord === word && word !== secretWord && ' ❌'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordGuessScreen;
