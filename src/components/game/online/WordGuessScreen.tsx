import React, { useEffect, useState, useMemo } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { HelpCircle, Check, X, Clock } from 'lucide-react';
import * as roomService from '@/services/roomService';
import { words, Category } from '@/data/words';

interface WordGuessScreenProps {
  secretWord: string;
  onComplete: () => void;
}

const WordGuessScreen: React.FC<WordGuessScreenProps> = ({ secretWord, onComplete }) => {
  const { room, currentPlayer } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);

  // Check if current player is imposter
  const isImposter = useMemo(() => {
    if (!currentPlayer) return false;
    // We'll check via RPC since is_imposter is hidden until finish
    return true; // This component is only shown to imposters
  }, [currentPlayer]);

  // Generate word choices (correct word + 3 decoys from same category)
  const wordChoices = useMemo(() => {
    if (!secretWord) return [];
    
    // Find which category the secret word belongs to
    let wordCategory: Exclude<Category, 'random' | 'custom'> | null = null;
    for (const [cat, wordList] of Object.entries(words)) {
      if (wordList.includes(secretWord)) {
        wordCategory = cat as Exclude<Category, 'random' | 'custom'>;
        break;
      }
    }
    
    // Get decoys from the same category or random
    let decoyPool: string[] = [];
    if (wordCategory) {
      decoyPool = words[wordCategory].filter(w => w !== secretWord);
    } else {
      // Fallback: get words from all categories
      Object.values(words).forEach(list => {
        decoyPool.push(...list.filter(w => w !== secretWord));
      });
    }
    
    // Shuffle and pick 3 decoys
    const shuffled = [...decoyPool].sort(() => Math.random() - 0.5);
    const decoys = shuffled.slice(0, 3);
    
    // Combine with correct word and shuffle
    const allChoices = [secretWord, ...decoys].sort(() => Math.random() - 0.5);
    
    return allChoices;
  }, [secretWord]);

  // Countdown timer
  useEffect(() => {
    if (result) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time's up - auto submit wrong answer
          handleSubmit(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result]);

  const handleSubmit = async (word: string | null) => {
    if (isSubmitting || result) return;
    setIsSubmitting(true);
    
    if (word) {
      setSelectedWord(word);
      const isCorrect = await roomService.submitWordGuess(room!.id, word);
      setResult(isCorrect ? 'correct' : 'wrong');
      
      if (isCorrect) {
        playSound('win');
        vibrate(100);
      } else {
        playSound('lose');
        vibrate(200);
      }
    } else {
      // Time's up
      setResult('wrong');
      playSound('lose');
      vibrate(200);
      // Submit empty/wrong guess
      await roomService.submitWordGuess(room!.id, '__timeout__');
    }
    
    // Wait and then complete
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-imposter/10 to-background" />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        {/* Header */}
        <div className="mb-6 animate-reveal">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-imposter/20 flex items-center justify-center">
            <HelpCircle className="text-imposter" size={32} />
          </div>
          <h1 className="text-2xl font-black text-imposter mb-1">
            خمّن الكلمة! 🎯
          </h1>
          <p className="text-muted-foreground text-sm">
            إذا خمنت صح بتاخذ نقطتين إضافية!
          </p>
        </div>

        {/* Timer */}
        {!result && (
          <div className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-full ${
            timeLeft <= 5 ? 'bg-imposter/20 text-imposter animate-pulse' : 'bg-secondary'
          }`}>
            <Clock size={20} />
            <span className="font-bold text-lg">{timeLeft}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`mb-6 p-4 rounded-2xl ${
            result === 'correct' 
              ? 'bg-accent/20 border border-accent' 
              : 'bg-imposter/20 border border-imposter'
          }`}>
            {result === 'correct' ? (
              <div className="flex items-center gap-2">
                <Check className="text-accent" size={24} />
                <span className="font-bold text-accent">صح! +2 نقطة 🎉</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <X className="text-imposter" size={24} />
                  <span className="font-bold text-imposter">غلط!</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  الكلمة كانت: <span className="font-bold text-foreground">{secretWord}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Word Choices */}
        {!result && (
          <div className="w-full max-w-sm space-y-3">
            {wordChoices.map((word, index) => (
              <button
                key={index}
                onClick={() => handleSubmit(word)}
                disabled={isSubmitting}
                className={`w-full p-4 rounded-2xl text-lg font-bold transition-all ${
                  selectedWord === word
                    ? 'bg-primary text-primary-foreground scale-95'
                    : 'bg-secondary hover:bg-secondary/80 hover:scale-[1.02]'
                } disabled:opacity-50`}
              >
                {word}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordGuessScreen;
