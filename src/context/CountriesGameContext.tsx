import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as countriesService from '@/services/countriesRoomService';
import { CountriesRoom, CountriesPlayer, CountriesBurned } from '@/services/countriesRoomService';

export type CountriesScreen =
  | 'countriesIdle'
  | 'countriesModeSelect'
  | 'countriesCreateRoom'
  | 'countriesJoinRoom'
  | 'countriesAdmin'
  | 'countriesSpectator';

interface CountriesContextType {
  screen: CountriesScreen;
  setScreen: (s: CountriesScreen) => void;
  room: CountriesRoom | null;
  players: CountriesPlayer[];
  burned: CountriesBurned[];
  isAdmin: boolean;
  hostId: string;
  pendingJoinCode: string | null;
  createRoom: () => Promise<string | null>;
  joinRoom: (code: string) => Promise<boolean>;
  addPlayer: (name: string) => Promise<boolean>;
  removePlayer: (playerId: string) => Promise<boolean>;
  updateLives: (playerId: string, delta: number) => Promise<boolean>;
  addBurned: (countryName: string) => Promise<boolean>;
  removeBurned: (burnedId: string) => Promise<boolean>;
  swapPlayers: (activeId: string, eliminatedId: string) => Promise<boolean>;
  leaveRoom: () => void;
  clearPendingJoinCode: () => void;
}

const CountriesContext = createContext<CountriesContextType | null>(null);

export const useCountries = () => {
  const ctx = useContext(CountriesContext);
  if (!ctx) throw new Error('useCountries must be used within CountriesProvider');
  return ctx;
};

const getHostId = (): string => {
  let id = localStorage.getItem('countries_host_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('countries_host_id', id);
  }
  return id;
};

export const CountriesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<CountriesScreen>('countriesIdle');
  const [room, setRoom] = useState<CountriesRoom | null>(null);
  const [players, setPlayers] = useState<CountriesPlayer[]>([]);
  const [burned, setBurned] = useState<CountriesBurned[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(null);
  const hostId = getHostId();

  // Check URL for deep link join code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('countries_join');
    if (joinCode && joinCode.length === 6) {
      window.history.replaceState({}, '', window.location.pathname);
      setPendingJoinCode(joinCode.toUpperCase());
      setScreen('countriesJoinRoom');
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!room) return;
    const [p, b, r] = await Promise.all([
      countriesService.getCountriesPlayers(room.id),
      countriesService.getCountriesBurned(room.id),
      countriesService.getCountriesRoomById(room.id),
    ]);
    setPlayers(p);
    setBurned(b);
    if (r) setRoom(r);
  }, [room]);

  // Realtime subscriptions
  useEffect(() => {
    if (!room) return;

    const channel = supabase
      .channel(`countries-${room.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'countries_players', filter: `room_id=eq.${room.id}` }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'countries_burned', filter: `room_id=eq.${room.id}` }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'countries_rooms', filter: `id=eq.${room.id}` }, () => refreshData())
      .subscribe();

    refreshData();

    return () => { supabase.removeChannel(channel); };
  }, [room?.id, refreshData]);

  const createRoom = async (): Promise<string | null> => {
    // Clean up any old room first
    if (room && isAdmin) {
      await countriesService.deleteCountriesRoom(room.id, hostId);
    }
    setRoom(null);
    setPlayers([]);
    setBurned([]);
    
    const r = await countriesService.createCountriesRoom(hostId);
    if (!r) return null;
    setRoom(r);
    setIsAdmin(true);
    setScreen('countriesAdmin');
    return r.code;
  };

  const joinRoom = async (code: string): Promise<boolean> => {
    const r = await countriesService.getCountriesRoom(code);
    if (!r) return false;
    setRoom(r);
    setIsAdmin(false);
    setScreen('countriesSpectator');
    return true;
  };

  const addPlayer = async (name: string): Promise<boolean> => {
    if (!room) return false;
    const id = await countriesService.addPlayer(room.id, hostId, name);
    return !!id;
  };

  const removePlayer = async (playerId: string): Promise<boolean> => {
    if (!room) return false;
    return countriesService.removePlayer(room.id, hostId, playerId);
  };

  const updateLives = async (playerId: string, delta: number): Promise<boolean> => {
    if (!room) return false;
    return countriesService.updatePlayerLives(room.id, hostId, playerId, delta);
  };

  const addBurned = async (countryName: string): Promise<boolean> => {
    if (!room) return false;
    return countriesService.addBurnedCountry(room.id, hostId, countryName);
  };

  const removeBurned = async (burnedId: string): Promise<boolean> => {
    if (!room) return false;
    return countriesService.removeBurnedCountry(room.id, hostId, burnedId);
  };

  const swapPlayersAction = async (activeId: string, eliminatedId: string): Promise<boolean> => {
    if (!room) return false;
    return countriesService.swapPlayers(room.id, hostId, activeId, eliminatedId);
  };

  const leaveRoom = async () => {
    if (room && isAdmin) {
      await countriesService.deleteCountriesRoom(room.id, hostId);
    }
    setRoom(null);
    setPlayers([]);
    setBurned([]);
    setIsAdmin(false);
    setPendingJoinCode(null);
    setScreen('countriesIdle');
  };

  const clearPendingJoinCode = () => setPendingJoinCode(null);

  return (
    <CountriesContext.Provider value={{
      screen, setScreen, room, players, burned, isAdmin, hostId, pendingJoinCode,
      createRoom, joinRoom, addPlayer, removePlayer, updateLives,
      addBurned, removeBurned, swapPlayers: swapPlayersAction, leaveRoom, clearPendingJoinCode,
    }}>
      {children}
    </CountriesContext.Provider>
  );
};
