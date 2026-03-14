import React, { useState, useEffect } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Check, Loader2, Users } from 'lucide-react';
import OnlineRestartButton from './OnlineRestartButton';
import { useActiveSpeakers } from '@/context/ActiveSpeakersContext';
import { usePresence } from '@/context/PresenceContext';

const OnlineVotingScreen: React.FC = () => {
  const { room, players, currentPlayer, submitVote, calculateWinner, setScreen } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  const { activeSpeakers } = useActiveSpeakers();
  
  // Use room.imposter_count instead of counting from players (is_imposter is hidden for non-imposters)
  const impostorCount = room?.imposter_count || 1;
  
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if already voted
  useEffect(() => {
    if (currentPlayer?.voted_for) {
      setHasVoted(true);
      setSelectedPlayer(currentPlayer.voted_for);
    }
  }, [currentPlayer?.voted_for]);

  // Check if all players voted
  useEffect(() => {
    const allVoted = players.every(p => p.voted_for !== null);
    if (allVoted && players.length > 0) {
      // Calculate winner after a short delay
      setTimeout(() => {
        calculateWinner();
      }, 1000);
    }
  }, [players, calculateWinner]);

  const handleSelectPlayer = (playerId: string) => {
    if (hasVoted || playerId === currentPlayer?.player_id) return;
    playSound('click');
    vibrate(30);
    setSelectedPlayer(playerId);
  };

  const handleVote = async () => {
    if (!selectedPlayer || isSubmitting) return;
    
    playSound('click');
    vibrate(50);
    setIsSubmitting(true);
    
    await submitVote(selectedPlayer);
    setHasVoted(true);
    setIsSubmitting(false);
  };

  const handleBack = () => {
    playSound('click');
    vibrate(30);
    setScreen('onlineDiscussion');
  };

  const votedCount = players.filter(p => p.voted_for !== null).length;

  // Waiting screen after voting
  if (hasVoted) {
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
            تم تسجيل صوتك! ✅
          </h2>
          
          <p className="text-muted-foreground mb-8">
            انتظر باقي اللاعبين يصوتوا...
          </p>

          {/* Progress */}
          <div className="card-game">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>صوّتوا</span>
              </div>
              <span className="font-bold">{votedCount} / {players.length}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${(votedCount / players.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Players Status */}
          <div className="mt-4 space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  player.voted_for ? 'bg-accent/20' : 'bg-secondary/50'
                } ${activeSpeakers.includes(player.player_id) ? 'ring-2 ring-accent/50 shadow-md shadow-accent/10' : ''}`}
              >
                <span className="text-lg">{player.avatar}</span>
                <span className="flex-1 text-sm">{player.name}</span>
                {player.voted_for ? (
                  <Check size={16} className="text-accent" />
                ) : (
                  <Loader2 size={16} className="text-muted-foreground animate-spin" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30" />
      <div className="absolute top-1/4 right-10 w-32 h-32 bg-imposter/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
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
                مين تعتقد إنه الإمبوستر؟
              </p>
            </div>
          </div>
        </div>
        
        {/* Current Player Info */}
        <div className="card-game bg-primary/10 border-primary/30 mb-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <span className="text-3xl">{currentPlayer?.avatar || '👤'}</span>
          </div>
          <span className="text-2xl font-black text-gradient">
            {currentPlayer?.name}
          </span>
          <p className="text-sm text-muted-foreground mt-2">
            اختر من تشك فيه 🤔
          </p>
        </div>
        
        {/* Players List */}
        <div className="flex-1 space-y-3 overflow-auto">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => handleSelectPlayer(player.player_id)}
              disabled={player.player_id === currentPlayer?.player_id}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                player.player_id === currentPlayer?.player_id
                  ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                  : selectedPlayer === player.player_id
                  ? 'bg-imposter/20 border-2 border-imposter glow-imposter'
                  : 'bg-secondary hover:bg-secondary/80 border-2 border-transparent'
              } ${activeSpeakers.includes(player.player_id) ? 'ring-2 ring-accent/50 shadow-md shadow-accent/10' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedPlayer === player.player_id ? 'bg-imposter' : 'bg-card'
                }`}>
                  <span className="text-2xl">
                    {selectedPlayer === player.player_id ? '😈' : player.avatar}
                  </span>
                </div>
                <span className="font-bold text-lg">{player.name}</span>
              </div>
              
              {selectedPlayer === player.player_id && (
                <div className="w-8 h-8 rounded-full bg-imposter flex items-center justify-center">
                  <Check size={20} className="text-white" />
                </div>
              )}
              
              {player.player_id === currentPlayer?.player_id && (
                <span className="text-sm">(أنت)</span>
              )}
            </button>
          ))}
        </div>
        
        {/* Vote Button + Restart */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleVote}
            disabled={!selectedPlayer || isSubmitting}
            className={`w-full btn-imposter text-xl ${
              !selectedPlayer || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                جاري التصويت...
              </span>
            ) : (
              '✅ تأكيد التصويت'
            )}
          </button>
          
          <div className="flex justify-center">
            <OnlineRestartButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineVotingScreen;
