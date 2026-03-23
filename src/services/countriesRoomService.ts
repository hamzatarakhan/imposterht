import { supabase } from '@/integrations/supabase/client';

export interface CountriesRoom {
  id: string;
  code: string;
  host_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CountriesPlayer {
  id: string;
  room_id: string;
  name: string;
  lives: number;
  status: string;
  player_order: number;
  created_at: string;
}

export interface CountriesBurned {
  id: string;
  room_id: string;
  country_name: string;
  created_at: string;
}

export const createCountriesRoom = async (hostId: string): Promise<CountriesRoom | null> => {
  const { data, error } = await supabase
    .from('countries_rooms')
    .insert({ host_id: hostId })
    .select()
    .single();
  if (error) { console.error('Error creating countries room:', error); return null; }
  return data as CountriesRoom;
};

export const getCountriesRoom = async (code: string): Promise<CountriesRoom | null> => {
  const { data, error } = await supabase
    .from('countries_rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();
  if (error) return null;
  return data as CountriesRoom;
};

export const getCountriesRoomById = async (roomId: string): Promise<CountriesRoom | null> => {
  const { data, error } = await supabase
    .from('countries_rooms')
    .select('*')
    .eq('id', roomId)
    .single();
  if (error) return null;
  return data as CountriesRoom;
};

export const getCountriesPlayers = async (roomId: string): Promise<CountriesPlayer[]> => {
  const { data, error } = await supabase
    .from('countries_players')
    .select('*')
    .eq('room_id', roomId)
    .order('player_order', { ascending: true });
  if (error) return [];
  return data as CountriesPlayer[];
};

export const getCountriesBurned = async (roomId: string): Promise<CountriesBurned[]> => {
  const { data, error } = await supabase
    .from('countries_burned')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data as CountriesBurned[];
};

export const addPlayer = async (roomId: string, hostId: string, name: string): Promise<string | null> => {
  const { data, error } = await supabase.rpc('add_countries_player', {
    p_room_id: roomId, p_host_id: hostId, p_name: name,
  });
  if (error) { console.error('Error adding player:', error); return null; }
  return data as string;
};

export const removePlayer = async (roomId: string, hostId: string, playerId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('remove_countries_player', {
    p_room_id: roomId, p_host_id: hostId, p_player_id: playerId,
  });
  if (error) { console.error('Error removing player:', error); return false; }
  return !!data;
};

export const updatePlayerLives = async (roomId: string, hostId: string, playerId: string, delta: number): Promise<boolean> => {
  const { data, error } = await supabase.rpc('update_countries_player_lives', {
    p_room_id: roomId, p_host_id: hostId, p_player_id: playerId, p_delta: delta,
  });
  if (error) { console.error('Error updating lives:', error); return false; }
  return !!data;
};

export const addBurnedCountry = async (roomId: string, hostId: string, countryName: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('add_countries_burned', {
    p_room_id: roomId, p_host_id: hostId, p_country_name: countryName,
  });
  if (error) { console.error('Error adding burned country:', error); return false; }
  return !!data;
};

export const removeBurnedCountry = async (roomId: string, hostId: string, burnedId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('remove_countries_burned', {
    p_room_id: roomId, p_host_id: hostId, p_burned_id: burnedId,
  });
  if (error) { console.error('Error removing burned country:', error); return false; }
  return !!data;
};

export const swapPlayers = async (roomId: string, hostId: string, activePlayerId: string, eliminatedPlayerId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('swap_countries_players', {
    p_room_id: roomId, p_host_id: hostId, p_active_player_id: activePlayerId, p_eliminated_player_id: eliminatedPlayerId,
  });
  if (error) { console.error('Error swapping players:', error); return false; }
  return !!data;
};

export const deleteCountriesRoom = async (roomId: string, hostId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('delete_countries_room', {
    p_room_id: roomId, p_host_id: hostId,
  });
  if (error) { console.error('Error deleting room:', error); return false; }
  return !!data;
};
