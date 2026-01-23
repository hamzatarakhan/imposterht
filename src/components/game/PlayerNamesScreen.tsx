import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { ArrowRight, User, Check } from 'lucide-react';

const PlayerNamesScreen: React.FC = () => {
  const { playerCount, setScreen, setPlayerNames, startGame } = useGame();
  const [names, setNames] = useState<string[]>(
    Array.from({ length: playerCount }, (_, i) => `لاعب ${i + 1}`)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState(names[0]);

  const handleNameChange = (value: string) => {
    // Limit name length and sanitize
    const sanitized = value.slice(0, 20).trim();
    setInputValue(sanitized);
  };

  const handleNext = () => {
    // Save current name
    const newNames = [...names];
    newNames[currentIndex] = inputValue || `لاعب ${currentIndex + 1}`;
    setNames(newNames);

    if (currentIndex < playerCount - 1) {
      // Move to next player
      setCurrentIndex(currentIndex + 1);
      setInputValue(newNames[currentIndex + 1]);
    } else {
      // All names entered, start game with the names directly
      startGame(newNames);
    }
  };

  const handleSkipAll = () => {
    // Use default names
    const defaultNames = Array.from({ length: playerCount }, (_, i) => `لاعب ${i + 1}`);
    startGame(defaultNames);
  };

  const isLastPlayer = currentIndex === playerCount - 1;
  const progress = ((currentIndex + 1) / playerCount) * 100;

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30" />
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setScreen('setup')}
            className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <ArrowRight size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">أسماء اللاعبين</h1>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} / {playerCount}
            </p>
          </div>
          <button
            onClick={handleSkipAll}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            تخطي الكل
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-secondary rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Player Icon */}
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 glow-primary animate-float">
            <User className="text-primary" size={48} />
          </div>

          <h2 className="text-xl text-muted-foreground mb-2">اسم اللاعب</h2>
          <span className="text-4xl font-black text-gradient mb-8">
            #{currentIndex + 1}
          </span>

          {/* Name Input */}
          <div className="w-full max-w-sm">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={`لاعب ${currentIndex + 1}`}
              maxLength={20}
              className="w-full text-center text-2xl font-bold py-4 px-6 rounded-2xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNext();
                }
              }}
            />
            <p className="text-center text-sm text-muted-foreground mt-2">
              {inputValue.length}/20 حرف
            </p>
          </div>

          {/* Names Preview */}
          {currentIndex > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {names.slice(0, currentIndex).map((name, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-secondary text-sm flex items-center gap-1"
                >
                  <Check size={14} className="text-accent" />
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={handleNext}
            className="w-full btn-primary-game text-xl"
          >
            {isLastPlayer ? '🚀 ابدأ اللعبة' : '➡️ التالي'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerNamesScreen;
