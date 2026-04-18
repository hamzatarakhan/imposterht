import React, { useState, useEffect } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Loader2 } from 'lucide-react';
import { AVATAR_OPTIONS } from '@/context/GameContext';
import { useUserName } from '@/hooks/useUserName';
import OnlineRestartButton from './OnlineRestartButton';

const JoinRoomScreen: React.FC = () => {
  const { setScreen, joinRoom, pendingJoinCode, clearPendingJoinCode } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  const { name, setName, avatar, persist } = useUserName('👤');
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isFromLink, setIsFromLink] = useState(false);

  // Pre-fill code from URL if available and mark as from link
  useEffect(() => {
    if (pendingJoinCode) {
      setCode(pendingJoinCode);
      setIsFromLink(true);
      clearPendingJoinCode();
    }
  }, [pendingJoinCode, clearPendingJoinCode]);

  const handleJoin = async () => {
    if (!name.trim() || !code.trim() || isJoining) return;
    
    playSound('click');
    vibrate(50);
    setIsJoining(true);
    setError('');

    const result = await joinRoom(code.trim(), name.trim(), avatar);

    if (result.success) {
      persist(name.trim(), avatar);
    } else {
      setError(result.error || 'فشل الانضمام');
      setIsJoining(false);
      vibrate(100);
    }
  };

  const handleBack = () => {
    playSound('click');
    vibrate(30);
    if (isFromLink) {
      // If came from link, go to mode select instead
      setIsFromLink(false);
      setCode('');
    }
    setScreen('modeSelect');
  };

  const handleCreateInstead = () => {
    playSound('click');
    vibrate(30);
    setScreen('createRoom');
  };

  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    setCode(cleaned);
    setError('');
  };

  // Simplified UI when coming from a shared link
  if (isFromLink) {
    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <ArrowRight size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">🎉 تمت دعوتك!</h1>
                <p className="text-sm text-muted-foreground">أدخل اسمك للانضمام للغرفة</p>
              </div>
            </div>
          </div>

          {/* Simplified Form - Only Name */}
          <div className="flex-1 flex flex-col justify-center space-y-6 px-6 pb-48">
            {/* Room Code Display */}
            <div className="card-game bg-gradient-to-br from-accent/20 to-primary/20 text-center">
              <p className="text-sm text-muted-foreground mb-2">كود الغرفة</p>
              <span className="text-3xl font-mono font-black tracking-[0.3em] text-gradient">
                {code}
              </span>
            </div>

            {/* Name Input */}
            <div className="card-game">
              <label className="block text-sm font-medium mb-2">اسمك</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك..."
                className="w-full p-4 rounded-xl bg-secondary border-2 border-transparent focus:border-primary outline-none text-center text-xl"
                maxLength={20}
                autoFocus
              />
              {error && (
                <p className="text-imposter text-center mt-2 text-sm">{error}</p>
              )}
            </div>
          </div>

          {/* Sticky Join Button */}
          <div className="fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="w-full max-w-md mx-auto">
              <button
                onClick={handleJoin}
                disabled={!name.trim() || isJoining}
                className={`w-full p-4 rounded-xl font-bold text-lg transition-all ${
                  !name.trim() || isJoining 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-gradient-to-r from-accent to-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_hsl(var(--accent)/0.4)]'
                }`}
              >
                {isJoining ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    جاري الانضمام...
                  </span>
                ) : (
                  '🚀 انضم للعبة'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <ArrowRight size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">انضم لغرفة 🎯</h1>
              <p className="text-sm text-muted-foreground">أدخل كود الغرفة للانضمام</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center space-y-6 px-6 pb-48">
          {/* Room Code Input */}
          <div className="card-game">
            <label className="block text-sm font-medium mb-3 text-center">كود الغرفة</label>
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="XXXXXX"
              className="w-full p-4 rounded-xl bg-secondary border-2 border-transparent focus:border-accent outline-none text-center text-3xl font-mono tracking-widest uppercase"
              maxLength={6}
            />
            {error && (
              <p className="text-imposter text-center mt-2 text-sm">{error}</p>
            )}
          </div>

          {/* Name Input */}
          <div className="card-game">
            <label className="block text-sm font-medium mb-2">اسمك</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك..."
              className="w-full p-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary outline-none text-center text-lg"
              maxLength={20}
            />
          </div>

          {/* Avatar Selection - Hidden for now */}
        </div>

        {/* Sticky Buttons */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="w-full max-w-md mx-auto space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleJoin}
                disabled={!name.trim() || code.length !== 6 || isJoining}
                className={`flex-1 p-3 rounded-xl font-bold text-sm transition-all ${
                  !name.trim() || code.length !== 6 || isJoining 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary to-orange-500 text-primary-foreground hover:brightness-110 shadow-[0_0_15px_hsl(var(--primary)/0.3)]'
                }`}
              >
                {isJoining ? (
                  <span className="flex items-center justify-center gap-1">
                    <Loader2 className="animate-spin" size={16} />
                    جاري...
                  </span>
                ) : (
                  '🚪 انضم للغرفة'
                )}
              </button>
              
              <button
                onClick={handleCreateInstead}
                className="flex-1 p-3 rounded-xl bg-card border-2 border-accent text-accent font-bold text-sm transition-all hover:bg-accent hover:text-accent-foreground"
              >
                ✨ أنشئ غرفة
              </button>
            </div>
            
            <div className="flex justify-center">
              <OnlineRestartButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomScreen;
