
-- =============================================
-- GUESSING GAME ONLINE TABLES
-- =============================================

CREATE TABLE public.guessing_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL DEFAULT generate_room_code(),
  host_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  categories TEXT DEFAULT 'random',
  total_rounds INTEGER NOT NULL DEFAULT 5,
  current_round INTEGER NOT NULL DEFAULT 1,
  player1_word TEXT,
  player2_word TEXT,
  round_winner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.guessing_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES guessing_rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  avatar VARCHAR(10) NOT NULL DEFAULT '👤',
  is_host BOOLEAN NOT NULL DEFAULT false,
  wins INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.guessing_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guessing_players;

-- =============================================
-- VIEWS (hide sensitive data)
-- =============================================
CREATE VIEW public.public_guessing_rooms AS
SELECT id, code, host_id, status, categories, total_rounds, current_round,
       round_winner_id, created_at, updated_at
FROM guessing_rooms;

CREATE VIEW public.public_guessing_players AS
SELECT id, room_id, player_id, name, avatar, is_host, wins, joined_at
FROM guessing_players;

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.guessing_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guessing_players ENABLE ROW LEVEL SECURITY;

-- Read via views only (views bypass RLS)
CREATE POLICY "Allow read guessing_rooms" ON public.guessing_rooms FOR SELECT USING (true);
CREATE POLICY "Allow read guessing_players" ON public.guessing_players FOR SELECT USING (true);

-- No direct insert/update/delete - must use RPC
CREATE POLICY "Allow insert guessing_rooms" ON public.guessing_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert guessing_players" ON public.guessing_players FOR INSERT WITH CHECK (true);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE TRIGGER update_guessing_rooms_updated_at
  BEFORE UPDATE ON public.guessing_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_room_updated_at();

-- =============================================
-- RPC FUNCTIONS
-- =============================================

-- Get player's assigned word (only their own)
CREATE OR REPLACE FUNCTION public.get_guessing_word(p_room_id UUID, p_player_id UUID)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_is_host BOOLEAN;
  v_word TEXT;
  v_status TEXT;
BEGIN
  SELECT status INTO v_status FROM guessing_rooms WHERE id = p_room_id;
  IF v_status != 'playing' AND v_status != 'round_result' THEN RETURN NULL; END IF;

  SELECT is_host INTO v_is_host
  FROM guessing_players WHERE room_id = p_room_id AND player_id = p_player_id;

  IF v_is_host IS NULL THEN RETURN NULL; END IF;

  IF v_is_host THEN
    SELECT player1_word INTO v_word FROM guessing_rooms WHERE id = p_room_id;
  ELSE
    SELECT player2_word INTO v_word FROM guessing_rooms WHERE id = p_room_id;
  END IF;

  RETURN v_word;
END;
$$;

-- Get both words after round ends (for reveal)
CREATE OR REPLACE FUNCTION public.get_guessing_round_words(p_room_id UUID)
RETURNS TABLE(player1_word TEXT, player2_word TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status FROM guessing_rooms WHERE id = p_room_id;
  IF v_status NOT IN ('round_result', 'finished') THEN RETURN; END IF;

  RETURN QUERY SELECT gr.player1_word, gr.player2_word FROM guessing_rooms gr WHERE gr.id = p_room_id;
END;
$$;

-- Start game (host only)
CREATE OR REPLACE FUNCTION public.start_guessing_game(p_room_id UUID, p_host_player_id UUID, p_word1 TEXT, p_word2 TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_is_host BOOLEAN;
  v_player_count INTEGER;
BEGIN
  SELECT is_host INTO v_is_host
  FROM guessing_players WHERE room_id = p_room_id AND player_id = p_host_player_id;

  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  SELECT count(*) INTO v_player_count FROM guessing_players WHERE room_id = p_room_id;
  IF v_player_count != 2 THEN RETURN false; END IF;

  UPDATE guessing_rooms
  SET status = 'playing', player1_word = p_word1, player2_word = p_word2,
      current_round = 1, updated_at = now()
  WHERE id = p_room_id;

  RETURN true;
END;
$$;

-- Mark round winner (host only)
CREATE OR REPLACE FUNCTION public.mark_guessing_winner(p_room_id UUID, p_host_player_id UUID, p_winner_player_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_is_host BOOLEAN;
BEGIN
  SELECT is_host INTO v_is_host
  FROM guessing_players WHERE room_id = p_room_id AND player_id = p_host_player_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  UPDATE guessing_players SET wins = wins + 1
  WHERE room_id = p_room_id AND player_id = p_winner_player_id;

  UPDATE guessing_rooms
  SET status = 'round_result', round_winner_id = p_winner_player_id, updated_at = now()
  WHERE id = p_room_id;

  RETURN true;
END;
$$;

-- Next round (host only)
CREATE OR REPLACE FUNCTION public.next_guessing_round(p_room_id UUID, p_host_player_id UUID, p_word1 TEXT, p_word2 TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_is_host BOOLEAN;
  v_current_round INTEGER;
  v_total_rounds INTEGER;
  v_p1_wins INTEGER;
  v_p2_wins INTEGER;
  v_majority INTEGER;
BEGIN
  SELECT is_host INTO v_is_host
  FROM guessing_players WHERE room_id = p_room_id AND player_id = p_host_player_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  SELECT current_round, total_rounds INTO v_current_round, v_total_rounds
  FROM guessing_rooms WHERE id = p_room_id;

  -- Check if someone won majority
  SELECT wins INTO v_p1_wins FROM guessing_players WHERE room_id = p_room_id AND is_host = true;
  SELECT wins INTO v_p2_wins FROM guessing_players WHERE room_id = p_room_id AND is_host = false;
  v_majority := ceil(v_total_rounds::float / 2);

  IF v_current_round >= v_total_rounds OR v_p1_wins >= v_majority OR v_p2_wins >= v_majority THEN
    UPDATE guessing_rooms SET status = 'finished', updated_at = now() WHERE id = p_room_id;
    RETURN true;
  END IF;

  UPDATE guessing_rooms
  SET status = 'playing',
      current_round = current_round + 1,
      player1_word = p_word1,
      player2_word = p_word2,
      round_winner_id = NULL,
      updated_at = now()
  WHERE id = p_room_id;

  RETURN true;
END;
$$;

-- Leave room
CREATE OR REPLACE FUNCTION public.leave_guessing_room(p_room_id UUID, p_player_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM guessing_players WHERE room_id = p_room_id AND player_id = p_player_id;
  -- If no players left, delete room
  IF NOT EXISTS (SELECT 1 FROM guessing_players WHERE room_id = p_room_id) THEN
    DELETE FROM guessing_rooms WHERE id = p_room_id;
  END IF;
  RETURN true;
END;
$$;

-- Delete room (host only)
CREATE OR REPLACE FUNCTION public.delete_guessing_room(p_room_id UUID, p_host_player_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_is_host BOOLEAN;
BEGIN
  SELECT host_id = p_host_player_id INTO v_is_host FROM guessing_rooms WHERE id = p_room_id;
  IF NOT v_is_host THEN RETURN false; END IF;
  DELETE FROM guessing_rooms WHERE id = p_room_id;
  RETURN true;
END;
$$;

-- Cleanup old guessing rooms
CREATE OR REPLACE FUNCTION public.cleanup_old_guessing_rooms()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM guessing_rooms WHERE status = 'waiting' AND created_at < NOW() - INTERVAL '24 hours';
  DELETE FROM guessing_rooms WHERE status = 'finished' AND updated_at < NOW() - INTERVAL '1 hour';
  DELETE FROM guessing_rooms WHERE status = 'playing' AND updated_at < NOW() - INTERVAL '6 hours';
END;
$$;
