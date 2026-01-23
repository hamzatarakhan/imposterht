import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Play, HelpCircle, Settings, Users, X, Trash2 } from 'lucide-react';
import { useSavedPlayers } from '@/hooks/useSavedPlayers';
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

const HomeScreen: React.FC = () => {
  const { setScreen } = useGame();
  const { savedPlayers, removePlayer, clearAllPlayers } = useSavedPlayers();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const handleRemovePlayer = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    removePlayer(name);
  };

  const handleClearAll = () => {
    clearAllPlayers();
    setShowDeleteAllDialog(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-40 h-40 bg-imposter/10 rounded-full blur-3xl" />
      
      
      {/* Header Icons */}
      <div className="relative z-10 flex justify-between">
        <button 
          onClick={() => setScreen('settings')}
          className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings size={24} />
        </button>

        {/* Saved Players Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors relative">
              <Users size={24} />
              {savedPlayers.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                  {savedPlayers.length}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="min-w-[220px] bg-card/95 backdrop-blur-md border-border/50 rounded-xl"
          >
            <DropdownMenuLabel className="text-muted-foreground flex items-center gap-2">
              👥 اللاعبين المحفوظين
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {savedPlayers.length === 0 ? (
              <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                لا يوجد لاعبين محفوظين
                <br />
                <span className="text-xs">ابدأ لعبة وأضف أسماء!</span>
              </div>
            ) : (
              <>
                <div className="max-h-[250px] overflow-y-auto">
                  {savedPlayers.map((player) => (
                    <DropdownMenuItem
                      key={player.name}
                      className="flex items-center justify-between cursor-default"
                      onSelect={(e) => e.preventDefault()}
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
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
      
      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Logo with Icon */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4 animate-float">
            <span className="text-7xl drop-shadow-2xl">😈</span>
          </div>
          <h1 className="text-5xl font-black text-gradient mb-2">IMPOSTER</h1>
          <p className="text-muted-foreground">لعبة الإمبوستر الجماعية</p>
        </div>
        
        {/* Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => setScreen('setup')}
            className="w-full btn-primary-game flex items-center justify-center gap-3 text-xl"
          >
            <Play size={28} fill="currentColor" />
            ابدأ لعبة جديدة
          </button>
          
          <button
            onClick={() => setScreen('howToPlay')}
            className="w-full btn-secondary-game flex items-center justify-center gap-3"
          >
            <HelpCircle size={24} />
            طريقة اللعب
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 text-center py-4">
        <p className="text-sm text-muted-foreground">
          العبوا مع بعض في نفس المكان 🎮
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;
