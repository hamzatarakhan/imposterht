import React, { useState } from 'react';
import { useCountries } from '@/context/CountriesGameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Loader2 } from 'lucide-react';

const CountriesCreateRoom: React.FC = () => {
  const { createRoom, setScreen } = useCountries();
  const { playSound, vibrate } = useSettings();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    playSound('click');
    vibrate(50);
    const code = await createRoom();
    if (!code) setLoading(false);
    // On success, context navigates to admin screen
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
          <span className="text-5xl mb-3 block">👑</span>
          <h2 className="text-2xl font-black text-foreground mb-2">إنشاء غرفة</h2>
          <p className="text-muted-foreground text-sm">أنت الـ Admin — تتحكم بكل شي!</p>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : '🚀'}
          {loading ? 'جاري الإنشاء...' : 'ابدأ الغرفة'}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          بعد الإنشاء راح يطلعلك كود تشاركه مع الباقين
        </p>
      </div>
    </div>
  );
};

export default CountriesCreateRoom;
