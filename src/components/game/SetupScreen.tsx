import React from 'react';
import { useGame } from '@/context/GameContext';
import { ArrowRight, Users, UserX, Layers, Clock } from 'lucide-react';
import { Category, categoryNames } from '@/data/words';
import RestartButton from './RestartButton';

const SetupScreen: React.FC = () => {
  const { 
    setScreen, 
    playerCount, 
    setPlayerCount, 
    imposterCount, 
    setImposterCount,
    category,
    setCategory,
    discussionTimeEnabled,
    setDiscussionTimeEnabled,
    discussionTime,
    setDiscussionTime,
    goToPlayerNames
  } = useGame();

  const categories: Category[] = ['random', 'things', 'places', 'food', 'jobs'];

  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30" />
      
      {/* Header - Sticky */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen('home')}
            className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <ArrowRight size={24} />
          </button>
          <h1 className="text-2xl font-bold">إعداد اللعبة</h1>
        </div>
      </div>
      
      {/* Options */}
      <div className="relative z-10 flex-1 space-y-6 overflow-auto">
        {/* Player Count */}
        <div className="card-game">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Users className="text-accent" size={20} />
            </div>
            <div>
              <h3 className="font-bold">عدد اللاعبين</h3>
              <p className="text-sm text-muted-foreground">من 3 إلى 10</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setPlayerCount(Math.max(3, playerCount - 1))}
              className="w-14 h-14 rounded-2xl bg-secondary text-2xl font-bold hover:bg-secondary/80 transition-colors"
              disabled={playerCount <= 3}
            >
              -
            </button>
            <span className="text-4xl font-black text-primary">{playerCount}</span>
            <button
              onClick={() => setPlayerCount(Math.min(10, playerCount + 1))}
              className="w-14 h-14 rounded-2xl bg-secondary text-2xl font-bold hover:bg-secondary/80 transition-colors"
              disabled={playerCount >= 10}
            >
              +
            </button>
          </div>
        </div>
        
        {/* Imposter Count */}
        <div className="card-game">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-imposter/20 flex items-center justify-center">
              <UserX className="text-imposter" size={20} />
            </div>
            <div>
              <h3 className="font-bold">عدد الإمبوستر</h3>
              <p className="text-sm text-muted-foreground">
                {playerCount < 4 ? 'يتطلب 4+ لاعبين لإمبوسترين' : 'للمتقدمين: جرب 2'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2].map((count) => {
              const isDisabled = count === 2 && playerCount < 4;
              return (
                <button
                  key={count}
                  onClick={() => !isDisabled && setImposterCount(count)}
                  disabled={isDisabled}
                  className={`flex-1 py-2.5 rounded-xl text-base font-bold transition-all ${
                    imposterCount === count
                      ? 'bg-imposter text-white glow-imposter'
                      : isDisabled
                        ? 'bg-secondary/50 text-muted-foreground/50 cursor-not-allowed'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {count} 😈
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Category */}
        <div className="card-game">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Layers className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-bold">فئة الكلمات</h3>
              <p className="text-sm text-muted-foreground">اختر نوع الكلمات</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all ${
                  category === cat
                    ? 'bg-primary text-primary-foreground glow-primary'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {categoryNames[cat]}
              </button>
            ))}
          </div>
        </div>
        
        {/* Discussion Time */}
        <div className="card-game">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Clock className="text-accent" size={20} />
              </div>
              <div>
                <h3 className="font-bold">وقت النقاش</h3>
                <p className="text-sm text-muted-foreground">
                  {discussionTimeEnabled ? 'مؤقت تنازلي' : 'بدون مؤقت'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setDiscussionTimeEnabled(!discussionTimeEnabled)}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                discussionTimeEnabled ? 'bg-accent' : 'bg-secondary'
              }`}
            >
              <div 
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                  discussionTimeEnabled ? 'left-1' : 'right-1'
                }`}
              />
            </button>
          </div>
          {discussionTimeEnabled && (
            <div className="flex gap-2">
              {[60, 90, 120].map((time) => (
                <button
                  key={time}
                  onClick={() => setDiscussionTime(time)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    discussionTime === time
                      ? 'bg-accent text-accent-foreground glow-accent'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {time}s
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Start Button */}
      <div className="relative z-10 mt-6 space-y-3">
        <button
          onClick={goToPlayerNames}
          className="w-full btn-primary-game text-xl"
        >
          التالي: أسماء اللاعبين ✏️
        </button>
        <div className="flex justify-center">
          <RestartButton />
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
