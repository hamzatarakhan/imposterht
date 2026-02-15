import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Category, getRandomWord } from '@/data/words';

export type GuessingScreen =
  | 'guessingSetup'
  | 'guessingPassPhone'
  | 'guessingShowWord'
  | 'guessingPlay'
  | 'guessingRoundResult'
  | 'guessingFinalResult';

export interface GuessingPlayer {
  id: number;
  name: string;
  avatar: string;
  wins: number;
}

interface GuessingState {
  screen: GuessingScreen;
  categories: Category[];
  totalRounds: number;
  players: GuessingPlayer[];
  words: string[];
  usedWords: string[];
  currentRound: number;
  currentPlayerViewIndex: number; // 0 or 1 - who's viewing their word now
  bothSeen: boolean;
  roundWinner: number | null; // player id who won the round
}

interface GuessingContextType extends GuessingState {
  setScreen: (screen: GuessingScreen) => void;
  setCategories: (categories: Category[]) => void;
  toggleCategory: (category: Category) => void;
  setTotalRounds: (rounds: number) => void;
  startGame: (p1: { name: string; avatar: string }, p2: { name: string; avatar: string }) => void;
  confirmSeen: () => void;
  markWinner: (playerId: number) => void;
  nextRound: () => void;
  resetGame: () => void;
}

const initialState: GuessingState = {
  screen: 'guessingSetup',
  categories: ['random'],
  totalRounds: 5,
  players: [],
  words: [],
  usedWords: [],
  currentRound: 1,
  currentPlayerViewIndex: 0,
  bothSeen: false,
  roundWinner: null,
};

const GuessingGameContext = createContext<GuessingContextType | undefined>(undefined);

export const GuessingGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GuessingState>(initialState);

  const setScreen = (screen: GuessingScreen) => setState(prev => ({ ...prev, screen }));

  const setCategories = (categories: Category[]) => setState(prev => ({ ...prev, categories }));

  const toggleCategory = (category: Category) => {
    setState(prev => {
      if (category === 'random') return { ...prev, categories: ['random'] };
      if (prev.categories.includes('random')) return { ...prev, categories: [category] };
      if (prev.categories.includes(category)) {
        if (prev.categories.length === 1) return prev;
        return { ...prev, categories: prev.categories.filter(c => c !== category) };
      }
      return { ...prev, categories: [...prev.categories, category] };
    });
  };

  const setTotalRounds = (rounds: number) => setState(prev => ({ ...prev, totalRounds: rounds }));

  const startGame = (p1: { name: string; avatar: string }, p2: { name: string; avatar: string }) => {
    const word1 = getRandomWord(state.categories, state.usedWords);
    const word2 = getRandomWord(state.categories, [...state.usedWords, word1]);

    const players: GuessingPlayer[] = [
      { id: 1, name: p1.name, avatar: p1.avatar, wins: 0 },
      { id: 2, name: p2.name, avatar: p2.avatar, wins: 0 },
    ];

    setState(prev => ({
      ...prev,
      players,
      words: [word1, word2],
      usedWords: [...prev.usedWords, word1, word2],
      currentRound: 1,
      currentPlayerViewIndex: 0,
      bothSeen: false,
      roundWinner: null,
      screen: 'guessingPassPhone',
    }));
  };

  const confirmSeen = () => {
    setState(prev => {
      if (prev.currentPlayerViewIndex === 0) {
        // First player saw, now pass to second
        return { ...prev, currentPlayerViewIndex: 1, screen: 'guessingPassPhone' };
      }
      // Both saw, go to play
      return { ...prev, bothSeen: true, screen: 'guessingPlay' };
    });
  };

  const markWinner = (playerId: number) => {
    setState(prev => {
      const updatedPlayers = prev.players.map(p =>
        p.id === playerId ? { ...p, wins: p.wins + 1 } : p);
      return { ...prev, players: updatedPlayers, roundWinner: playerId, screen: 'guessingRoundResult' };
    });
  };

  const nextRound = () => {
    setState(prev => {
      const isLastRound = prev.currentRound >= prev.totalRounds;
      // Also check if someone already won majority
      const majorityNeeded = Math.ceil(prev.totalRounds / 2);
      const p1Wins = prev.players.length === 2 ? prev.players[0].wins : 0;
      const p2Wins = prev.players.length === 2 ? prev.players[1].wins : 0;

      if (isLastRound || p1Wins >= majorityNeeded || p2Wins >= majorityNeeded) {
        return { ...prev, screen: 'guessingFinalResult' };
      }

      const w1 = getRandomWord(prev.categories, prev.usedWords);
      const w2 = getRandomWord(prev.categories, [...prev.usedWords, w1]);

      return {
        ...prev,
        words: [w1, w2],
        usedWords: [...prev.usedWords, w1, w2],
        currentRound: prev.currentRound + 1,
        currentPlayerViewIndex: 0,
        bothSeen: false,
        roundWinner: null,
        screen: 'guessingPassPhone',
      };
    });
  };

  const resetGame = () => setState({ ...initialState });

  return (
    <GuessingGameContext.Provider value={{
      ...state, setScreen, setCategories, toggleCategory,
      setTotalRounds, startGame, confirmSeen, markWinner, nextRound, resetGame,
    }}>
      {children}
    </GuessingGameContext.Provider>
  );
};

export const useGuessingGame = () => {
  const context = useContext(GuessingGameContext);
  if (!context) throw new Error('useGuessingGame must be used within GuessingGameProvider');
  return context;
};
