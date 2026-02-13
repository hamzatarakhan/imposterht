// Online game types

export interface Room {
  id: string;
  code: string;
  host_id: string;
  status: 'waiting' | 'playing' | 'voting' | 'finished';
  player_count: number;
  imposter_count: number;
  category: string;
  categories: string | null; // JSON string of Category[]
  secret_word?: string | null; // Optional - hidden in public view
  discussion_time: number;
  discussion_time_enabled: boolean;
  current_player_index: number;
  winner: 'imposters' | 'players' | null;
  timer_started_at: string | null;
  timer_remaining: number | null;
  word_guess_status?: string | null;
  word_guessed?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string;
  name: string;
  avatar: string;
  is_host: boolean;
  is_imposter: boolean;
  has_seen_role: boolean;
  votes: number;
  voted_for: string | null;
  player_order: number;
  score: number;
  joined_at: string;
}

export type OnlineGameScreen = 
  | 'modeSelect'
  | 'createRoom'
  | 'joinRoom'
  | 'lobby'
  | 'onlineShowRole'
  | 'onlineDiscussion'
  | 'onlineVoting'
  | 'onlineResult';
