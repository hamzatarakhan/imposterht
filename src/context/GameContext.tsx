import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Category, getRandomWord } from '@/data/words';

export type GameScreen = 
  | 'splash'
  | 'home'
  | 'howToPlay'
  | 'setup'
  | 'passPhone'
  | 'showRole'
  | 'discussion'
  | 'voting'
  | 'result';

export interface Player {
  id: number;
  name: string;
  isImposter: boolean;
  hasSeenRole: boolean;
  votes: number;
}

interface GameState {
  screen: GameScreen;
  playerCount: number;
  imposterCount: number;
  category: Category;
  customWords: string[];
  players: Player[];
  currentPlayerIndex: number;
  secretWord: string;
  usedWords: string[];
  discussionTime: number;
  winner: 'imposters' | 'players' | null;
}

interface GameContextType extends GameState {
  setScreen: (screen: GameScreen) => void;
  setPlayerCount: (count: number) => void;
  setImposterCount: (count: number) => void;
  setCategory: (category: Category) => void;
  setCustomWords: (words: string[]) => void;
  setDiscussionTime: (time: number) => void;
  startGame: () => void;
  nextPlayer: () => void;
  markPlayerAsSeen: () => void;
  voteForPlayer: (playerId: number) => void;
  calculateResult: () => void;
  resetGame: () => void;
  playAgain: () => void;
}

const initialState: GameState = {
  screen: 'splash',
  playerCount: 4,
  imposterCount: 1,
  category: 'random',
  customWords: [],
  players: [],
  currentPlayerIndex: 0,
  secretWord: '',
  usedWords: [],
  discussionTime: 90,
  winner: null,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(initialState);

  const setScreen = (screen: GameScreen) => {
    setState(prev => ({ ...prev, screen }));
  };

  const setPlayerCount = (count: number) => {
    setState(prev => ({ ...prev, playerCount: count }));
  };

  const setImposterCount = (count: number) => {
    setState(prev => ({ ...prev, imposterCount: count }));
  };

  const setCategory = (category: Category) => {
    setState(prev => ({ ...prev, category }));
  };

  const setCustomWords = (words: string[]) => {
    setState(prev => ({ ...prev, customWords: words }));
  };

  const setDiscussionTime = (time: number) => {
    setState(prev => ({ ...prev, discussionTime: time }));
  };

  const startGame = () => {
    // Generate random word
    const word = getRandomWord(state.category, state.usedWords);
    
    // Create players array
    const players: Player[] = [];
    for (let i = 0; i < state.playerCount; i++) {
      players.push({
        id: i + 1,
        name: `لاعب ${i + 1}`,
        isImposter: false,
        hasSeenRole: false,
        votes: 0,
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
    
    setState(prev => ({
      ...prev,
      players,
      secretWord: word,
      usedWords: [...prev.usedWords, word],
      currentPlayerIndex: 0,
      winner: null,
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
      const newPlayers = prev.players.map(p => 
        p.id === playerId ? { ...p, votes: p.votes + 1 } : p
      );
      return { ...prev, players: newPlayers };
    });
  };

  const calculateResult = () => {
    const sortedByVotes = [...state.players].sort((a, b) => b.votes - a.votes);
    const mostVoted = sortedByVotes[0];
    
    // Check if imposter was caught
    const imposterCaught = mostVoted.isImposter;
    
    setState(prev => ({
      ...prev,
      winner: imposterCaught ? 'players' : 'imposters',
      screen: 'result',
    }));
  };

  const resetGame = () => {
    setState(prev => ({
      ...initialState,
      usedWords: prev.usedWords, // Keep track of used words
    }));
  };

  const playAgain = () => {
    setState(prev => ({
      ...prev,
      players: prev.players.map(p => ({ ...p, hasSeenRole: false, votes: 0, isImposter: false })),
      currentPlayerIndex: 0,
      winner: null,
      screen: 'setup',
    }));
  };

  return (
    <GameContext.Provider
      value={{
        ...state,
        setScreen,
        setPlayerCount,
        setImposterCount,
        setCategory,
        setCustomWords,
        setDiscussionTime,
        startGame,
        nextPlayer,
        markPlayerAsSeen,
        voteForPlayer,
        calculateResult,
        resetGame,
        playAgain,
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
