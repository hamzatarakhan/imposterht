import { supabase } from '@/integrations/supabase/client';
import { getOrCreatePlayerId } from './roomService';
import { getGuessingRandomWord, GuessingCategory } from '@/data/guessingWords';

export interface GuessingRoom {
  id: string;
  code: string;
  host_id: string;
  status: 'waiting' | 'playing' | 'round_result' | 'finished';
  categories: string;
  total_rounds: number;
  current_round: number;
  turn_time: number;
  round_winner_id: string | null;
  voice_chat_enabled: boolean;
  presence_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuessingPlayer {
  id: string;
  room_id: string;
  player_id: string;
  name: string;
  avatar: string;
  is_host: boolean;
  wins: number;
  joined_at: string;
}

// Create a guessing room
export const createGuessingRoom = async (
  hostName: string,
  hostAvatar: string,
  settings: { categories: GuessingCategory[]; totalRounds: number; turnTime?: number; voiceChatEnabled?: boolean; presenceEnabled?: boolean }
): Promise<{ room: GuessingRoom; player: GuessingPlayer } | null> => {
  const playerId = getOrCreatePlayerId();

  const { data: room, error: roomError } = await supabase
    .from('guessing_rooms')
    .insert({
      host_id: playerId,
      categories: JSON.stringify(settings.categories),
      total_rounds: settings.totalRounds,
      turn_time: settings.turnTime || 60,
      voice_chat_enabled: settings.voiceChatEnabled || false,
      presence_enabled: settings.presenceEnabled || false,
      status: 'waiting',
    })
    .select()
    .single();

  if (roomError || !room) return null;

  const { data: player, error: playerError } = await supabase
    .from('guessing_players')
    .insert({
      room_id: room.id,
      player_id: playerId,
      name: hostName,
      avatar: hostAvatar,
      is_host: true,
    })
    .select()
    .single();

  if (playerError || !player) {
    await supabase.rpc('delete_guessing_room', { p_room_id: room.id, p_host_player_id: playerId });
    return null;
  }

  return { room: room as GuessingRoom, player: player as GuessingPlayer };
};

// Join a guessing room
export const joinGuessingRoom = async (
  code: string, name: string, avatar: string
): Promise<{ room: GuessingRoom; player: GuessingPlayer } | { error: string }> => {
  const playerId = getOrCreatePlayerId();

  const { data: room, error: roomError } = await supabase
    .from('public_guessing_rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (roomError || !room) return { error: 'الغرفة غير موجودة' };
  if (room.status !== 'waiting') return { error: 'اللعبة بدأت بالفعل' };

  // Check if already in room
  const { data: existing } = await supabase
    .from('guessing_players')
    .select('*')
    .eq('room_id', room.id)
    .eq('player_id', playerId)
    .maybeSingle();

  if (existing) return { room: room as GuessingRoom, player: existing as GuessingPlayer };

  // Check player count (max 2)
  const { count } = await supabase
    .from('guessing_players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', room.id);

  if (count !== null && count >= 2) return { error: 'الغرفة ممتلئة (لاعبين فقط)' };

  const { data: player, error: playerError } = await supabase
    .from('guessing_players')
    .insert({ room_id: room.id, player_id: playerId, name, avatar, is_host: false })
    .select()
    .single();

  if (playerError || !player) return { error: 'فشل الانضمام' };

  return { room: room as GuessingRoom, player: player as GuessingPlayer };
};

// Get room
export const getGuessingRoom = async (roomId: string): Promise<GuessingRoom | null> => {
  const { data } = await supabase
    .from('public_guessing_rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();
  return data as GuessingRoom | null;
};

// Get players
export const getGuessingPlayers = async (roomId: string): Promise<GuessingPlayer[]> => {
  const { data } = await supabase
    .from('public_guessing_players')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });
  return (data as GuessingPlayer[]) || [];
};

// Start game (host only)
export const startGuessingGame = async (roomId: string, categories: GuessingCategory[]): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();
  const usedWords: string[] = [];
  const w1 = getGuessingRandomWord(categories, usedWords);
  const w2 = getGuessingRandomWord(categories, [...usedWords, w1]);

  const { data, error } = await supabase.rpc('start_guessing_game', {
    p_room_id: roomId, p_host_player_id: playerId, p_word1: w1, p_word2: w2,
  });
  if (error) { console.error('Start guessing game failed:', error); return false; }
  return data || false;
};

// Get my word
export const getMyGuessingWord = async (roomId: string): Promise<string | null> => {
  const playerId = getOrCreatePlayerId();
  const { data, error } = await supabase.rpc('get_guessing_word', {
    p_room_id: roomId, p_player_id: playerId,
  });
  if (error) return null;
  return data;
};

// Get spectator words (visible during playing too)
export const getGuessingSpectatorWords = async (roomId: string): Promise<{ player1_word: string; player2_word: string } | null> => {
  const { data, error } = await supabase.rpc('get_guessing_spectator_words', { p_room_id: roomId });
  if (error || !data || data.length === 0) return null;
  return data[0];
};

// Get round words (after round ends)
export const getGuessingRoundWords = async (roomId: string): Promise<{ player1_word: string; player2_word: string } | null> => {
  const { data, error } = await supabase.rpc('get_guessing_round_words', { p_room_id: roomId });
  if (error || !data || data.length === 0) return null;
  return data[0];
};

// Mark winner (host only)
export const markGuessingWinner = async (roomId: string, winnerPlayerId: string): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();
  const { data, error } = await supabase.rpc('mark_guessing_winner', {
    p_room_id: roomId, p_host_player_id: playerId, p_winner_player_id: winnerPlayerId,
  });
  if (error) { console.error('Mark winner failed:', error); return false; }
  return data || false;
};

// Next round (host only)
export const nextGuessingRound = async (roomId: string, categories: GuessingCategory[]): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();
  const w1 = getGuessingRandomWord(categories, []);
  const w2 = getGuessingRandomWord(categories, [w1]);

  const { data, error } = await supabase.rpc('next_guessing_round', {
    p_room_id: roomId, p_host_player_id: playerId, p_word1: w1, p_word2: w2,
  });
  if (error) { console.error('Next round failed:', error); return false; }
  return data || false;
};

// Mark draw (host only)
export const markGuessingDraw = async (roomId: string): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();
  const { data, error } = await supabase.rpc('mark_guessing_draw', {
    p_room_id: roomId, p_host_player_id: playerId,
  });
  if (error) { console.error('Mark draw failed:', error); return false; }
  return data || false;
};

// Leave room
export const leaveGuessingRoom = async (roomId: string): Promise<void> => {
  const playerId = getOrCreatePlayerId();
  await supabase.rpc('leave_guessing_room', { p_room_id: roomId, p_player_id: playerId });
};

// Change words (host only, same round)
export const changeGuessingWords = async (roomId: string, categories: GuessingCategory[]): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();
  const w1 = getGuessingRandomWord(categories, []);
  const w2 = getGuessingRandomWord(categories, [w1]);

  const { data, error } = await supabase.rpc('change_guessing_words', {
    p_room_id: roomId, p_host_player_id: playerId, p_word1: w1, p_word2: w2,
  });
  if (error) { console.error('Change words failed:', error); return false; }
  return data || false;
};

// Replay room (host only) — reset wins, round, set new words
export const replayGuessingRoom = async (roomId: string, categories: GuessingCategory[], newCategories?: string): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();
  const cats = newCategories ? JSON.parse(newCategories) as GuessingCategory[] : categories;
  const w1 = getGuessingRandomWord(cats, []);
  const w2 = getGuessingRandomWord(cats, [w1]);

  const { data, error } = await supabase.rpc('replay_guessing_room', {
    p_room_id: roomId,
    p_host_player_id: playerId,
    p_word1: w1,
    p_word2: w2,
    p_categories: newCategories || null,
  });
  if (error) { console.error('Replay guessing room failed:', error); return false; }
  return data || false;
};

// Rename a guessing player (host can rename anyone, players can rename self)
export const renameGuessingPlayer = async (roomId: string, targetPlayerId: string, newName: string): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();
  const { data, error } = await supabase.rpc('rename_guessing_player', {
    p_room_id: roomId, p_requester_player_id: playerId, p_target_player_id: targetPlayerId, p_new_name: newName,
  });
  if (error) { console.error('Rename guessing player failed:', error); return false; }
  return data || false;
};

// Delete room (host)
export const deleteGuessingRoom = async (roomId: string): Promise<void> => {
  const playerId = getOrCreatePlayerId();
  await supabase.rpc('delete_guessing_room', { p_room_id: roomId, p_host_player_id: playerId });
};

// Subscribe to guessing room changes
export const subscribeToGuessingRoom = (
  roomId: string,
  onRoomChange: (room: GuessingRoom) => void,
  onPlayersChange: (players: GuessingPlayer[]) => void
) => {
  const channel = supabase
    .channel(`guessing-room-${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guessing_rooms', filter: `id=eq.${roomId}` },
      async () => {
        const room = await getGuessingRoom(roomId);
        if (room) onRoomChange(room);
      })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guessing_players', filter: `room_id=eq.${roomId}` },
      async () => {
        const players = await getGuessingPlayers(roomId);
        onPlayersChange(players);
      })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
};
