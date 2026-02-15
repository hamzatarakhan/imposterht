import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Category, getRandomWord } from '@/data/words';

export type GuessingScreen =
  | 'guessingSetup'
  | 'guessingPlayerNames'
  | 'guessingPassPhone'
  | 'guessingShowWord'
  | 'guessingPlay'
  | 'guessingRoundResult'
  | 'guessingFinalResult';

export interface GuessingPlayer {
  id: number;
  name: string;
  avatar: string;
  score: number;
}

interface GuessingState {
  screen: GuessingScreen;
  playerCount: number;
  categories: Category[];
  roundTime: number;
  totalRounds: number;
  players: GuessingPlayer[];
  currentDescriberIndex: number;
  currentWord: string;
  usedWords: string[];
  currentRound: number;
  roundResult: 'correct' | 'skip' | null;
}

interface GuessingContextType extends GuessingState {
  setScreen: (screen: GuessingScreen) => void;
  setPlayerCount: (count: number) => void;
  setCategories: (categories: Category[]) => void;
  toggleCategory: (category: Category) => void;
  setRoundTime: (time: number) => void;
  setTotalRounds: (rounds: number) => void;
  startGame: (playerData: { name: string; avatar: string }[]) => void;
  showWord: () => void;
  markCorrect: () => void;
  markSkip: () => void;
  nextRound: () => void;
  resetGame: () => void;
}

const initialState: GuessingState = {
  screen: 'guessingSetup',
  playerCount: 3,
  categories: ['random'],
  roundTime: 60,
  totalRounds: 10,
  players: [],
  currentDescriberIndex: 0,
  currentWord: '',
  usedWords: [],
  currentRound: 1,
  roundResult: null,
};

const GuessingGameContext = createContext<GuessingContextType | undefined>(undefined);

export const GuessingGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GuessingState>(initialState);

  const setScreen = (screen: GuessingScreen) => setState(prev => ({ ...prev, screen }));

  const setPlayerCount = (count: number) => setState(prev => ({ ...prev, playerCount: count }));

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

  const setRoundTime = (time: number) => setState(prev => ({ ...prev, roundTime: time }));
  const setTotalRounds = (rounds: number) => setState(prev => ({ ...prev, totalRounds: rounds }));

  const startGame = (playerData: { name: string; avatar: string }[]) => {
    const players: GuessingPlayer[] = playerData.map((p, i) => ({
      id: i + 1,
      name: p.name,
      avatar: p.avatar,
      score: 0,
    }));
    const word = getRandomWord(state.categories, state.usedWords);

    setState(prev => ({
      ...prev,
      players,
      currentWord: word,
      usedWords: [...prev.usedWords, word],
      currentDescriberIndex: 0,
      currentRound: 1,
      roundResult: null,
      screen: 'guessingPassPhone',
    }));
  };

  const showWord = () => setState(prev => ({ ...prev, screen: 'guessingShowWord' }));

  const markCorrect = () => {
    setState(prev => {
      const updatedPlayers = prev.players.map((p, i) =>
        i === prev.currentDescriberIndex ? { ...p, score: p.score + 1 } : p
      );
      return { ...prev, players: updatedPlayers, roundResult: 'correct', screen: 'guessingRoundResult' };
    });
  };

  const markSkip = () => {
    setState(prev => ({ ...prev, roundResult: 'skip', screen: 'guessingRoundResult' }));
  };

  const nextRound = () => {
    setState(prev => {
      const isLastRound = prev.currentRound >= prev.totalRounds;
      if (isLastRound) {
        return { ...prev, screen: 'guessingFinalResult' };
      }

      const nextDescriber = (prev.currentDescriberIndex + 1) % prev.players.length;
      const newWord = getRandomWord(prev.categories, prev.usedWords);

      return {
        ...prev,
        currentDescriberIndex: nextDescriber,
        currentWord: newWord,
        usedWords: [...prev.usedWords, newWord],
        currentRound: prev.currentRound + 1,
        roundResult: null,
        screen: 'guessingPassPhone',
      };
    });
  };

  const resetGame = () => {
    setState({
      ...initialState,
    });
  };

  return (
    <GuessingGameContext.Provider value={{
      ...state, setScreen, setPlayerCount, setCategories, toggleCategory,
      setRoundTime, setTotalRounds, startGame, showWord, markCorrect, markSkip, nextRound, resetGame,
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
