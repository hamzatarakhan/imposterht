import React, { useState } from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import { AVATAR_OPTIONS } from '@/context/GameContext';
import { useUserName } from '@/hooks/useUserName';
import { ArrowRight } from 'lucide-react';

const GuessingJoinRoomScreen: React.FC = () => {
  const { joinRoom, setScreen, pendingJoinCode, clearPendingJoinCode } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();
  const { name, setName, avatar, setAvatar, persist } = useUserName('👤');

  const [code, setCode] = useState(pendingJoinCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!name.trim() || !code.trim() || loading) return;
    setLoading(true); setError('');
    playSound('click'); vibrate(50);
    const result = await joinRoom(code.trim(), name.trim(), avatar);
    if (!result.success) { setError(result.error || 'فشل الانضمام'); setLoading(false); }
    else { persist(name.trim(), avatar); }
    clearPendingJoinCode();
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
        <button onClick={() => { playSound('click'); setScreen('guessingCreateRoom'); }}
          className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black">🔗 انضمام لغرفة تخمين</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="card-game w-full max-w-sm space-y-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <button onClick={() => {
              playSound('click');
              const idx = AVATAR_OPTIONS.indexOf(avatar);
              setAvatar(AVATAR_OPTIONS[(idx + 1) % AVATAR_OPTIONS.length]);
            }} className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl hover:scale-110 transition-transform">
              {avatar}
            </button>
          </div>

          {/* Name */}
          <input type="text" value={name} onChange={(e) => setName(e.target.value.slice(0, 20))}
            placeholder="اسمك" maxLength={20}
            className="w-full text-center text-lg font-bold py-3 px-4 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
          />

          {/* Code */}
          {!pendingJoinCode && (
            <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="كود الغرفة" maxLength={6}
              className="w-full text-center text-2xl font-black tracking-[0.3em] py-3 px-4 rounded-xl bg-secondary border-2 border-transparent focus:border-accent focus:outline-none transition-all placeholder:text-muted-foreground/50 placeholder:tracking-normal placeholder:text-lg"
            />
          )}

          {error && <p className="text-destructive text-sm text-center font-bold">{error}</p>}

          <button onClick={handleJoin} disabled={!name.trim() || code.length < 6 || loading}
            className="w-full btn-primary-game text-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? '⏳ جاري الانضمام...' : '🚀 انضمام'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingJoinRoomScreen;
