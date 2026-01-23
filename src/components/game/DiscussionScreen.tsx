import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Play, Pause, RotateCcw, Vote } from 'lucide-react';

const DiscussionScreen: React.FC = () => {
  const { discussionTime, setScreen } = useGame();
  const [timeLeft, setTimeLeft] = useState(discussionTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    const percentage = timeLeft / discussionTime;
    if (percentage > 0.5) return 'bg-accent';
    if (percentage > 0.25) return 'bg-primary';
    return 'bg-imposter';
  };

  const handleResetTimer = () => {
    setTimeLeft(discussionTime);
    setIsRunning(false);
  };

  const progress = (timeLeft / discussionTime) * 100;

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30" />
      
      {/* Pulsing effect when time is low */}
      {timeLeft <= 10 && timeLeft > 0 && (
        <div className="absolute inset-0 bg-imposter/10 animate-pulse" />
      )}
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black">وقت النقاش 💬</h1>
        </div>
        
        {/* Timer */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Circular progress */}
          <div className="relative w-64 h-64 mb-8">
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
          
          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
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
          
          {/* Hint */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              كل لاعب يعطي تلميح عن الكلمة 🎯
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              الإمبوستر يحاول يندمج!
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => setScreen('voting')}
            className="w-full btn-primary-game flex items-center justify-center gap-3"
          >
            <Vote size={24} />
            الانتقال للتصويت
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionScreen;
