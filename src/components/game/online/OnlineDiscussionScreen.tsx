import React, { useState, useEffect } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { Clock, Users, MessageSquare } from 'lucide-react';

const OnlineDiscussionScreen: React.FC = () => {
  const { room, players, isHost, setScreen } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  
  const [timeLeft, setTimeLeft] = useState(room?.discussion_time || 90);
  const [timerActive, setTimerActive] = useState(room?.discussion_time_enabled || false);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playSound('click');
          vibrate(200);
          setTimerActive(false);
          return 0;
        }
        if (prev === 11) {
          playSound('click');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, playSound, vibrate]);

  const handleGoToVoting = () => {
    playSound('click');
    vibrate(50);
    setScreen('onlineVoting');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const impostorCount = players.filter(p => p.is_imposter).length;

  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-1/4 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquare size={24} className="text-accent" />
              <h1 className="text-2xl font-bold">وقت النقاش! 🗣️</h1>
            </div>
            <p className="text-muted-foreground">
              ناقشوا واكتشفوا الإمبوستر
            </p>
          </div>
        </div>

        {/* Timer */}
        {room?.discussion_time_enabled && (
          <div className={`card-game mb-6 text-center ${
            timeLeft <= 10 ? 'border-imposter animate-pulse' : 'border-accent'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock size={20} className={timeLeft <= 10 ? 'text-imposter' : 'text-accent'} />
              <span className="text-sm text-muted-foreground">الوقت المتبقي</span>
            </div>
            <span className={`text-5xl font-mono font-black ${
              timeLeft <= 10 ? 'text-imposter' : 'text-gradient'
            }`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}

        {/* Game Info */}
        <div className="card-game mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span>اللاعبين</span>
            </div>
            <span className="font-bold">{players.length}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span>😈</span>
              <span>الإمبوسترز</span>
            </div>
            <span className="font-bold text-imposter">{impostorCount}</span>
          </div>
        </div>

        {/* Players */}
        <div className="card-game flex-1 mb-6">
          <h3 className="font-bold mb-3">اللاعبين في الغرفة</h3>
          <div className="grid grid-cols-2 gap-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-2 p-2 rounded-xl bg-secondary"
              >
                <span className="text-xl">{player.avatar}</span>
                <span className="text-sm font-medium truncate">{player.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Discussion Tips */}
        <div className="card-game bg-accent/10 border-accent/30 mb-6">
          <h3 className="font-bold mb-2">💡 نصائح للنقاش</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• اسأل كل لاعب عن الكلمة بطريقة غير مباشرة</li>
            <li>• انتبه لردود الفعل والتردد في الإجابة</li>
            <li>• الإمبوستر ما يعرف الكلمة - راقب من يتهرب</li>
          </ul>
        </div>

        {/* Vote Button */}
        <button
          onClick={handleGoToVoting}
          className="w-full btn-imposter text-xl"
        >
          🗳️ بدء التصويت
        </button>
      </div>
    </div>
  );
};

export default OnlineDiscussionScreen;
