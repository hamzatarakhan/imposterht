import { useState, useCallback } from 'react';

export interface PlayerScore {
  playerId: string | number;
  name: string;
  avatar: string;
  score: number;
  gamesPlayed: number;
  gamesWon: number;
}

export const usePlayerScores = () => {
  const [scores, setScores] = useState<PlayerScore[]>([]);

  const initializeScores = useCallback((players: Array<{ id: string | number; name: string; avatar: string }>) => {
    setScores(prevScores => {
      const newScores: PlayerScore[] = [];
      
      players.forEach(player => {
        const existingScore = prevScores.find(s => s.playerId === player.id);
        if (existingScore) {
          newScores.push(existingScore);
        } else {
          newScores.push({
            playerId: player.id,
            name: player.name,
            avatar: player.avatar,
            score: 0,
            gamesPlayed: 0,
            gamesWon: 0,
          });
        }
      });
      
      return newScores;
    });
  }, []);

  const updateScoresAfterRound = useCallback((
    winner: 'players' | 'imposters',
    players: Array<{ id: string | number; name: string; avatar: string; isImposter: boolean }>
  ) => {
    setScores(prevScores => {
      return prevScores.map(score => {
        const player = players.find(p => p.id === score.playerId);
        if (!player) return score;

        const isWinner = winner === 'players' ? !player.isImposter : player.isImposter;
        const pointsEarned = isWinner ? (player.isImposter ? 3 : 1) : 0;

        return {
          ...score,
          score: score.score + pointsEarned,
          gamesPlayed: score.gamesPlayed + 1,
          gamesWon: score.gamesWon + (isWinner ? 1 : 0),
        };
      });
    });
  }, []);

  const resetScores = useCallback(() => {
    setScores([]);
  }, []);

  const getLeaderboard = useCallback(() => {
    return [...scores].sort((a, b) => b.score - a.score);
  }, [scores]);

  return {
    scores,
    initializeScores,
    updateScoresAfterRound,
    resetScores,
    getLeaderboard,
  };
};
