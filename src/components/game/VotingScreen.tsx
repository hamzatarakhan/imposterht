import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Check, Smartphone } from 'lucide-react';
import RestartButton from './RestartButton';

const VotingScreen: React.FC = () => {
  const { players, voteForPlayer, calculateResult, setScreen } = useGame();
  const { playSound, vibrate } = useSettings();
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [votingPlayerIndex, setVotingPlayerIndex] = useState(0);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [showPassPhone, setShowPassPhone] = useState(false);

  const currentVoter = players[votingPlayerIndex];
  const nextVoter = players[votingPlayerIndex + 1];
  const isLastVoter = votingPlayerIndex === players.length - 1;

  const handleSelectPlayer = (playerId: number) => {
    if (playerId === currentVoter?.id) return;
    playSound('click');
    vibrate(30);
    setSelectedPlayer(playerId);
  };

  const handleVote = () => {
    if (selectedPlayer === null) return;
    
    playSound('click');
    vibrate(50);
    
    // Record the vote
    voteForPlayer(selectedPlayer);
    setVotes(prev => ({
      ...prev,
      [selectedPlayer]: (prev[selectedPlayer] || 0) + 1
    }));
    
    if (isLastVoter) {
      // All votes collected, show results
      setTimeout(() => {
        calculateResult();
      }, 500);
    } else {
      // Show pass phone screen
      setShowPassPhone(true);
    }
  };

  const handleNextVoter = () => {
    playSound('click');
    vibrate(30);
    setVotingPlayerIndex(prev => prev + 1);
    setSelectedPlayer(null);
    setShowPassPhone(false);
  };

  const handleBack = () => {
    playSound('click');
    vibrate(30);
    setScreen('discussion');
  };

  // Pass phone screen between voters
  if (showPassPhone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center max-w-sm">
          {/* Success Icon */}
          <div className="mb-6 animate-reveal">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center glow-accent">
              <Check className="text-accent" size={40} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-accent mb-6 animate-slide-up">
            تم تسجيل صوتك! ✅
          </h2>
          
          {/* Pass phone instruction */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="mb-6 animate-float">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
                <Smartphone className="text-primary" size={40} />
              </div>
            </div>
            
            <h1 className="text-2xl font-black mb-4">
              مرّر الهاتف إلى
            </h1>
            
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <span className="text-3xl">{nextVoter?.avatar || '👤'}</span>
            </div>
            
            <div className="card-game mb-6 inline-block">
              <span className="text-3xl font-black text-gradient">
                {nextVoter?.name}
              </span>
            </div>
            
            <p className="text-muted-foreground mb-8">
              ليصوّت على من يعتقد أنه الإمبوستر 🗳️
            </p>
          </div>
          
          {/* Button */}
          <button
            onClick={handleNextVoter}
            className="w-full btn-primary-game text-xl animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            🗳️ بدء التصويت
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 pb-0 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30" />
      <div className="absolute top-1/4 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex-1 flex flex-col pb-36">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <ArrowRight size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">التصويت 🗳️</h1>
              <p className="text-sm text-muted-foreground">
                {votingPlayerIndex + 1} / {players.length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Current Voter */}
        <div className="card-game bg-primary/10 border-primary/30 mb-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <span className="text-3xl">{currentVoter?.avatar || '👤'}</span>
          </div>
          <p className="text-muted-foreground mb-1">دور</p>
          <span className="text-2xl font-black text-gradient">
            {currentVoter?.name}
          </span>
          <p className="text-sm text-muted-foreground mt-2">
            مين تعتقد إنه الإمبوستر؟ 🤔
          </p>
        </div>
        
        {/* Players List */}
        <div className="flex-1 space-y-3 overflow-auto">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => handleSelectPlayer(player.id)}
              disabled={player.id === currentVoter?.id}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                player.id === currentVoter?.id
                  ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                  : selectedPlayer === player.id
                  ? 'bg-imposter/20 border-2 border-imposter glow-imposter'
                  : 'bg-secondary hover:bg-secondary/80 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedPlayer === player.id ? 'bg-imposter' : 'bg-card'
                }`}>
                  <span className="text-2xl">
                    {selectedPlayer === player.id ? '😈' : player.avatar || '👤'}
                  </span>
                </div>
                <span className="font-bold text-lg">{player.name}</span>
              </div>
              
              {selectedPlayer === player.id && (
                <div className="w-8 h-8 rounded-full bg-imposter flex items-center justify-center">
                  <Check size={20} className="text-white" />
                </div>
              )}
              
              {player.id === currentVoter?.id && (
                <span className="text-sm">(أنت)</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Vote Button - Sticky */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border p-4">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handleVote}
            disabled={selectedPlayer === null}
            className={`w-full btn-imposter text-xl ${
              selectedPlayer === null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLastVoter ? '🎭 إظهار النتيجة' : '✅ تأكيد التصويت'}
          </button>
          <div className="flex justify-center">
            <RestartButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingScreen;