-- ===========================================
-- SECURITY FIX: Block direct table access, enforce views
-- ===========================================

-- 1. Drop existing permissive SELECT policies on base tables
DROP POLICY IF EXISTS "Anyone can read rooms by code" ON rooms;
DROP POLICY IF EXISTS "Anyone can read room players" ON room_players;

-- 2. Create restrictive SELECT policies that block direct access
CREATE POLICY "Block direct room reads" ON rooms FOR SELECT USING (false);
CREATE POLICY "Block direct player reads" ON room_players FOR SELECT USING (false);

-- 3. Recreate public_rooms view WITH security_invoker
DROP VIEW IF EXISTS public_rooms;
CREATE VIEW public_rooms 
WITH (security_invoker = on)
AS
SELECT 
  id, code, host_id, status, player_count, imposter_count,
  category, categories, discussion_time, discussion_time_enabled,
  current_player_index, winner, timer_started_at, timer_remaining,
  created_at, updated_at
FROM rooms;

-- 4. Recreate public_room_players view to ensure security_invoker is set
-- This view hides is_imposter until game is finished
DROP VIEW IF EXISTS public_room_players;
CREATE VIEW public_room_players 
WITH (security_invoker = on)
AS
SELECT 
  rp.id,
  rp.room_id,
  rp.player_id,
  rp.name,
  rp.avatar,
  rp.is_host,
  rp.has_seen_role,
  rp.votes,
  rp.voted_for,
  rp.player_order,
  rp.joined_at,
  -- Only show is_imposter if the room is finished
  CASE 
    WHEN r.status = 'finished' THEN rp.is_imposter
    ELSE NULL
  END as is_imposter
FROM room_players rp
JOIN rooms r ON r.id = rp.room_id;

-- 5. Grant SELECT on views to anon and authenticated roles
GRANT SELECT ON public_rooms TO anon, authenticated;
GRANT SELECT ON public_room_players TO anon, authenticated;

-- 6. Add input validation constraints
ALTER TABLE room_players DROP CONSTRAINT IF EXISTS check_name_length;
ALTER TABLE room_players ADD CONSTRAINT check_name_length CHECK (length(name) <= 50);

ALTER TABLE room_players DROP CONSTRAINT IF EXISTS check_avatar_length;
ALTER TABLE room_players ADD CONSTRAINT check_avatar_length CHECK (length(avatar) <= 10);

ALTER TABLE rooms DROP CONSTRAINT IF EXISTS check_code_format;
ALTER TABLE rooms ADD CONSTRAINT check_code_format CHECK (code ~ '^[A-Z0-9]{6}$');

-- ===========================================
-- 7. Fix calculate_winner_secure to require host authorization
-- ===========================================
CREATE OR REPLACE FUNCTION public.calculate_winner_secure(
  p_room_id UUID,
  p_host_player_id UUID  -- Add host verification parameter
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_host BOOLEAN;
  v_room_status TEXT;
  v_most_voted_player RECORD;
  v_winner TEXT;
BEGIN
  -- 1. Verify caller is the host
  SELECT host_id = p_host_player_id, status
  INTO v_is_host, v_room_status
  FROM rooms WHERE id = p_room_id;
  
  IF NOT v_is_host THEN
    RETURN NULL; -- Silently fail for non-hosts
  END IF;
  
  -- 2. Verify game is in voting phase
  IF v_room_status != 'voting' THEN
    -- If already finished, return current winner
    IF v_room_status = 'finished' THEN
      SELECT winner INTO v_winner FROM rooms WHERE id = p_room_id;
      RETURN v_winner;
    END IF;
    RETURN NULL;
  END IF;
  
  -- 3. Calculate winner
  SELECT player_id, is_imposter, votes INTO v_most_voted_player
  FROM room_players WHERE room_id = p_room_id
  ORDER BY votes DESC LIMIT 1;
  
  IF v_most_voted_player IS NULL THEN
    v_winner := 'imposters';
  ELSIF v_most_voted_player.is_imposter THEN
    v_winner := 'players';
  ELSE
    v_winner := 'imposters';
  END IF;
  
  UPDATE rooms SET status = 'finished', winner = v_winner WHERE id = p_room_id;
  RETURN v_winner;
END;
$$;

-- ===========================================
-- 8. Add cleanup function for old rooms (informational)
-- ===========================================
CREATE OR REPLACE FUNCTION public.cleanup_old_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete waiting rooms older than 24 hours
  DELETE FROM rooms 
  WHERE status = 'waiting' 
    AND created_at < NOW() - INTERVAL '24 hours';
  
  -- Delete finished games older than 1 hour
  DELETE FROM rooms
  WHERE status = 'finished'
    AND updated_at < NOW() - INTERVAL '1 hour';
  
  -- Delete abandoned playing/voting games older than 6 hours
  DELETE FROM rooms
  WHERE status IN ('playing', 'voting')
    AND updated_at < NOW() - INTERVAL '6 hours';
END;
$$;