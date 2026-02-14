import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { HelpCircle, Check, X, Clock, Eye } from 'lucide-react';
import * as roomService from '@/services/roomService';
import { getWordsByCategory, Category } from '@/data/words';

const OnlineWordGuessScreen: React.FC = () => {
  const { room, players, currentPlayer, isHost, setScreen } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [guessResult, setGuessResult] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  // Determine the imposter who gets to guess
  const myImposterId = currentPlayer?.player_id;
  const guessingImposter = useMemo(() => {
    // If players won, the most voted (caught) imposter guesses
    // If imposters won, pick any imposter (first one found)
    if (room?.winner === 'players') {
      const sorted = [...players].sort((a, b) => b.votes - a.votes);
      return sorted[0];
    }
    // Imposters won - we need to find an imposter from the revealed data
    // Since game is finished, is_imposter is visible
    const imposter = players.find(p => p.is_imposter);
    return imposter || players[0];
  }, [players, room?.winner]);
  
  const isTheGuessingImposter = guessingImposter?.player_id === myImposterId;

  // Host generates and stores word options when entering this screen
  useEffect(() => {
    if (!isHost || !room) return;
    
    // If options already set, skip
    if (room.word_guess_options) return;
    
    const generateOptions = async () => {
      // Get secret word
      const secretWord = await roomService.getFinishedGameWord(room.id);
      if (!secretWord) return;
      
      // Get words from the same category
      let categories: Category[] = ['random'];
      try {
        const parsed = JSON.parse(room.categories || '["random"]');
        categories = Array.isArray(parsed) ? parsed : ['random'];
      } catch {
        categories = ['random'];
      }
      
      // Gather all words from the categories
      let allWords: string[] = [];
      for (const cat of categories) {
        allWords = [...allWords, ...getWordsByCategory(cat)];
      }
      allWords = [...new Set(allWords)].filter(w => w !== secretWord);
      
      // Pick 3 random fake words
      const fakeWords: string[] = [];
      const shuffled = allWords.sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(3, shuffled.length); i++) {
        fakeWords.push(shuffled[i]);
      }
      
      // Combine and shuffle
      const allOptions = [...fakeWords, secretWord].sort(() => Math.random() - 0.5);
      
      await roomService.setWordGuessOptions(room.id, allOptions);
    };
    
    generateOptions();
  }, [isHost, room]);

  // Load options from room state
  useEffect(() => {
    if (room?.word_guess_options) {
      try {
        const parsed = JSON.parse(room.word_guess_options);
        if (Array.isArray(parsed)) {
          setOptions(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, [room?.word_guess_options]);

  // Watch for word_guess_status change to 'completed' -> navigate to results
  useEffect(() => {
    if (room?.word_guess_status === 'completed') {
      // Small delay for the result animation
      const timer = setTimeout(() => {
        setScreen('onlineResult');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [room?.word_guess_status, setScreen]);

  const handleSelectWord = useCallback(async (word: string) => {
    if (!isTheGuessingImposter || isSubmitting || guessResult !== null) return;
    
    playSound('click');
    vibrate(50);
    setSelectedWord(word);
    setIsSubmitting(true);
    
    try {
      const correct = await roomService.submitWordGuess(room!.id, word);
      setGuessResult(correct);
      
      if (correct) {
        playSound('win');
        vibrate(100);
      } else {
        playSound('lose');
        vibrate(200);
      }
    } catch {
      setGuessResult(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [isTheGuessingImposter, isSubmitting, guessResult, room, playSound, vibrate]);

  // If guess is completed (from DB), show result to everyone
  if (room?.word_guess_status === 'completed') {
    const guessedCorrectly = room.word_guessed === true;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
        
        <div className="relative z-10 text-center max-w-sm">
          <div className="mb-6 animate-reveal">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              guessedCorrectly ? 'bg-accent/20 glow-accent' : 'bg-imposter/20 glow-imposter'
            }`}>
              {guessedCorrectly ? (
                <Check className="text-accent" size={40} />
              ) : (
                <X className="text-imposter" size={40} />
              )}
            </div>
          </div>
          
          <h2 className={`text-2xl font-black mb-2 ${guessedCorrectly ? 'text-accent' : 'text-imposter'}`}>
            {guessedCorrectly ? '😱 الإمبوستر عرف الكلمة!' : '😅 الإمبوستر ما عرف الكلمة!'}
          </h2>
          
          <p className="text-muted-foreground mb-4">
            {guessedCorrectly ? 'أخذ نقطتين إضافيتين! 🎯' : 'ما قدر يحزرها! 🎉'}
          </p>
          
          <p className="text-sm text-muted-foreground animate-pulse">
            جاري الانتقال للنتائج...
          </p>
        </div>
      </div>
    );
  }

  // Waiting for options to be generated
  if (options.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحضير الخيارات...</p>
        </div>
      </div>
    );
  }

  // Imposter's view - they can pick
  if (isTheGuessingImposter) {
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
            {options.map((word, index) => (
              <button
                key={index}
                onClick={() => handleSelectWord(word)}
                disabled={isSubmitting || guessResult !== null}
                className={`w-full p-4 rounded-2xl text-lg font-bold transition-all duration-300 ${
                  selectedWord === word
                    ? guessResult === true
                      ? 'bg-accent/30 border-2 border-accent text-accent scale-105'
                      : guessResult === false
                        ? 'bg-imposter/30 border-2 border-imposter text-imposter'
                        : 'bg-primary/30 border-2 border-primary text-primary scale-105'
                    : 'bg-secondary/80 hover:bg-secondary border-2 border-transparent'
                } disabled:opacity-70`}
              >
                {word}
                {selectedWord === word && guessResult === true && ' ✅'}
                {selectedWord === word && guessResult === false && ' ❌'}
              </button>
            ))}
          </div>

          {guessResult !== null && (
            <div className={`card-game animate-reveal ${guessResult ? 'bg-accent/20 border-accent' : 'bg-imposter/20 border-imposter'}`}>
              <p className="font-bold">
                {guessResult ? '🎯 صحيح! +2 نقاط إضافية' : '❌ غلط! ما كانت هذي الكلمة'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Spectator view - other players watch
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      
      <div className="relative z-10 text-center max-w-sm w-full">
        <div className="mb-6 animate-reveal">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center glow-primary">
            <Eye className="text-primary" size={40} />
          </div>
        </div>
        
        <h1 className="text-2xl font-black mb-2">
          🤔 الإمبوستر يحزر الكلمة!
        </h1>
        <p className="text-muted-foreground mb-2">
          <span className="text-lg">{guessingImposter?.avatar}</span>{' '}
          <span className="font-bold text-imposter">{guessingImposter?.name}</span>{' '}
          عنده فرصة يحزر الكلمة السرية
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          إذا حزر صح بياخد نقطتين إضافيتين 🎯
        </p>
        
        <div className="space-y-3 mb-4">
          {options.map((word, index) => (
            <div
              key={index}
              className="w-full p-4 rounded-2xl text-lg font-bold bg-secondary/80 border-2 border-transparent"
            >
              {word}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground animate-pulse">
          <Clock size={16} />
          <span className="text-sm">بانتظار اختيار الإمبوستر...</span>
        </div>
      </div>
    </div>
  );
};

export default OnlineWordGuessScreen;
