import React, { useState } from 'react';
import { useGame, AVATAR_OPTIONS } from '@/context/GameContext';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface PlayerData {
  name: string;
  avatar: string;
}

const PlayerNamesScreen: React.FC = () => {
  const { playerCount, setScreen, startGame } = useGame();
  const [playerData, setPlayerData] = useState<PlayerData[]>(
    Array.from({ length: playerCount }, (_, i) => ({
      name: `لاعب ${i + 1}`,
      avatar: '👤'
    }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState(playerData[0].name);
  const [selectedAvatar, setSelectedAvatar] = useState(playerData[0].avatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleNameChange = (value: string) => {
    const limited = value.slice(0, 20);
    setInputValue(limited);
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setShowAvatarPicker(false);
  };

  const handleNext = () => {
    // Save current player data
    const newPlayerData = [...playerData];
    const trimmedName = inputValue.trim();
    newPlayerData[currentIndex] = {
      name: trimmedName || `لاعب ${currentIndex + 1}`,
      avatar: selectedAvatar
    };
    setPlayerData(newPlayerData);

    if (currentIndex < playerCount - 1) {
      // Move to next player
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setInputValue(newPlayerData[nextIndex].name);
      setSelectedAvatar(newPlayerData[nextIndex].avatar);
      setShowAvatarPicker(false);
    } else {
      // All data entered, start game
      startGame(newPlayerData);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Save current player data first
      const newPlayerData = [...playerData];
      const trimmedName = inputValue.trim();
      newPlayerData[currentIndex] = {
        name: trimmedName || `لاعب ${currentIndex + 1}`,
        avatar: selectedAvatar
      };
      setPlayerData(newPlayerData);

      // Go back to previous player
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setInputValue(newPlayerData[prevIndex].name);
      setSelectedAvatar(newPlayerData[prevIndex].avatar);
      setShowAvatarPicker(false);
    }
  };

  const handleSkipAll = () => {
    const defaultData = Array.from({ length: playerCount }, (_, i) => ({
      name: `لاعب ${i + 1}`,
      avatar: '👤'
    }));
    startGame(defaultData);
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
          {/* Avatar Picker */}
          <button
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 glow-primary animate-float hover:scale-110 transition-transform relative"
          >
            <span className="text-5xl">{selectedAvatar}</span>
            <span className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-xs">
              ✏️
            </span>
          </button>
          
          <p className="text-sm text-muted-foreground mb-4">اضغط لتغيير الأفاتار</p>

          {/* Avatar Options */}
          {showAvatarPicker && (
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-4 mb-6 animate-scale-in border border-border/50">
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110 ${
                      selectedAvatar === avatar 
                        ? 'bg-primary/30 ring-2 ring-primary' 
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          )}

          <h2 className="text-xl text-muted-foreground mb-2">اسم اللاعب</h2>
          <span className="text-4xl font-black text-gradient mb-6">
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
              {playerData.slice(0, currentIndex).map((data, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-secondary text-sm flex items-center gap-2"
                >
                  <span>{data.avatar}</span>
                  <Check size={14} className="text-accent" />
                  {data.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 btn-primary-game text-xl"
          >
            {isLastPlayer ? '🚀 ابدأ اللعبة' : '➡️ التالي'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerNamesScreen;
