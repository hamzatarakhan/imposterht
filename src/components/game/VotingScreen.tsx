import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { ArrowRight, Check } from 'lucide-react';

const VotingScreen: React.FC = () => {
  const { players, voteForPlayer, calculateResult, setScreen } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [votingPlayerIndex, setVotingPlayerIndex] = useState(0);
  const [votes, setVotes] = useState<Record<number, number>>({});

  const currentVoter = players[votingPlayerIndex];
  const isLastVoter = votingPlayerIndex === players.length - 1;

  const handleVote = () => {
    if (selectedPlayer === null) return;
    
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
      // Next voter
      setVotingPlayerIndex(prev => prev + 1);
      setSelectedPlayer(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30" />
      <div className="absolute top-1/4 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setScreen('discussion')}
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
        
        {/* Current Voter */}
        <div className="card-game bg-primary/10 border-primary/30 mb-6 text-center">
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
              onClick={() => setSelectedPlayer(player.id)}
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
                    {player.id === currentVoter?.id ? '🙋' : 
                     selectedPlayer === player.id ? '😈' : '👤'}
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
        
        {/* Vote Button */}
        <div className="mt-6">
          <button
            onClick={handleVote}
            disabled={selectedPlayer === null}
            className={`w-full btn-imposter text-xl ${
              selectedPlayer === null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLastVoter ? '🎭 إظهار النتيجة' : '✅ تأكيد التصويت'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingScreen;
