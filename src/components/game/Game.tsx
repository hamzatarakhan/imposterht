import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { RotateCcw, X } from 'lucide-react';
import SplashScreen from './SplashScreen';
import HomeScreen from './HomeScreen';
import HowToPlayScreen from './HowToPlayScreen';
import SetupScreen from './SetupScreen';
import PlayerNamesScreen from './PlayerNamesScreen';
import PassPhoneScreen from './PassPhoneScreen';
import ShowRoleScreen from './ShowRoleScreen';
import DiscussionScreen from './DiscussionScreen';
import VotingScreen from './VotingScreen';
import ResultScreen from './ResultScreen';

const Game: React.FC = () => {
  const { screen, resetGame } = useGame();
  const [showConfirm, setShowConfirm] = useState(false);

  const screens = {
    splash: SplashScreen,
    home: HomeScreen,
    howToPlay: HowToPlayScreen,
    setup: SetupScreen,
    playerNames: PlayerNamesScreen,
    passPhone: PassPhoneScreen,
    showRole: ShowRoleScreen,
    discussion: DiscussionScreen,
    voting: VotingScreen,
    result: ResultScreen,
  };

  const CurrentScreen = screens[screen];
  
  // Screens where restart button should NOT appear
  const hideRestartOn = ['splash', 'home', 'howToPlay'];
  const showRestartButton = !hideRestartOn.includes(screen);

  const handleRestart = () => {
    setShowConfirm(false);
    resetGame();
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      <CurrentScreen />
      
      {/* Floating Restart Button */}
      {showRestartButton && !showConfirm && (
        <button
          onClick={() => setShowConfirm(true)}
          className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-secondary/90 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-lg hover:bg-secondary transition-all z-50 animate-slide-up"
          title="إعادة اللعبة"
        >
          <RotateCcw size={24} className="text-muted-foreground" />
        </button>
      )}
      
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="card-game max-w-sm w-full text-center animate-reveal">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <RotateCcw size={32} className="text-destructive" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">إعادة اللعبة؟</h2>
            <p className="text-muted-foreground mb-6">
              سيتم إنهاء اللعبة الحالية والعودة للبداية
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 btn-secondary-game flex items-center justify-center gap-2"
              >
                <X size={20} />
                إلغاء
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 btn-imposter flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                إعادة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
