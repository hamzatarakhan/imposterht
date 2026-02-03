import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { useSavedGroups } from '@/hooks/useSavedGroups';
import { ArrowRight, Users, UserX, Layers, Clock, FolderOpen } from 'lucide-react';
import { Category, categoryNames } from '@/data/words';
import RestartButton from './RestartButton';
import GroupManagementModal from './GroupManagementModal';
import { SavedPlayer } from '@/hooks/useSavedPlayers';

const SetupScreen: React.FC = () => {
  const { 
    setScreen, 
    playerCount, 
    setPlayerCount, 
    imposterCount, 
    setImposterCount,
    categories: selectedCategories,
    toggleCategory,
    discussionTimeEnabled,
    setDiscussionTimeEnabled,
    discussionTime,
    setDiscussionTime,
    goToPlayerNames,
    startGame
  } = useGame();
  const { playSound, vibrate } = useSettings();
  const { groups } = useSavedGroups();
  const hasPlayedReady = useRef(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ name: string; members: SavedPlayer[] } | null>(null);

  // Play ready sound when entering setup screen
  useEffect(() => {
    if (!hasPlayedReady.current) {
      hasPlayedReady.current = true;
      setTimeout(() => {
        playSound('ready');
        vibrate(20);
      }, 200);
    }
  }, [playSound, vibrate]);

  const categoryOptions: Category[] = ['random', 'things', 'places', 'food', 'jobs', 'animals', 'sports', 'celebrities', 'movies'];

  const handlePlayerCountChange = (delta: number) => {
    playSound('click');
    vibrate(30);
    const newCount = Math.max(3, Math.min(10, playerCount + delta));
    setPlayerCount(newCount);
    // Clear selected group if count doesn't match
    if (selectedGroup && newCount !== selectedGroup.members.length) {
      setSelectedGroup(null);
    }
  };

  const handleImposterCountChange = (count: number, isDisabled: boolean) => {
    if (isDisabled) return;
    playSound('click');
    vibrate(30);
    setImposterCount(count);
  };

  const handleCategoryToggle = (cat: Category) => {
    playSound('click');
    vibrate(30);
    toggleCategory(cat);
  };

  const handleDiscussionTimeToggle = () => {
    playSound('click');
    vibrate(30);
    setDiscussionTimeEnabled(!discussionTimeEnabled);
  };

  const handleDiscussionTimeChange = (time: number) => {
    playSound('click');
    vibrate(30);
    setDiscussionTime(time);
  };

  const handleSelectGroup = (members: SavedPlayer[]) => {
    setSelectedGroup({ name: '', members });
    setPlayerCount(members.length);
    playSound('click');
    vibrate(50);
  };

  const handleClearGroup = () => {
    playSound('click');
    vibrate(30);
    setSelectedGroup(null);
  };

  const handleStart = () => {
    playSound('click');
    vibrate(50);
    // If a group is selected, skip to game directly
    if (selectedGroup) {
      const playerData = selectedGroup.members.map(m => ({ name: m.name, avatar: m.avatar }));
      startGame(playerData);
    } else {
      goToPlayerNames();
    }
  };

  const handleBack = () => {
    playSound('click');
    vibrate(30);
    setScreen('home');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <ArrowRight size={24} />
            </button>
            <h1 className="text-2xl font-bold">إعداد اللعبة</h1>
          </div>
        </div>
        
        {/* Options */}
        <div className="flex-1 overflow-auto px-6 pb-44 space-y-6">
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
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => handlePlayerCountChange(-1)}
              className="w-11 h-11 rounded-xl bg-secondary text-xl font-bold hover:bg-secondary/80 transition-colors"
              disabled={playerCount <= 3}
            >
              -
            </button>
            <span className="text-3xl font-black text-primary">{playerCount}</span>
            <button
              onClick={() => handlePlayerCountChange(1)}
              className="w-11 h-11 rounded-xl bg-secondary text-xl font-bold hover:bg-secondary/80 transition-colors"
              disabled={playerCount >= 10}
            >
              +
            </button>
          </div>
        </div>

        {/* Group Selection */}
        <div className="card-game">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <FolderOpen className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-bold">مجموعة سريعة</h3>
              <p className="text-sm text-muted-foreground">
                {selectedGroup ? `${selectedGroup.members.length} لاعبين جاهزين` : 'اختر مجموعة محفوظة'}
              </p>
            </div>
          </div>
          
          {selectedGroup ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {selectedGroup.members.map((member, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-primary/20 rounded-lg text-xs flex items-center gap-1"
                  >
                    {member.avatar} {member.name}
                  </span>
                ))}
              </div>
              <button
                onClick={handleClearGroup}
                className="w-full py-2 bg-secondary rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                إلغاء المجموعة ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playSound('click');
                vibrate(30);
                setShowGroupsModal(true);
              }}
              className="w-full py-3 border-2 border-dashed border-muted-foreground/30 rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <FolderOpen size={18} />
              {groups.length > 0 ? `اختر من ${groups.length} مجموعات` : 'إنشاء مجموعة جديدة'}
            </button>
          )}
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
                  onClick={() => handleImposterCountChange(count, isDisabled)}
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
        
        {/* Category - Multi-Select */}
        <div className="card-game">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Layers className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-bold">فئة الكلمات</h3>
              <p className="text-sm text-muted-foreground">
                {selectedCategories.includes('random') 
                  ? 'كل الفئات' 
                  : selectedCategories.length === 1 
                    ? 'فئة واحدة' 
                    : `${selectedCategories.length} فئات محددة`}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categoryOptions.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              const isRandom = cat === 'random';
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryToggle(cat)}
                  className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all relative ${
                    isSelected
                      ? isRandom 
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary'
                        : 'bg-primary text-primary-foreground glow-primary'
                      : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {isSelected && !isRandom && (
                    <span className="absolute top-1 left-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                  {categoryNames[cat]}
                </button>
              );
            })}
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
              onClick={handleDiscussionTimeToggle}
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
                  onClick={() => handleDiscussionTimeChange(time)}
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
      </div>
      
      {/* Sticky Start Button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border p-4 space-y-3 max-w-md mx-auto">
        <button
          onClick={handleStart}
          className="w-full btn-primary-game text-xl"
        >
          {selectedGroup ? 'ابدأ اللعبة! 🎮' : 'التالي: أسماء اللاعبين ✏️'}
        </button>
        <div className="flex justify-center">
          <RestartButton />
        </div>
      </div>

      {/* Groups Modal */}
      <GroupManagementModal
        isOpen={showGroupsModal}
        onClose={() => setShowGroupsModal(false)}
        onSelectGroup={handleSelectGroup}
      />
    </div>
  );
};

export default SetupScreen;