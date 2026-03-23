import React, { useState } from 'react';
import { useCountries } from '@/context/CountriesGameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Loader2 } from 'lucide-react';

const CountriesJoinRoom: React.FC = () => {
  const { joinRoom, setScreen } = useCountries();
  const { playSound, vibrate } = useSettings();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (code.trim().length < 4) return;
    setLoading(true);
    setError('');
    playSound('click');
    vibrate(50);
    const success = await joinRoom(code.trim());
    if (!success) {
      setError('ما لقينا غرفة بهاد الكود 😕');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />

      <div className="relative z-10 w-full max-w-sm">
        <button
          onClick={() => { playSound('click'); vibrate(30); setScreen('countriesModeSelect'); }}
          className="mb-8 p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight size={24} />
        </button>

        <div className="text-center mb-10">
          <span className="text-5xl mb-3 block">👀</span>
          <h2 className="text-2xl font-black text-foreground mb-2">انضمام كمتابع</h2>
          <p className="text-muted-foreground text-sm">أدخل كود الغرفة من الـ Admin</p>
        </div>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="كود الغرفة"
          maxLength={6}
          className="w-full text-center text-2xl font-black tracking-[0.5em] py-4 px-3 rounded-2xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50 placeholder:tracking-normal placeholder:text-lg mb-4"
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
        />

        {error && <p className="text-center text-sm text-destructive mb-4">{error}</p>}

        <button
          onClick={handleJoin}
          disabled={loading || code.trim().length < 4}
          className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : '🔍'}
          {loading ? 'جاري البحث...' : 'انضمام'}
        </button>
      </div>
    </div>
  );
};

export default CountriesJoinRoom;
