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
    category: string;
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
      category: settings.category,
      discussion_time: settings.discussionTime,
      discussion_time_enabled: settings.discussionTimeEnabled,
      status: 'waiting',
    })
    .select()
    .single();

  if (roomError || !room) {
    console.error('Error creating room:', roomError);
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
    console.error('Error adding host:', playerError);
    // Clean up room if player creation failed
    await supabase.from('rooms').delete().eq('id', room.id);
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

  // Find room by code
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', upperCode)
    .single();

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
    .single();

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
    console.error('Error joining room:', playerError);
    return { error: 'فشل الانضمام للغرفة' };
  }

  return { room: room as Room, player: player as RoomPlayer };
};

// Get room by ID
export const getRoom = async (roomId: string): Promise<Room | null> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error || !data) return null;
  return data as Room;
};

// Get all players in a room
export const getRoomPlayers = async (roomId: string): Promise<RoomPlayer[]> => {
  const { data, error } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', roomId)
    .order('player_order', { ascending: true });

  if (error || !data) return [];
  return data as RoomPlayer[];
};

// Start the game (host only)
export const startGame = async (roomId: string, category: Category): Promise<boolean> => {
  const playerId = getOrCreatePlayerId();

  // Verify host
  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (!room || room.host_id !== playerId) return false;

  // Get all players
  const { data: players } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', roomId)
    .order('player_order', { ascending: true });

  if (!players || players.length < 3) return false;

  // Generate secret word
  const secretWord = getRandomWord(category, []);

  // Randomly select imposters
  const imposterIndices: number[] = [];
  while (imposterIndices.length < room.imposter_count) {
    const randomIndex = Math.floor(Math.random() * players.length);
    if (!imposterIndices.includes(randomIndex)) {
      imposterIndices.push(randomIndex);
    }
  }

  // Shuffle player order
  const shuffledOrder = players.map((_, i) => i).sort(() => Math.random() - 0.5);

  // Update each player
  for (let i = 0; i < players.length; i++) {
    await supabase
      .from('room_players')
      .update({
        is_imposter: imposterIndices.includes(i),
        player_order: shuffledOrder[i],
        has_seen_role: false,
        votes: 0,
        voted_for: null,
      })
      .eq('id', players[i].id);
  }

  // Update room status
  await supabase
    .from('rooms')
    .update({
      status: 'playing',
      secret_word: secretWord,
      current_player_index: 0,
    })
    .eq('id', roomId);

  return true;
};

// Mark player as having seen their role
export const markRoleSeen = async (roomId: string): Promise<void> => {
  const playerId = getOrCreatePlayerId();

  await supabase
    .from('room_players')
    .update({ has_seen_role: true })
    .eq('room_id', roomId)
    .eq('player_id', playerId);
};

// Update current player index
export const updateCurrentPlayerIndex = async (roomId: string, index: number): Promise<void> => {
  await supabase
    .from('rooms')
    .update({ current_player_index: index })
    .eq('id', roomId);
};

// Move to discussion phase
export const startDiscussion = async (roomId: string): Promise<void> => {
  await supabase
    .from('rooms')
    .update({ status: 'voting' })
    .eq('id', roomId);
};

// Submit vote
export const submitVote = async (roomId: string, votedForPlayerId: string): Promise<void> => {
  const playerId = getOrCreatePlayerId();

  // Update voter's voted_for
  await supabase
    .from('room_players')
    .update({ voted_for: votedForPlayerId })
    .eq('room_id', roomId)
    .eq('player_id', playerId);

  // Increment votes for the voted player
  const { data: votedPlayer } = await supabase
    .from('room_players')
    .select('votes')
    .eq('room_id', roomId)
    .eq('player_id', votedForPlayerId)
    .single();

  if (votedPlayer) {
    await supabase
      .from('room_players')
      .update({ votes: votedPlayer.votes + 1 })
      .eq('room_id', roomId)
      .eq('player_id', votedForPlayerId);
  }
};

// Calculate and set winner
export const calculateWinner = async (roomId: string): Promise<'imposters' | 'players'> => {
  const { data: players } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', roomId)
    .order('votes', { ascending: false });

  if (!players || players.length === 0) return 'imposters';

  const mostVoted = players[0];
  const winner = mostVoted.is_imposter ? 'players' : 'imposters';

  await supabase
    .from('rooms')
    .update({
      status: 'finished',
      winner,
    })
    .eq('id', roomId);

  return winner;
};

// Leave room
export const leaveRoom = async (roomId: string): Promise<void> => {
  const playerId = getOrCreatePlayerId();

  await supabase
    .from('room_players')
    .delete()
    .eq('room_id', roomId)
    .eq('player_id', playerId);
};

// Delete room (host only)
export const deleteRoom = async (roomId: string): Promise<void> => {
  await supabase.from('rooms').delete().eq('id', roomId);
};

// Subscribe to room changes
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
      (payload) => {
        if (payload.new) {
          onRoomChange(payload.new as Room);
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
        // Refetch all players when any change happens
        const players = await getRoomPlayers(roomId);
        onPlayersChange(players);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
