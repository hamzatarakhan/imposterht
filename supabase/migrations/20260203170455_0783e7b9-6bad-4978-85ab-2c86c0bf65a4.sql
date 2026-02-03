-- =============================================
-- SECURITY FIX: Comprehensive Security Migration (Fixed)
-- =============================================

-- 1. Fix function search_path for existing functions
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS character varying
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(6) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_room_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 2. Create a public view for rooms that hides secret_word
DROP VIEW IF EXISTS public.public_rooms;
CREATE VIEW public.public_rooms 
WITH (security_invoker = on)
AS
SELECT 
    id, code, host_id, status, player_count, imposter_count, 
    category, discussion_time, discussion_time_enabled, 
    current_player_index, winner, created_at, updated_at
FROM public.rooms;

-- 3. Create a public view for room_players that hides is_imposter for non-finished games
DROP VIEW IF EXISTS public.public_room_players;
CREATE VIEW public.public_room_players
WITH (security_invoker = on)
AS
SELECT 
    rp.id, rp.room_id, rp.player_id, rp.name, rp.avatar, 
    rp.is_host, rp.has_seen_role, rp.votes, rp.voted_for, 
    rp.player_order, rp.joined_at,
    CASE 
        WHEN r.status = 'finished' THEN rp.is_imposter
        ELSE NULL
    END as is_imposter
FROM public.room_players rp
JOIN public.rooms r ON r.id = rp.room_id;

-- 4. Function to get player's word (returns NULL for imposters)
CREATE OR REPLACE FUNCTION public.get_player_word(p_room_id UUID, p_player_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_imposter BOOLEAN;
    v_secret_word TEXT;
    v_player_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM room_players 
        WHERE room_id = p_room_id AND player_id = p_player_id
    ) INTO v_player_exists;
    
    IF NOT v_player_exists THEN
        RETURN NULL;
    END IF;
    
    SELECT is_imposter INTO v_is_imposter
    FROM room_players
    WHERE room_id = p_room_id AND player_id = p_player_id;
    
    IF v_is_imposter THEN
        RETURN NULL;
    END IF;
    
    SELECT secret_word INTO v_secret_word
    FROM rooms
    WHERE id = p_room_id;
    
    RETURN v_secret_word;
END;
$$;

-- 5. Function to check if player is imposter (secure way)
CREATE OR REPLACE FUNCTION public.get_my_role(p_room_id UUID, p_player_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_imposter BOOLEAN;
BEGIN
    SELECT is_imposter INTO v_is_imposter
    FROM room_players
    WHERE room_id = p_room_id AND player_id = p_player_id;
    
    RETURN COALESCE(v_is_imposter, FALSE);
END;
$$;

-- 6. Atomic vote submission function (fixes race condition)
CREATE OR REPLACE FUNCTION public.submit_vote_atomic(
    p_room_id UUID, 
    p_voter_player_id UUID, 
    p_voted_for_player_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_already_voted BOOLEAN;
BEGIN
    SELECT voted_for IS NOT NULL INTO v_already_voted
    FROM room_players
    WHERE room_id = p_room_id AND player_id = p_voter_player_id;
    
    IF v_already_voted THEN
        RETURN FALSE;
    END IF;
    
    UPDATE room_players
    SET voted_for = p_voted_for_player_id
    WHERE room_id = p_room_id AND player_id = p_voter_player_id;
    
    UPDATE room_players
    SET votes = votes + 1
    WHERE room_id = p_room_id AND player_id = p_voted_for_player_id;
    
    RETURN TRUE;
END;
$$;

-- 7. Secure start game function (host only)
CREATE OR REPLACE FUNCTION public.start_game_secure(
    p_room_id UUID,
    p_host_player_id UUID,
    p_secret_word TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_host BOOLEAN;
    v_room_status TEXT;
    v_player_count INTEGER;
    v_imposter_count INTEGER;
    v_players UUID[];
    v_imposter_indices INTEGER[];
    v_i INTEGER;
    v_random_idx INTEGER;
BEGIN
    SELECT host_id = p_host_player_id, status, imposter_count
    INTO v_is_host, v_room_status, v_imposter_count
    FROM rooms
    WHERE id = p_room_id;
    
    IF NOT v_is_host THEN
        RETURN FALSE;
    END IF;
    
    IF v_room_status != 'waiting' THEN
        RETURN FALSE;
    END IF;
    
    SELECT array_agg(player_id ORDER BY joined_at), count(*)::INTEGER
    INTO v_players, v_player_count
    FROM room_players
    WHERE room_id = p_room_id;
    
    IF v_player_count < 3 THEN
        RETURN FALSE;
    END IF;
    
    UPDATE room_players
    SET is_imposter = FALSE,
        has_seen_role = FALSE,
        votes = 0,
        voted_for = NULL,
        player_order = floor(random() * 1000)::INTEGER
    WHERE room_id = p_room_id;
    
    v_imposter_indices := ARRAY[]::INTEGER[];
    WHILE array_length(v_imposter_indices, 1) IS NULL OR array_length(v_imposter_indices, 1) < v_imposter_count LOOP
        v_random_idx := floor(random() * v_player_count)::INTEGER + 1;
        IF NOT (v_random_idx = ANY(v_imposter_indices)) THEN
            v_imposter_indices := array_append(v_imposter_indices, v_random_idx);
        END IF;
    END LOOP;
    
    FOR v_i IN 1..array_length(v_imposter_indices, 1) LOOP
        UPDATE room_players
        SET is_imposter = TRUE
        WHERE room_id = p_room_id AND player_id = v_players[v_imposter_indices[v_i]];
    END LOOP;
    
    UPDATE rooms
    SET status = 'playing',
        secret_word = p_secret_word,
        current_player_index = 0
    WHERE id = p_room_id;
    
    RETURN TRUE;
END;
$$;

-- 8. Secure update room function (host only)
CREATE OR REPLACE FUNCTION public.update_room_secure(
    p_room_id UUID,
    p_host_player_id UUID,
    p_status TEXT DEFAULT NULL,
    p_current_player_index INTEGER DEFAULT NULL,
    p_winner TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_host BOOLEAN;
BEGIN
    SELECT host_id = p_host_player_id INTO v_is_host
    FROM rooms
    WHERE id = p_room_id;
    
    IF NOT v_is_host THEN
        RETURN FALSE;
    END IF;
    
    UPDATE rooms
    SET status = COALESCE(p_status, status),
        current_player_index = COALESCE(p_current_player_index, current_player_index),
        winner = COALESCE(p_winner, winner)
    WHERE id = p_room_id;
    
    RETURN TRUE;
END;
$$;

-- 9. Secure delete room function (host only)
CREATE OR REPLACE FUNCTION public.delete_room_secure(
    p_room_id UUID,
    p_host_player_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_host BOOLEAN;
BEGIN
    SELECT host_id = p_host_player_id INTO v_is_host
    FROM rooms
    WHERE id = p_room_id;
    
    IF NOT v_is_host THEN
        RETURN FALSE;
    END IF;
    
    DELETE FROM rooms WHERE id = p_room_id;
    
    RETURN TRUE;
END;
$$;

-- 10. Function to mark role as seen
CREATE OR REPLACE FUNCTION public.mark_role_seen_secure(
    p_room_id UUID,
    p_player_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE room_players
    SET has_seen_role = TRUE
    WHERE room_id = p_room_id AND player_id = p_player_id;
    
    RETURN FOUND;
END;
$$;

-- 11. Function to leave room
CREATE OR REPLACE FUNCTION public.leave_room_secure(
    p_room_id UUID,
    p_player_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM room_players
    WHERE room_id = p_room_id AND player_id = p_player_id;
    
    RETURN FOUND;
END;
$$;

-- 12. Function to calculate winner
CREATE OR REPLACE FUNCTION public.calculate_winner_secure(
    p_room_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_most_voted_player RECORD;
    v_winner TEXT;
BEGIN
    SELECT player_id, is_imposter, votes
    INTO v_most_voted_player
    FROM room_players
    WHERE room_id = p_room_id
    ORDER BY votes DESC
    LIMIT 1;
    
    IF v_most_voted_player IS NULL THEN
        v_winner := 'imposters';
    ELSIF v_most_voted_player.is_imposter THEN
        v_winner := 'players';
    ELSE
        v_winner := 'imposters';
    END IF;
    
    UPDATE rooms
    SET status = 'finished',
        winner = v_winner
    WHERE id = p_room_id;
    
    RETURN v_winner;
END;
$$;

-- 13. Add database constraints using DO block to handle existing constraints
DO $$
BEGIN
    -- Check and add check_player_counts constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'rooms' AND constraint_name = 'check_player_counts'
    ) THEN
        ALTER TABLE rooms ADD CONSTRAINT check_player_counts 
        CHECK (player_count >= 3 AND player_count <= 20 AND imposter_count >= 1 AND imposter_count < player_count);
    END IF;
    
    -- Check and add check_discussion_time constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'rooms' AND constraint_name = 'check_discussion_time'
    ) THEN
        ALTER TABLE rooms ADD CONSTRAINT check_discussion_time 
        CHECK (discussion_time >= 10 AND discussion_time <= 600);
    END IF;
    
    -- Check and add check_name_not_empty constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'room_players' AND constraint_name = 'check_name_not_empty'
    ) THEN
        ALTER TABLE room_players ADD CONSTRAINT check_name_not_empty 
        CHECK (length(trim(name)) > 0);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Ignore if constraint already exists
END $$;

-- 14. Update RLS policies to be more restrictive
DROP POLICY IF EXISTS "Host can update their room" ON rooms;
DROP POLICY IF EXISTS "Host can delete their room" ON rooms;
DROP POLICY IF EXISTS "Players can leave room" ON room_players;
DROP POLICY IF EXISTS "Players can update themselves" ON room_players;

-- Drop any existing restrictive policies to avoid conflicts
DROP POLICY IF EXISTS "Room updates via RPC only" ON rooms;
DROP POLICY IF EXISTS "Room deletes via RPC only" ON rooms;
DROP POLICY IF EXISTS "Player updates via RPC only" ON room_players;
DROP POLICY IF EXISTS "Player deletes via RPC only" ON room_players;

-- Create new restrictive policies (block direct UPDATE/DELETE - must go through RPC)
CREATE POLICY "Room updates via RPC only" 
ON rooms FOR UPDATE 
USING (false);

CREATE POLICY "Room deletes via RPC only" 
ON rooms FOR DELETE 
USING (false);

CREATE POLICY "Player updates via RPC only" 
ON room_players FOR UPDATE 
USING (false);

CREATE POLICY "Player deletes via RPC only" 
ON room_players FOR DELETE 
USING (false);