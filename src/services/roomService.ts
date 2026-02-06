import { supabase } from '@/integrations/supabase/client';
import { Room, RoomPlayer } from '@/types/online';
import { getRandomWord, Category } from '@/data/words';

// Generate a unique player ID for this session
export const getOrCreatePlayerId = (): string => {
  let playerId = localStorage.getItem('imposter_player_id');
  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem('imposter_player_id', playerId);
  }
  return playerId;
};

// Generate a random 6-character room code
const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create a new room
export const createRoom = async (
  hostName: string,
  hostAvatar: string,
  settings: {
    playerCount: number;
    imposterCount: number;
    categories: Category[];
    discussionTime: number;
    discussionTimeEnabled: boolean;
  }
): Promise<{ room: Room; player: RoomPlayer } | null> => {
  const playerId = getOrCreatePlayerId();
  const code = generateRoomCode();

  // Create room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({
      code,
      host_id: playerId,
      player_count: settings.playerCount,
      imposter_count: settings.imposterCount,
      category: settings.categories[0] || 'random', // Keep for backward compat
      categories: JSON.stringify(settings.categories), // New field for multiple
      discussion_time: settings.discussionTime,
      discussion_time_enabled: settings.discussionTimeEnabled,
      status: 'waiting',
    })
    .select()
    .single();

  if (roomError || !room) {
    if (import.meta.env.DEV) {
      console.error('Room creation failed:', roomError?.code);
    }
    return null;
  }

  // Add host as first player
  const { data: player, error: playerError } = await supabase
    .from('room_players')
    .insert({
      room_id: room.id,
      player_id: playerId,
      name: hostName,
      avatar: hostAvatar,
      is_host: true,
      player_order: 0,
    })
    .select()
    .single();

  if (playerError || !player) {
    if (import.meta.env.DEV) {
      console.error('Host addition failed:', playerError?.code);
    }
    // Clean up room if player creation failed - use secure RPC
    await supabase.rpc('delete_room_secure', { 
      p_room_id: room.id, 
      p_host_player_id: playerId 
    });
    return null;
  }

  return { room: room as Room, player: player as RoomPlayer };
};

// Join an existing room by code
export const joinRoom = async (
  code: string,
  playerName: string,
  playerAvatar: string
): Promise<{ room: Room; player: RoomPlayer } | { error: string }> => {
  const playerId = getOrCreatePlayerId();
  const upperCode = code.toUpperCase();

  // Find room by code using the public view (excludes secret_word)
  const { data: room, error: roomError } = await supabase
    .from('public_rooms')
    .select('*')
    .eq('code', upperCode)
    .maybeSingle();

  if (roomError || !room) {
    return { error: 'الغرفة غير موجودة' };
  }

  if (room.status !== 'waiting') {
    return { error: 'اللعبة بدأت بالفعل' };
  }

  // Check if player already in room
  const { data: existingPlayer } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', room.id)
    .eq('player_id', playerId)
    .maybeSingle();

  if (existingPlayer) {
    return { room: room as Room, player: existingPlayer as RoomPlayer };
  }

  // Get current player count
  const { count } = await supabase
    .from('room_players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', room.id);

  if (count !== null && count >= room.player_count) {
    return { error: 'الغرفة ممتلئة' };
  }

  // Add player to room
  const { data: player, error: playerError } = await supabase
    .from('room_players')
    .insert({
      room_id: room.id,
      player_id: playerId,
      name: playerName,
      avatar: playerAvatar,
      is_host: false,
      player_order: count || 0,
    })
    .select()
    .single();

  if (playerError || !player) {
    if (import.meta.env.DEV) {
      console.error('Room join failed:', playerError?.code);
    }
    return { error: 'فشل الانضمام للغرفة' };
  }

  return { room: room as Room, player: player as RoomPlayer };
};

// Get room by ID using public view (excludes secret_word)
export const getRoom = async (roomId: string): Promise<Room | null> => {
  const { data, error } = await supabase
    .from('public_rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Room;
};

// Get all players in a room using public view (hides is_imposter until game finished)
export const getRoomPlayers = async (roomId: string): Promise<RoomPlayer[]> => {
  const { data, error } = await supabase
    .from('public_room_players')
    .select('*')
    .eq('room_id', roomId)
    .order('player_order', { ascending: true });

  if (error || !data) return [];
  return data as RoomPlayer[];
};

// Get my secret word securely (returns NULL for imposters)
export const getMySecretWord = async (roomId: string): Promise<string | null> => {
  const playerId = getOrCreatePlayerId();
  
  const { data, error } = await supabase.rpc('get_player_word', {
    p_room_id: roomId,
    p_player_id: playerId
  });
  
  if (error) {
    if (import.meta.env.DEV) {
      console.error('Get word failed:', error.code);
    }
    return null;
  }
  
  return data;
};

// Get my imposter status securely
export const getMyRole = async (roomId: string): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();
  
  const { data, error } = await supabase.rpc('get_my_role', {
    p_room_id: roomId,
    p_player_id: playerId
  });
  
  if (error) {
    if (import.meta.env.DEV) {
      console.error('Get role failed:', error.code);
    }
    return false;
  }
  
  return data || false;
};

// Start the game (host only) - uses secure RPC
export const startGame = async (roomId: string, categories: Category[]): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();

  // Generate secret word from multiple categories
  const secretWord = getRandomWord(categories, []);

  // Call secure RPC function
  const { data, error } = await supabase.rpc('start_game_secure', {
    p_room_id: roomId,
    p_host_player_id: playerId,
    p_secret_word: secretWord
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Start game failed:', error.code);
    }
    return false;
  }

  return data || false;
};

// Mark player as having seen their role - uses secure RPC
export const markRoleSeen = async (roomId: string): Promise<void> => {
  const playerId = getOrCreatePlayerId();

  const { error } = await supabase.rpc('mark_role_seen_secure', {
    p_room_id: roomId,
    p_player_id: playerId
  });

  if (error && import.meta.env.DEV) {
    console.error('Mark role seen failed:', error.code);
  }
};

// Update current player index - uses secure RPC
export const updateCurrentPlayerIndex = async (roomId: string, index: number): Promise<void> => {
  const playerId = getOrCreatePlayerId();
  
  const { error } = await supabase.rpc('update_room_secure', {
    p_room_id: roomId,
    p_host_player_id: playerId,
    p_current_player_index: index
  });

  if (error && import.meta.env.DEV) {
    console.error('Update index failed:', error.code);
  }
};

// Move to discussion phase - uses secure RPC
export const startDiscussion = async (roomId: string): Promise<void> => {
  const playerId = getOrCreatePlayerId();
  
  const { error } = await supabase.rpc('update_room_secure', {
    p_room_id: roomId,
    p_host_player_id: playerId,
    p_status: 'voting'
  });

  if (error && import.meta.env.DEV) {
    console.error('Start discussion failed:', error.code);
  }
};

// Submit vote - uses atomic RPC (fixes race condition)
export const submitVote = async (roomId: string, votedForPlayerId: string): Promise<void> => {
  const playerId = getOrCreatePlayerId();

  const { error } = await supabase.rpc('submit_vote_atomic', {
    p_room_id: roomId,
    p_voter_player_id: playerId,
    p_voted_for_player_id: votedForPlayerId
  });

  if (error && import.meta.env.DEV) {
    console.error('Submit vote failed:', error.code);
  }
};

// Calculate and set winner - uses secure RPC (host only)
export const calculateWinner = async (roomId: string): Promise<'imposters' | 'players'> => {
  const playerId = getOrCreatePlayerId();
  
  const { data, error } = await supabase.rpc('calculate_winner_secure', {
    p_room_id: roomId,
    p_host_player_id: playerId
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Calculate winner failed:', error.code);
    }
    return 'imposters';
  }

  return (data as 'imposters' | 'players') || 'imposters';
};

// Get secret word after game is finished (safe to show to all)
export const getFinishedGameWord = async (roomId: string): Promise<string | null> => {
  const { data, error } = await supabase.rpc('get_finished_game_word', {
    p_room_id: roomId
  });
  
  if (error) {
    if (import.meta.env.DEV) {
      console.error('Get finished word failed:', error.code);
    }
    return null;
  }
  
  return data;
};

// Get imposters after game is finished (safe reveal for all players)
export const getImpostersAfterFinish = async (roomId: string): Promise<{ player_id: string; name: string; avatar: string }[]> => {
  const { data, error } = await supabase.rpc('get_imposters_after_finish', {
    p_room_id: roomId
  });
  
  if (error) {
    if (import.meta.env.DEV) {
      console.error('Get imposters failed:', error.code);
    }
    return [];
  }
  
  return data || [];
};

// Restart game with same room and players (host only)
export const restartGame = async (roomId: string, categories: Category[]): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();
  
  // Generate new secret word
  const secretWord = getRandomWord(categories, []);
  
  const { data, error } = await supabase.rpc('restart_game_secure', {
    p_room_id: roomId,
    p_host_player_id: playerId,
    p_secret_word: secretWord
  });
  
  if (error) {
    if (import.meta.env.DEV) {
      console.error('Restart game failed:', error.code);
    }
    return false;
  }
  
  return data || false;
};

// Update timer state (host only) - uses secure RPC
export const updateTimer = async (
  roomId: string, 
  timerStartedAt: string | null, 
  timerRemaining: number | null
): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();
  
  const { data, error } = await supabase.rpc('update_timer_secure', {
    p_room_id: roomId,
    p_host_player_id: playerId,
    p_timer_started_at: timerStartedAt,
    p_timer_remaining: timerRemaining
  });

  if (error && import.meta.env.DEV) {
    console.error('Update timer failed:', error.code);
  }
  
  return data || false;
};

// Leave room - uses secure RPC
export const leaveRoom = async (roomId: string): Promise<void> => {
  const playerId = getOrCreatePlayerId();

  const { error } = await supabase.rpc('leave_room_secure', {
    p_room_id: roomId,
    p_player_id: playerId
  });

  if (error && import.meta.env.DEV) {
    console.error('Leave room failed:', error.code);
  }
};

// Delete room (host only) - uses secure RPC
export const deleteRoom = async (roomId: string): Promise<void> => {
  const playerId = getOrCreatePlayerId();
  
  const { error } = await supabase.rpc('delete_room_secure', {
    p_room_id: roomId,
    p_host_player_id: playerId
  });

  if (error && import.meta.env.DEV) {
    console.error('Delete room failed:', error.code);
  }
};

// Subscribe to room changes (uses public views for security)
export const subscribeToRoom = (
  roomId: string,
  onRoomChange: (room: Room) => void,
  onPlayersChange: (players: RoomPlayer[]) => void
) => {
  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      async () => {
        // Refetch room data via public view
        const room = await getRoom(roomId);
        if (room) {
          onRoomChange(room);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_players',
        filter: `room_id=eq.${roomId}`,
      },
      async () => {
        // Refetch all players via public view
        const players = await getRoomPlayers(roomId);
        onPlayersChange(players);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
