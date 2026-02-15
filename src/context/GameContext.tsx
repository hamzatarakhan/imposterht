import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Category, getRandomWord, getSimilarWords } from '@/data/words';

export type GameScreen = 
  | 'splash'
  | 'hub'
  | 'home'
  | 'settings'
  | 'howToPlay'
  | 'modeSelect'
  | 'setup'
  | 'playerNames'
  | 'passPhone'
  | 'showRole'
  | 'discussion'
  | 'voting'
  | 'wordGuess'
  | 'result'
  | 'guessingSetup'
  | 'guessingModeSelect';

export interface Player {
  id: number;
  name: string;
  avatar: string;
  isImposter: boolean;
  hasSeenRole: boolean;
  votes: number;
  votedFor: number | null;
}

export interface PlayerScore {
  playerId: number;
  name: string;
  avatar: string;
  score: number;
  roundsPlayed: number;
  roundsWon: number;
  correctVotes: number;
  imposterWins: number;
}

export const AVATAR_OPTIONS = [
  '👤', '😎', '🦊', '🐱', '🐶', '🦁', '🐼', '🐨', 
  '🦄', '🐸', '🐵', '🐰', '🐻', '🐯', '🦋', '🌟'
];

interface GameState {
  screen: GameScreen;
  playerCount: number;
  imposterCount: number;
  categories: Category[];
  customWords: string[];
  players: Player[];
  playerNames: string[];
  currentPlayerIndex: number;
  secretWord: string;
  usedWords: string[];
  discussionTimeEnabled: boolean;
  discussionTime: number;
  winner: 'imposters' | 'players' | null;
  playerScores: PlayerScore[];
  roundNumber: number;
  wordGuessOptions: string[];
  wordGuessed: boolean | null;
}

interface PlayerData {
  name: string;
  avatar: string;
}

interface GameContextType extends GameState {
  setScreen: (screen: GameScreen) => void;
  setPlayerCount: (count: number) => void;
  setImposterCount: (count: number) => void;
  setCategories: (categories: Category[]) => void;
  toggleCategory: (category: Category) => void;
  setCustomWords: (words: string[]) => void;
  setDiscussionTimeEnabled: (enabled: boolean) => void;
  setDiscussionTime: (time: number) => void;
  setPlayerNames: (names: string[]) => void;
  goToPlayerNames: () => void;
  startGame: (playerData?: PlayerData[]) => void;
  nextPlayer: () => void;
  markPlayerAsSeen: () => void;
  voteForPlayer: (playerId: number) => void;
  calculateResult: () => void;
  resetGame: () => void;
  playAgain: () => void;
  resetScores: () => void;
  getLeaderboard: () => PlayerScore[];
  submitWordGuess: (word: string) => void;
  skipWordGuess: () => void;
}

const initialState: GameState = {
  screen: 'splash',
  playerCount: 4,
  imposterCount: 1,
  categories: ['random'],
  customWords: [],
  players: [],
  playerNames: [],
  currentPlayerIndex: 0,
  secretWord: '',
  usedWords: [],
  discussionTimeEnabled: true,
  discussionTime: 90,
  winner: null,
  playerScores: [],
  roundNumber: 1,
  wordGuessOptions: [],
  wordGuessed: null,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(initialState);

  const setScreen = (screen: GameScreen) => {
    setState(prev => ({ ...prev, screen }));
  };

  const setPlayerCount = (count: number) => {
    setState(prev => ({
      ...prev,
      playerCount: count,
      // Auto-reset imposter count to 1 if less than 4 players
      imposterCount: count < 4 ? 1 : prev.imposterCount,
    }));
  };

  const setImposterCount = (count: number) => {
    setState(prev => ({ ...prev, imposterCount: count }));
  };

  const setCategories = (categories: Category[]) => {
    setState(prev => ({ ...prev, categories }));
  };

  const toggleCategory = (category: Category) => {
    setState(prev => {
      const currentCategories = prev.categories;
      
      // If clicking 'random', select only random
      if (category === 'random') {
        return { ...prev, categories: ['random'] };
      }
      
      // If random is selected and clicking another, replace with that category
      if (currentCategories.includes('random')) {
        return { ...prev, categories: [category] };
      }
      
      // Toggle the category
      if (currentCategories.includes(category)) {
        // Don't allow empty selection - keep at least one
        if (currentCategories.length === 1) {
          return prev;
        }
        return { ...prev, categories: currentCategories.filter(c => c !== category) };
      } else {
        return { ...prev, categories: [...currentCategories, category] };
      }
    });
  };

  const setCustomWords = (words: string[]) => {
    setState(prev => ({ ...prev, customWords: words }));
  };

  const setDiscussionTimeEnabled = (enabled: boolean) => {
    setState(prev => ({ ...prev, discussionTimeEnabled: enabled }));
  };

  const setDiscussionTime = (time: number) => {
    setState(prev => ({ ...prev, discussionTime: time }));
  };

  const setPlayerNames = (names: string[]) => {
    setState(prev => ({ ...prev, playerNames: names }));
  };

  const goToPlayerNames = () => {
    setState(prev => ({ ...prev, screen: 'playerNames' }));
  };

  const startGame = (playerData?: PlayerData[]) => {
    // Generate random word from selected categories
    const word = getRandomWord(state.categories, state.usedWords);
    
    // Create players array with custom names and avatars
    const players: Player[] = [];
    for (let i = 0; i < state.playerCount; i++) {
      const data = playerData?.[i];
      players.push({
        id: i + 1,
        name: data?.name || `لاعب ${i + 1}`,
        avatar: data?.avatar || '👤',
        isImposter: false,
        hasSeenRole: false,
        votes: 0,
        votedFor: null,
      });
    }
    
    // Randomly select imposters
    const imposterIndices: number[] = [];
    while (imposterIndices.length < state.imposterCount) {
      const randomIndex = Math.floor(Math.random() * state.playerCount);
      if (!imposterIndices.includes(randomIndex)) {
        imposterIndices.push(randomIndex);
        players[randomIndex].isImposter = true;
      }
    }

    // Initialize or update player scores
    const newScores: PlayerScore[] = players.map(player => {
      const existingScore = state.playerScores.find(s => s.playerId === player.id);
      if (existingScore) {
        return {
          ...existingScore,
          name: player.name,
          avatar: player.avatar,
        };
      }
      return {
        playerId: player.id,
        name: player.name,
        avatar: player.avatar,
        score: 0,
        roundsPlayed: 0,
        roundsWon: 0,
        correctVotes: 0,
        imposterWins: 0,
      };
    });
    
    setState(prev => ({
      ...prev,
      players,
      playerNames: playerData?.map(p => p.name) || state.playerNames,
      secretWord: word,
      usedWords: [...prev.usedWords, word],
      currentPlayerIndex: 0,
      winner: null,
      playerScores: newScores,
      screen: 'passPhone',
    }));
  };

  const nextPlayer = () => {
    if (state.currentPlayerIndex < state.playerCount - 1) {
      setState(prev => ({
        ...prev,
        currentPlayerIndex: prev.currentPlayerIndex + 1,
        screen: 'passPhone',
      }));
    } else {
      setState(prev => ({ ...prev, screen: 'discussion' }));
    }
  };

  const markPlayerAsSeen = () => {
    setState(prev => {
      const newPlayers = [...prev.players];
      newPlayers[prev.currentPlayerIndex].hasSeenRole = true;
      return { ...prev, players: newPlayers };
    });
  };

  const voteForPlayer = (playerId: number) => {
    setState(prev => {
      const votingPlayerIndex = prev.players.filter(p => p.votedFor !== null).length;
      
      const newPlayers = prev.players.map((p, idx) => {
        if (p.id === playerId) {
          return { ...p, votes: p.votes + 1 };
        }
        if (idx === votingPlayerIndex) {
          return { ...p, votedFor: playerId };
        }
        return p;
      });
      return { ...prev, players: newPlayers };
    });
  };

  const calculateResult = () => {
    const sortedByVotes = [...state.players].sort((a, b) => b.votes - a.votes);
    const mostVoted = sortedByVotes[0];
    
    // Check if imposter was caught
    const imposterCaught = mostVoted.isImposter;
    const gameWinner: 'players' | 'imposters' = imposterCaught ? 'players' : 'imposters';
    
    // Update scores with new system
    setState(prev => {
      const imposters = prev.players.filter(p => p.isImposter);
      
      const updatedScores = prev.playerScores.map(score => {
        const player = prev.players.find(p => p.id === score.playerId);
        if (!player) return score;

        let pointsEarned = 0;
        let correctVoteBonus = 0;
        let imposterWinBonus = 0;

        if (player.isImposter) {
          // Imposter scoring
          if (gameWinner === 'imposters') {
            pointsEarned += 3; // Imposter survived
            imposterWinBonus = 1;
          }
        } else {
          // Regular player scoring
          if (gameWinner === 'players') {
            pointsEarned += 1; // Team win
          }
          // Bonus for voting correctly (voted for an actual imposter)
          if (player.votedFor !== null) {
            const votedForPlayer = prev.players.find(p => p.id === player.votedFor);
            if (votedForPlayer?.isImposter) {
              pointsEarned += 2; // Correct vote bonus
              correctVoteBonus = 1;
            }
          }
        }

        return {
          ...score,
          score: score.score + pointsEarned,
          roundsPlayed: score.roundsPlayed + 1,
          roundsWon: score.roundsWon + (pointsEarned > 0 ? 1 : 0),
          correctVotes: score.correctVotes + correctVoteBonus,
          imposterWins: score.imposterWins + imposterWinBonus,
        };
      });

      // Generate word guess options with similar/close words for difficulty
      const fakeWords = getSimilarWords(prev.secretWord, prev.categories, 3);
      const wordGuessOptions = [...fakeWords, prev.secretWord].sort(() => Math.random() - 0.5);

      return {
        ...prev,
        winner: gameWinner,
        screen: 'wordGuess',
        playerScores: updatedScores,
        wordGuessOptions,
        wordGuessed: null,
      };
    });
  };

  const resetGame = () => {
    setState(prev => ({
      ...initialState,
      usedWords: prev.usedWords,
      screen: 'hub',
    }));
  };

  const playAgain = () => {
    // Get a new random word
    const newWord = getRandomWord(state.categories, state.usedWords);
    
    // Reset players with new imposters
    const resetPlayers = state.players.map(p => ({ 
      ...p, 
      hasSeenRole: false, 
      votes: 0, 
      votedFor: null as number | null,
      isImposter: false 
    }));
    
    // Randomly select new imposters
    const imposterIndices: number[] = [];
    while (imposterIndices.length < state.imposterCount) {
      const randomIndex = Math.floor(Math.random() * resetPlayers.length);
      if (!imposterIndices.includes(randomIndex)) {
        imposterIndices.push(randomIndex);
        resetPlayers[randomIndex].isImposter = true;
      }
    }

    setState(prev => ({
      ...prev,
      players: resetPlayers,
      secretWord: newWord,
      usedWords: [...prev.usedWords, newWord],
      currentPlayerIndex: 0,
      winner: null,
      roundNumber: prev.roundNumber + 1,
      wordGuessOptions: [],
      wordGuessed: null,
      screen: 'passPhone',
    }));
  };

  const resetScores = () => {
    setState(prev => ({
      ...prev,
      playerScores: [],
      roundNumber: 1,
    }));
  };

  const getLeaderboard = (): PlayerScore[] => {
    return [...state.playerScores].sort((a, b) => b.score - a.score);
  };

  const submitWordGuess = (word: string) => {
    const correct = word === state.secretWord;
    setState(prev => {
      if (correct) {
        // Give +2 bonus to the caught imposter
        const sortedByVotes = [...prev.players].sort((a, b) => b.votes - a.votes);
        const caughtImposterId = sortedByVotes[0]?.id;
        const updatedScores = prev.playerScores.map(score =>
          score.playerId === caughtImposterId
            ? { ...score, score: score.score + 2 }
            : score
        );
        return { ...prev, wordGuessed: correct, playerScores: updatedScores };
      }
      return { ...prev, wordGuessed: correct };
    });
  };

  const skipWordGuess = () => {
    setState(prev => ({ ...prev, screen: 'result' }));
  };

  return (
    <GameContext.Provider
      value={{
        ...state,
        setScreen,
        setPlayerCount,
        setImposterCount,
        setCategories,
        toggleCategory,
        setCustomWords,
        setDiscussionTimeEnabled,
        setDiscussionTime,
        setPlayerNames,
        goToPlayerNames,
        startGame,
        nextPlayer,
        markPlayerAsSeen,
        voteForPlayer,
        calculateResult,
        resetGame,
        playAgain,
        resetScores,
        getLeaderboard,
        submitWordGuess,
        skipWordGuess,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
