import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Room, RoomPlayer, OnlineGameScreen } from '@/types/online';
import * as roomService from '@/services/roomService';
import { Category } from '@/data/words';

interface OnlineGameState {
  screen: OnlineGameScreen;
  room: Room | null;
  players: RoomPlayer[];
  currentPlayer: RoomPlayer | null;
  isHost: boolean;
  myPlayerId: string;
}

interface OnlineGameContextType extends OnlineGameState {
  setScreen: (screen: OnlineGameScreen) => void;
  createRoom: (name: string, avatar: string, settings: {
    playerCount: number;
    imposterCount: number;
    category: string;
    discussionTime: number;
    discussionTimeEnabled: boolean;
  }) => Promise<boolean>;
  joinRoom: (code: string, name: string, avatar: string) => Promise<{ success: boolean; error?: string }>;
  startGame: () => Promise<boolean>;
  markRoleSeen: () => Promise<void>;
  moveToNextPlayer: () => Promise<void>;
  startDiscussion: () => Promise<void>;
  submitVote: (votedForPlayerId: string) => Promise<void>;
  calculateWinner: () => Promise<void>;
  leaveRoom: () => Promise<void>;
  resetOnlineGame: () => void;
}

const initialState: OnlineGameState = {
  screen: 'modeSelect',
  room: null,
  players: [],
  currentPlayer: null,
  isHost: false,
  myPlayerId: '',
};

const OnlineGameContext = createContext<OnlineGameContextType | undefined>(undefined);

export const OnlineGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnlineGameState>(initialState);

  // Initialize player ID
  useEffect(() => {
    const playerId = roomService.getOrCreatePlayerId();
    setState(prev => ({ ...prev, myPlayerId: playerId }));
  }, []);

  // Subscribe to room changes
  useEffect(() => {
    if (!state.room?.id) return;

    const unsubscribe = roomService.subscribeToRoom(
      state.room.id,
      (room) => {
        setState(prev => ({ ...prev, room }));
      },
      (players) => {
        const myPlayer = players.find(p => p.player_id === state.myPlayerId);
        setState(prev => ({
          ...prev,
          players,
          currentPlayer: myPlayer || null,
          isHost: myPlayer?.is_host || false,
        }));
      }
    );

    return unsubscribe;
  }, [state.room?.id, state.myPlayerId]);

  // Auto-navigate based on room status and players state
  useEffect(() => {
    if (!state.room) return;

    switch (state.room.status) {
      case 'playing':
        // Check if all players have seen their roles
        const allSeen = state.players.length > 0 && state.players.every(p => p.has_seen_role);
        if (allSeen) {
          // All players saw their roles, move to discussion
          if (state.screen !== 'onlineDiscussion') {
            setState(prev => ({ ...prev, screen: 'onlineDiscussion' }));
          }
        } else if (state.screen !== 'onlineShowRole') {
          setState(prev => ({ ...prev, screen: 'onlineShowRole' }));
        }
        break;
      case 'voting':
        if (state.screen !== 'onlineVoting' && state.screen !== 'onlineDiscussion') {
          setState(prev => ({ ...prev, screen: 'onlineDiscussion' }));
        }
        break;
      case 'finished':
        if (state.screen !== 'onlineResult') {
          setState(prev => ({ ...prev, screen: 'onlineResult' }));
        }
        break;
    }
  }, [state.room?.status, state.screen, state.players]);

  const setScreen = useCallback((screen: OnlineGameScreen) => {
    setState(prev => ({ ...prev, screen }));
  }, []);

  const createRoom = useCallback(async (
    name: string,
    avatar: string,
    settings: {
      playerCount: number;
      imposterCount: number;
      category: string;
      discussionTime: number;
      discussionTimeEnabled: boolean;
    }
  ): Promise<boolean> => {
    const result = await roomService.createRoom(name, avatar, settings);
    if (!result) return false;

    setState(prev => ({
      ...prev,
      room: result.room,
      players: [result.player],
      currentPlayer: result.player,
      isHost: true,
      screen: 'lobby',
    }));

    return true;
  }, []);

  const joinRoom = useCallback(async (
    code: string,
    name: string,
    avatar: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await roomService.joinRoom(code, name, avatar);

    if ('error' in result) {
      return { success: false, error: result.error };
    }

    // Fetch all players
    const players = await roomService.getRoomPlayers(result.room.id);

    setState(prev => ({
      ...prev,
      room: result.room,
      players,
      currentPlayer: result.player,
      isHost: result.player.is_host,
      screen: 'lobby',
    }));

    return { success: true };
  }, []);

  const startGame = useCallback(async (): Promise<boolean> => {
    if (!state.room || !state.isHost) return false;

    const success = await roomService.startGame(
      state.room.id,
      state.room.category as Category
    );

    return success;
  }, [state.room, state.isHost]);

  const markRoleSeen = useCallback(async (): Promise<void> => {
    if (!state.room) return;
    await roomService.markRoleSeen(state.room.id);
  }, [state.room]);

  const moveToNextPlayer = useCallback(async (): Promise<void> => {
    if (!state.room) return;
    // Navigation is handled by auto-navigate effect based on room status
    // This is called after marking role as seen
  }, [state.room]);

  const startDiscussion = useCallback(async (): Promise<void> => {
    if (!state.room) return;
    await roomService.startDiscussion(state.room.id);
  }, [state.room]);

  const submitVote = useCallback(async (votedForPlayerId: string): Promise<void> => {
    if (!state.room) return;
    await roomService.submitVote(state.room.id, votedForPlayerId);
  }, [state.room]);

  const calculateWinner = useCallback(async (): Promise<void> => {
    if (!state.room) return;
    await roomService.calculateWinner(state.room.id);
  }, [state.room]);

  const leaveRoom = useCallback(async (): Promise<void> => {
    if (!state.room) return;

    if (state.isHost) {
      await roomService.deleteRoom(state.room.id);
    } else {
      await roomService.leaveRoom(state.room.id);
    }

    setState({
      ...initialState,
      myPlayerId: state.myPlayerId,
    });
  }, [state.room, state.isHost, state.myPlayerId]);

  const resetOnlineGame = useCallback(() => {
    setState(prev => ({
      ...initialState,
      myPlayerId: prev.myPlayerId,
    }));
  }, []);

  return (
    <OnlineGameContext.Provider
      value={{
        ...state,
        setScreen,
        createRoom,
        joinRoom,
        startGame,
        markRoleSeen,
        moveToNextPlayer,
        startDiscussion,
        submitVote,
        calculateWinner,
        leaveRoom,
        resetOnlineGame,
      }}
    >
      {children}
    </OnlineGameContext.Provider>
  );
};

export const useOnlineGame = () => {
  const context = useContext(OnlineGameContext);
  if (!context) {
    throw new Error('useOnlineGame must be used within an OnlineGameProvider');
  }
  return context;
};
