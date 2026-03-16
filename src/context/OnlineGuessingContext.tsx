import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as guessingService from '@/services/guessingRoomService';
import { getOrCreatePlayerId } from '@/services/roomService';
import { GuessingRoom, GuessingPlayer } from '@/services/guessingRoomService';
import { GuessingCategory } from '@/data/guessingWords';

export type OnlineGuessingScreen =
  | 'guessingModeSelect'
  | 'guessingCreateRoom'
  | 'guessingJoinRoom'
  | 'guessingLobby'
  | 'guessingOnlineShowWord'
  | 'guessingOnlinePlay'
  | 'guessingOnlineRoundResult'
  | 'guessingOnlineFinalResult';

interface OnlineGuessingState {
  screen: OnlineGuessingScreen;
  room: GuessingRoom | null;
  players: GuessingPlayer[];
  currentPlayer: GuessingPlayer | null;
  isHost: boolean;
  myPlayerId: string;
  pendingJoinCode: string | null;
}

interface OnlineGuessingContextType extends OnlineGuessingState {
  setScreen: (s: OnlineGuessingScreen) => void;
  createRoom: (name: string, avatar: string, settings: { categories: GuessingCategory[]; totalRounds: number; turnTime?: number; voiceChatEnabled?: boolean; presenceEnabled?: boolean }) => Promise<boolean>;
  joinRoom: (code: string, name: string, avatar: string) => Promise<{ success: boolean; error?: string }>;
  startGame: () => Promise<boolean>;
  markWinner: (winnerPlayerId: string) => Promise<boolean>;
  markDraw: () => Promise<boolean>;
  nextRound: () => Promise<boolean>;
  changeWords: () => Promise<boolean>;
  replayRoom: (newCategories?: GuessingCategory[]) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  resetOnlineGuessing: () => void;
  clearPendingJoinCode: () => void;
}

const initialState: OnlineGuessingState = {
  screen: 'guessingModeSelect',
  room: null,
  players: [],
  currentPlayer: null,
  isHost: false,
  myPlayerId: '',
  pendingJoinCode: null,
};

const OnlineGuessingContext = createContext<OnlineGuessingContextType | undefined>(undefined);

export const OnlineGuessingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnlineGuessingState>(initialState);

  // Init player ID and check for join code in URL
  useEffect(() => {
    const playerId = getOrCreatePlayerId();
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('guessing_join');
    
    if (joinCode && joinCode.length === 6) {
      window.history.replaceState({}, '', window.location.pathname);
      setState(prev => ({
        ...prev,
        myPlayerId: playerId,
        pendingJoinCode: joinCode.toUpperCase(),
        screen: 'guessingJoinRoom',
      }));
    } else {
      setState(prev => ({ ...prev, myPlayerId: playerId }));
    }
  }, []);

  // Subscribe to room
  useEffect(() => {
    if (!state.room?.id) return;
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const setup = () => {
      unsubscribe = guessingService.subscribeToGuessingRoom(
        state.room!.id,
        (room) => { if (!cancelled) setState(prev => ({ ...prev, room })); },
        (players) => {
          if (cancelled) return;
          const me = players.find(p => p.player_id === state.myPlayerId);
          setState(prev => ({ ...prev, players, currentPlayer: me || null, isHost: me?.is_host || false }));
        }
      );
    };

    const sync = async () => {
      if (cancelled || !state.room?.id) return;
      const [room, players] = await Promise.all([
        guessingService.getGuessingRoom(state.room.id),
        guessingService.getGuessingPlayers(state.room.id),
      ]);
      if (cancelled || !room) return;
      const me = players.find(p => p.player_id === state.myPlayerId);
      setState(prev => ({ ...prev, room, players, currentPlayer: me || null, isHost: me?.is_host || false }));
    };

    setup();

    const handleActive = async () => {
      if (document.visibilityState !== 'visible') return;
      await sync();
      if (unsubscribe) unsubscribe();
      setup();
    };

    document.addEventListener('visibilitychange', handleActive);
    window.addEventListener('focus', handleActive);
    const poll = setInterval(() => { if (document.visibilityState === 'visible') sync(); }, 5000);

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
      document.removeEventListener('visibilitychange', handleActive);
      window.removeEventListener('focus', handleActive);
      clearInterval(poll);
    };
  }, [state.room?.id, state.myPlayerId]);

  // Auto-navigate based on room status
  useEffect(() => {
    if (!state.room) return;
    switch (state.room.status) {
      case 'playing':
        if (state.screen !== 'guessingOnlineShowWord' && state.screen !== 'guessingOnlinePlay') {
          setState(prev => ({ ...prev, screen: 'guessingOnlineShowWord' }));
        }
        break;
      case 'round_result':
        if (state.screen !== 'guessingOnlineRoundResult') {
          setState(prev => ({ ...prev, screen: 'guessingOnlineRoundResult' }));
        }
        break;
      case 'finished':
        if (state.screen !== 'guessingOnlineFinalResult') {
          setState(prev => ({ ...prev, screen: 'guessingOnlineFinalResult' }));
        }
        break;
    }
  }, [state.room?.status]);

  const setScreen = useCallback((s: OnlineGuessingScreen) => setState(prev => ({ ...prev, screen: s })), []);

  const createRoom = useCallback(async (name: string, avatar: string, settings: { categories: GuessingCategory[]; totalRounds: number; turnTime?: number }) => {
    const result = await guessingService.createGuessingRoom(name, avatar, settings);
    if (!result) return false;
    setState(prev => ({
      ...prev, room: result.room, players: [result.player],
      currentPlayer: result.player, isHost: true, screen: 'guessingLobby',
    }));
    return true;
  }, []);

  const joinRoom = useCallback(async (code: string, name: string, avatar: string) => {
    const result = await guessingService.joinGuessingRoom(code, name, avatar);
    if ('error' in result) return { success: false, error: result.error };
    const players = await guessingService.getGuessingPlayers(result.room.id);
    setState(prev => ({
      ...prev, room: result.room, players,
      currentPlayer: result.player, isHost: result.player.is_host, screen: 'guessingLobby',
    }));
    return { success: true };
  }, []);

  const startGame = useCallback(async () => {
    if (!state.room || !state.isHost) return false;
    let categories: GuessingCategory[] = ['random'];
    try { categories = JSON.parse(state.room.categories || '["random"]'); } catch {}
    return guessingService.startGuessingGame(state.room.id, categories);
  }, [state.room, state.isHost]);

  const markWinner = useCallback(async (winnerPlayerId: string) => {
    if (!state.room || !state.isHost) return false;
    return guessingService.markGuessingWinner(state.room.id, winnerPlayerId);
  }, [state.room, state.isHost]);

  const markDraw = useCallback(async () => {
    if (!state.room || !state.isHost) return false;
    return guessingService.markGuessingDraw(state.room.id);
  }, [state.room, state.isHost]);

  const nextRound = useCallback(async () => {
    if (!state.room || !state.isHost) return false;
    let categories: GuessingCategory[] = ['random'];
    try { categories = JSON.parse(state.room.categories || '["random"]'); } catch {}
    return guessingService.nextGuessingRound(state.room.id, categories);
  }, [state.room, state.isHost]);

  const changeWords = useCallback(async () => {
    if (!state.room || !state.isHost) return false;
    let categories: GuessingCategory[] = ['random'];
    try { categories = JSON.parse(state.room.categories || '["random"]'); } catch {}
    return guessingService.changeGuessingWords(state.room.id, categories);
  }, [state.room, state.isHost]);

  const replayRoom = useCallback(async (newCategories?: GuessingCategory[]) => {
    if (!state.room || !state.isHost) return false;
    let categories: GuessingCategory[] = ['random'];
    try { categories = JSON.parse(state.room.categories || '["random"]'); } catch {}
    const newCatsStr = newCategories ? JSON.stringify(newCategories) : undefined;
    return guessingService.replayGuessingRoom(state.room.id, categories, newCatsStr);
  }, [state.room, state.isHost]);

  const leaveRoom = useCallback(async () => {
    if (!state.room) return;
    if (state.isHost) await guessingService.deleteGuessingRoom(state.room.id);
    else await guessingService.leaveGuessingRoom(state.room.id);
    setState({ ...initialState, myPlayerId: state.myPlayerId });
  }, [state.room, state.isHost, state.myPlayerId]);

  const resetOnlineGuessing = useCallback(() => {
    setState(prev => ({ ...initialState, myPlayerId: prev.myPlayerId }));
  }, []);

  const clearPendingJoinCode = useCallback(() => {
    setState(prev => ({ ...prev, pendingJoinCode: null }));
  }, []);

  return (
    <OnlineGuessingContext.Provider value={{
      ...state, setScreen, createRoom, joinRoom, startGame,
      markWinner, markDraw, nextRound, changeWords, replayRoom, leaveRoom, resetOnlineGuessing, clearPendingJoinCode,
    }}>
      {children}
    </OnlineGuessingContext.Provider>
  );
};

const defaultState: OnlineGuessingContextType = {
  ...initialState,
  setScreen: () => {},
  createRoom: async () => false,
  joinRoom: async () => ({ success: false }),
  startGame: async () => false,
  markWinner: async () => false,
  markDraw: async () => false,
  nextRound: async () => false,
  changeWords: async () => false,
  replayRoom: async () => false,
  leaveRoom: async () => {},
  resetOnlineGuessing: () => {},
  clearPendingJoinCode: () => {},
};

export const useOnlineGuessing = () => {
  const ctx = useContext(OnlineGuessingContext);
  return ctx ?? defaultState;
};
