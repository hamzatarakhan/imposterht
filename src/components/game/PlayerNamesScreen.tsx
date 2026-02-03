import React, { useState } from 'react';
import { useGame, AVATAR_OPTIONS } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, ArrowLeft, Check, Users, X, Trash2, Pencil } from 'lucide-react';
import { useSavedPlayers } from '@/hooks/useSavedPlayers';
import RestartButton from './RestartButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PlayerData {
  name: string;
  avatar: string;
}

const PlayerNamesScreen: React.FC = () => {
  const { playerCount, setScreen, startGame } = useGame();
  const { playSound, vibrate } = useSettings();
  const { savedPlayers, addPlayers, removePlayer, clearAllPlayers } = useSavedPlayers();
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
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const handleNameChange = (value: string) => {
    const limited = value.slice(0, 20);
    setInputValue(limited);
  };

  const handleAvatarSelect = (avatar: string) => {
    playSound('click');
    setSelectedAvatar(avatar);
    setShowAvatarPicker(false);
  };

  const handleNext = () => {
    playSound('click');
    vibrate(30);
    
    // Save current player data
    const newPlayerData = [...playerData];
    const trimmedName = inputValue.trim();
    const currentPlayer = {
      name: trimmedName || `لاعب ${currentIndex + 1}`,
      avatar: selectedAvatar
    };
    newPlayerData[currentIndex] = currentPlayer;
    setPlayerData(newPlayerData);

    // Save new player immediately (non-default names only)
    if (trimmedName && !/^لاعب \d+$/.test(trimmedName)) {
      addPlayers([currentPlayer]);
    }

    if (currentIndex < playerCount - 1) {
      // Move to next player
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setInputValue(newPlayerData[nextIndex].name);
      setSelectedAvatar(newPlayerData[nextIndex].avatar);
      setShowAvatarPicker(false);
    } else {
      // All data entered, start game
      playSound('reveal');
      vibrate(100);
      startGame(newPlayerData);
    }
  };

  const handlePrevious = () => {
    playSound('click');
    vibrate(30);
    
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
    playSound('click');
    vibrate(50);
    const defaultData = Array.from({ length: playerCount }, (_, i) => ({
      name: `لاعب ${i + 1}`,
      avatar: '👤'
    }));
    startGame(defaultData);
  };

  const handleSelectSavedPlayer = (player: { name: string; avatar: string }) => {
    playSound('click');
    setInputValue(player.name);
    setSelectedAvatar(player.avatar);
  };

  const handleRemovePlayer = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    playSound('click');
    removePlayer(name);
  };

  const handleClearAll = () => {
    playSound('click');
    vibrate(50);
    clearAllPlayers();
    setShowDeleteAllDialog(false);
  };

  const handleBack = () => {
    playSound('click');
    vibrate(30);
    setScreen('setup');
  };

  const handleAvatarPickerToggle = () => {
    playSound('click');
    setShowAvatarPicker(!showAvatarPicker);
  };

  const isLastPlayer = currentIndex === playerCount - 1;
  const progress = ((currentIndex + 1) / playerCount) * 100;

  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30" />
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
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
          {/* Avatar Display - Selection Hidden for now */}
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-8 glow-primary animate-float">
            <span className="text-5xl">{selectedAvatar}</span>
          </div>

          <h2 className="text-xl text-muted-foreground mb-2">اسم اللاعب</h2>
          <span className="text-4xl font-black text-gradient mb-6">
            #{currentIndex + 1}
          </span>

          {/* Name Input */}
          <div className="w-full max-w-sm">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={`لاعب ${currentIndex + 1}`}
                  maxLength={20}
                  className="flex-1 min-w-0 text-center text-xl sm:text-2xl font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNext();
                    }
                  }}
                />
                {savedPlayers.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        onClick={() => playSound('click')}
                        className="shrink-0 p-3 sm:p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors"
                      >
                        <Users size={22} />
                      </button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="min-w-[220px] bg-card/95 backdrop-blur-md border-border/50 rounded-xl"
                  >
                    <DropdownMenuLabel className="text-muted-foreground flex items-center gap-2">
                      🔖 الأسماء المحفوظة
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-[200px] overflow-y-auto">
                      {savedPlayers.map((player) => (
                        <DropdownMenuItem
                          key={player.name}
                          className="flex items-center justify-between cursor-pointer"
                          onSelect={() => handleSelectSavedPlayer(player)}
                        >
                          <span className="flex items-center gap-2">
                            <span>{player.avatar}</span>
                            <span>{player.name}</span>
                          </span>
                          <button
                            onClick={(e) => handleRemovePlayer(e, player.name)}
                            className="p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer flex items-center gap-2"
                      onSelect={() => setShowDeleteAllDialog(true)}
                    >
                      <Trash2 size={16} />
                      مسح الكل
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {inputValue.length}/20 حرف
              </p>
            </div>
          </div>

          {/* Delete All Confirmation Dialog */}
          <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center">🗑️ مسح كل الأسماء؟</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  هل أنت متأكد من مسح كل الأسماء المحفوظة؟
                  <br />
                  هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse gap-2">
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  نعم، امسح الكل
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Names Preview */}
          {currentIndex > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {playerData.slice(0, currentIndex).map((data, i) => (
                <DropdownMenu key={i}>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={() => playSound('click')}
                      className="px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-sm flex items-center gap-2 transition-colors"
                    >
                      <span>{data.avatar}</span>
                      <span>{data.name}</span>
                      <Pencil size={12} className="text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="center" 
                    className="min-w-[200px] bg-card/95 backdrop-blur-md border-border/50 rounded-xl"
                  >
                    <DropdownMenuLabel className="text-muted-foreground text-center">
                      ✏️ تعديل اللاعب #{i + 1}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer flex items-center gap-2 justify-center"
                      onSelect={() => {
                        playSound('click');
                        // Go to this player's index to edit
                        const newPlayerData = [...playerData];
                        const trimmedName = inputValue.trim();
                        newPlayerData[currentIndex] = {
                          name: trimmedName || `لاعب ${currentIndex + 1}`,
                          avatar: selectedAvatar
                        };
                        setPlayerData(newPlayerData);
                        setCurrentIndex(i);
                        setInputValue(newPlayerData[i].name);
                        setSelectedAvatar(newPlayerData[i].avatar);
                      }}
                    >
                      <Pencil size={14} />
                      تعديل الاسم
                    </DropdownMenuItem>
                    {savedPlayers.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                          🔖 اختر من المحفوظين
                        </DropdownMenuLabel>
                        <div className="max-h-[150px] overflow-y-auto">
                          {savedPlayers.map((player) => (
                            <DropdownMenuItem
                              key={player.name}
                              className="cursor-pointer flex items-center gap-2"
                              onSelect={() => {
                                playSound('click');
                                const newPlayerData = [...playerData];
                                newPlayerData[i] = {
                                  name: player.name,
                                  avatar: player.avatar
                                };
                                setPlayerData(newPlayerData);
                              }}
                            >
                              <span>{player.avatar}</span>
                              <span>{player.name}</span>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <div className="flex gap-3">
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
          <div className="flex justify-center">
            <RestartButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerNamesScreen;