import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Category, getRandomWord } from '@/data/words';

export type GameScreen = 
  | 'splash'
  | 'home'
  | 'settings'
  | 'howToPlay'
  | 'setup'
  | 'playerNames'
  | 'passPhone'
  | 'showRole'
  | 'discussion'
  | 'voting'
  | 'result';

export interface Player {
  id: number;
  name: string;
  avatar: string;
  isImposter: boolean;
  hasSeenRole: boolean;
  votes: number;
}

export const AVATAR_OPTIONS = [
  '👤', '😎', '🦊', '🐱', '🐶', '🦁', '🐼', '🐨', 
  '🦄', '🐸', '🐵', '🐰', '🐻', '🐯', '🦋', '🌟'
];

interface GameState {
  screen: GameScreen;
  playerCount: number;
  imposterCount: number;
  category: Category;
  customWords: string[];
  players: Player[];
  playerNames: string[];
  currentPlayerIndex: number;
  secretWord: string;
  usedWords: string[];
  discussionTimeEnabled: boolean;
  discussionTime: number;
  winner: 'imposters' | 'players' | null;
}

interface PlayerData {
  name: string;
  avatar: string;
}

interface GameContextType extends GameState {
  setScreen: (screen: GameScreen) => void;
  setPlayerCount: (count: number) => void;
  setImposterCount: (count: number) => void;
  setCategory: (category: Category) => void;
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
}

const initialState: GameState = {
  screen: 'splash',
  playerCount: 4,
  imposterCount: 1,
  category: 'random',
  customWords: [],
  players: [],
  playerNames: [],
  currentPlayerIndex: 0,
  secretWord: '',
  usedWords: [],
  discussionTimeEnabled: true,
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

  const setCategory = (category: Category) => {
    setState(prev => ({ ...prev, category }));
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
    // Generate random word
    const word = getRandomWord(state.category, state.usedWords);
    
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
      playerNames: playerData?.map(p => p.name) || state.playerNames,
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
      usedWords: prev.usedWords,
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
