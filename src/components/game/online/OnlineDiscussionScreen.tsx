import React, { useState, useEffect, useRef } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { Clock, Users, MessageSquare, ArrowRight, Play, Pause, RotateCcw, Vote } from 'lucide-react';
import OnlineRestartButton from './OnlineRestartButton';

const OnlineDiscussionScreen: React.FC = () => {
  const { room, players, isHost, setScreen, leaveRoom, startDiscussion } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  
  const [timeLeft, setTimeLeft] = useState(room?.discussion_time || 90);
  const [isRunning, setIsRunning] = useState(false);
  const lastTimeRef = useRef(timeLeft);
  const hasPlayedAlarmRef = useRef(false);

  // Timer countdown - only when manually started
  useEffect(() => {
    if (!room?.discussion_time_enabled || !isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        if (newTime > 0 && newTime !== lastTimeRef.current) {
          playSound('tick');
          if (newTime <= 10) {
            vibrate(100);
          }
        }
        
        lastTimeRef.current = newTime;
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, room?.discussion_time_enabled, playSound, vibrate]);

  // Handle timer end
  useEffect(() => {
    if (timeLeft === 0 && !hasPlayedAlarmRef.current) {
      setIsRunning(false);
      playSound('alarm');
      vibrate([200, 100, 200, 100, 200]);
      hasPlayedAlarmRef.current = true;
    }
  }, [timeLeft, playSound, vibrate]);

  const handleGoToVoting = async () => {
    playSound('click');
    vibrate(50);
    // Update room status to 'voting' so all players navigate to voting screen
    await startDiscussion();
    setScreen('onlineVoting');
  };

  const handleBack = async () => {
    playSound('click');
    vibrate(30);
    await leaveRoom();
  };

  const handlePlayPause = () => {
    playSound('click');
    vibrate(30);
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    playSound('click');
    vibrate(50);
    setTimeLeft(room?.discussion_time || 90);
    setIsRunning(false);
    hasPlayedAlarmRef.current = false;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const impostorCount = players.filter(p => p.is_imposter).length;
  const progress = room?.discussion_time ? (timeLeft / room.discussion_time) * 100 : 100;

  // UI without timer
  if (!room?.discussion_time_enabled) {
    return (
      <div className="min-h-screen flex flex-col p-6 pt-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
        <div className="absolute top-1/4 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header with back button */}
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <ArrowRight size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">نقاش حر 🗣️</h1>
                <p className="text-sm text-muted-foreground">
                  ناقشوا واكتشفوا الإمبوستر
                </p>
              </div>
            </div>
          </div>

          {/* Large Icon */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-primary/20 flex items-center justify-center mb-8 animate-pulse">
              <MessageSquare size={80} className="text-primary" />
            </div>
            
            {/* Hints */}
            <div className="text-center space-y-3 max-w-sm">
              <p className="text-muted-foreground">
                كل لاعب يعطي تلميح عن الكلمة 🎯
              </p>
              <p className="text-sm text-muted-foreground/70">
                الإمبوستر يحاول يندمج!
              </p>
            </div>
          </div>

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

          {/* Vote Button + Restart - Only host can start voting */}
          <div className="space-y-3">
            {isHost ? (
              <button
                onClick={handleGoToVoting}
                className="w-full btn-imposter text-xl flex items-center justify-center gap-2"
              >
                <Vote size={24} />
                بدء التصويت
              </button>
            ) : (
              <div className="w-full p-4 rounded-2xl bg-secondary/50 text-center">
                <p className="text-muted-foreground">⏳ انتظر الهوست ليبدأ التصويت</p>
              </div>
            )}
            
            <div className="flex justify-center">
              <OnlineRestartButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UI with timer
  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-1/4 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Pulsing effect when time is low */}
      {timeLeft <= 10 && timeLeft > 0 && (
        <div className="absolute inset-0 bg-imposter/10 animate-pulse" />
      )}
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header with back button */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <ArrowRight size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">وقت النقاش 💬</h1>
              <p className="text-sm text-muted-foreground">
                ناقشوا واكتشفوا الإمبوستر
              </p>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Circular progress */}
          <div className="relative w-64 h-64 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="12"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke={timeLeft <= 10 ? 'hsl(var(--imposter))' : 'hsl(var(--primary))'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-black ${timeLeft <= 10 ? 'text-imposter animate-pulse' : ''}`}>
                {formatTime(timeLeft)}
              </span>
              {timeLeft === 0 && (
                <span className="text-lg text-imposter mt-2">انتهى الوقت! ⏰</span>
              )}
            </div>
          </div>
          
          {/* Controls - Only host can control timer */}
          {isHost ? (
            <div className="flex gap-4 mb-6">
              <button
                onClick={handlePlayPause}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  isRunning 
                    ? 'bg-secondary text-foreground' 
                    : 'bg-primary text-primary-foreground glow-primary'
                }`}
                disabled={timeLeft === 0}
              >
                {isRunning ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
              </button>
              
              <button
                onClick={handleResetTimer}
                className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <RotateCcw size={28} />
              </button>
            </div>
          ) : (
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground">🎮 الهوست يتحكم بالوقت</p>
            </div>
          )}
          
          {/* Hint */}
          <div className="text-center mb-4">
            <p className="text-muted-foreground">
              كل لاعب يعطي تلميح عن الكلمة 🎯
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              الإمبوستر يحاول يندمج!
            </p>
          </div>
        </div>

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

        {/* Vote Button + Restart - Only host can start voting */}
        <div className="space-y-3">
          {isHost ? (
            <button
              onClick={handleGoToVoting}
              className="w-full btn-imposter text-xl flex items-center justify-center gap-2"
            >
              <Vote size={24} />
              بدء التصويت
            </button>
          ) : (
            <div className="w-full p-4 rounded-2xl bg-secondary/50 text-center">
              <p className="text-muted-foreground">⏳ انتظر الهوست ليبدأ التصويت</p>
            </div>
          )}
          
          <div className="flex justify-center">
            <OnlineRestartButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineDiscussionScreen;
