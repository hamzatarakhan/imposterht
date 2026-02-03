import React, { useState, useEffect } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { Eye, EyeOff, Check, Users } from 'lucide-react';

const OnlineShowRoleScreen: React.FC = () => {
  const { room, players, currentPlayer, markRoleSeen, moveToNextPlayer } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  
  const [showRole, setShowRole] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  // Check if current player has already seen their role
  useEffect(() => {
    if (currentPlayer?.has_seen_role) {
      setHasConfirmed(true);
    }
  }, [currentPlayer?.has_seen_role]);

  const handleShowRole = () => {
    playSound('click');
    vibrate(50);
    setShowRole(true);
  };

  const handleConfirm = async () => {
    playSound('click');
    vibrate(50);
    setHasConfirmed(true);
    await markRoleSeen();
    await moveToNextPlayer();
  };

  const playersWhoSaw = players.filter(p => p.has_seen_role).length;
  const allPlayersSaw = playersWhoSaw === players.length;

  // If all players have seen their roles, show waiting screen
  if (hasConfirmed && !allPlayersSaw) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
        
        <div className="relative z-10 text-center max-w-sm">
          <div className="mb-6 animate-reveal">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center glow-accent">
              <Check className="text-accent" size={40} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-accent mb-4">
            شفت دورك! ✅
          </h2>
          
          <p className="text-muted-foreground mb-8">
            انتظر باقي اللاعبين يشوفوا أدوارهم...
          </p>

          {/* Progress */}
          <div className="card-game">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>اللاعبين</span>
              </div>
              <span className="font-bold">{playersWhoSaw} / {players.length}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${(playersWhoSaw / players.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Players Status */}
          <div className="mt-4 space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  player.has_seen_role ? 'bg-accent/20' : 'bg-secondary/50'
                }`}
              >
                <span className="text-lg">{player.avatar}</span>
                <span className="flex-1 text-sm">{player.name}</span>
                {player.has_seen_role ? (
                  <Check size={16} className="text-accent" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If hasn't confirmed yet, show role reveal screen
  if (!hasConfirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center max-w-sm w-full">
          {/* Player Info */}
          <div className="mb-6 animate-float">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center glow-primary">
              <span className="text-5xl">{currentPlayer?.avatar || '👤'}</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            {currentPlayer?.name}
          </h1>
          <p className="text-muted-foreground mb-8">
            اضغط لكشف دورك 🤫
          </p>

          {/* Role Card */}
          <div 
            className={`card-game p-8 mb-8 transition-all duration-500 ${
              showRole 
                ? currentPlayer?.is_imposter 
                  ? 'bg-imposter/20 border-imposter glow-imposter' 
                  : 'bg-primary/20 border-primary glow-primary'
                : 'bg-secondary'
            }`}
          >
            {showRole ? (
              <div className="animate-reveal">
                {currentPlayer?.is_imposter ? (
                  <>
                    <div className="text-6xl mb-4">😈</div>
                    <h2 className="text-3xl font-black text-imposter mb-2">إمبوستر!</h2>
                    <p className="text-muted-foreground">
                      حاول تعرف الكلمة من كلام الباقين
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">🎯</div>
                    <h2 className="text-2xl font-black text-primary mb-2">الكلمة السرية</h2>
                    <div className="card-game bg-card/50 inline-block px-6 py-3">
                      <span className="text-3xl font-black text-gradient">
                        {room?.secret_word}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={handleShowRole}
                className="w-full py-8 flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Eye size={32} className="text-primary" />
                </div>
                <span className="text-xl font-bold">👁️ اضغط لكشف دورك</span>
              </button>
            )}
          </div>

          {/* Confirm Button */}
          {showRole && (
            <button
              onClick={handleConfirm}
              className="w-full btn-primary-game text-xl animate-slide-up"
            >
              ✅ فهمت! متابعة
            </button>
          )}
        </div>
      </div>
    );
  }

  // All players saw - this state is now handled by auto-navigation in context
  // Show a brief transition message
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      
      <div className="relative z-10 text-center">
        <div className="mb-6 animate-float">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
            <Check className="text-accent" size={40} />
          </div>
        </div>
        <h2 className="text-2xl font-bold">الكل شافوا أدوارهم! 🎉</h2>
        <p className="text-muted-foreground mt-2">جاري الانتقال للنقاش...</p>
      </div>
    </div>
  );
};

export default OnlineShowRoleScreen;
