import React, { useState } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Loader2 } from 'lucide-react';
import { AVATAR_OPTIONS } from '@/context/GameContext';

const JoinRoomScreen: React.FC = () => {
  const { setScreen, joinRoom } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!name.trim() || !code.trim() || isJoining) return;
    
    playSound('click');
    vibrate(50);
    setIsJoining(true);
    setError('');

    const result = await joinRoom(code.trim(), name.trim(), avatar);

    if (!result.success) {
      setError(result.error || 'فشل الانضمام');
      setIsJoining(false);
      vibrate(100);
    }
  };

  const handleBack = () => {
    playSound('click');
    vibrate(30);
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

          {/* Avatar Selection */}
          <div className="card-game">
            <label className="block text-sm font-medium mb-2">الأفاتار</label>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  onClick={() => {
                    playSound('click');
                    setAvatar(av);
                  }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    avatar === av
                      ? 'bg-primary scale-110'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Buttons */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border p-4 space-y-3 max-w-md mx-auto">
          <button
            onClick={handleJoin}
            disabled={!name.trim() || code.length !== 6 || isJoining}
            className={`w-full btn-accent text-xl ${
              !name.trim() || code.length !== 6 || isJoining ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isJoining ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                جاري الانضمام...
              </span>
            ) : (
              '🚪 انضم للغرفة'
            )}
          </button>
          
          <button
            onClick={handleCreateInstead}
            className="w-full p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors text-center"
          >
            ما عندك كود؟ <span className="text-accent font-bold">أنشئ غرفة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomScreen;
