-- Function to get imposters after game is finished (safe reveal)
CREATE OR REPLACE FUNCTION public.get_imposters_after_finish(p_room_id uuid)
RETURNS TABLE(player_id uuid, name varchar, avatar varchar) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_status TEXT;
BEGIN
    -- Only return imposters if game is finished
    SELECT status INTO v_status
    FROM rooms
    WHERE id = p_room_id;
    
    IF v_status = 'finished' THEN
        RETURN QUERY
        SELECT rp.player_id, rp.name, rp.avatar
        FROM room_players rp
        WHERE rp.room_id = p_room_id AND rp.is_imposter = true;
    END IF;
    
    RETURN;
END;
$$;

-- Function to restart game with same room and players (host only)
CREATE OR REPLACE FUNCTION public.restart_game_secure(
    p_room_id uuid,
    p_host_player_id uuid,
    p_secret_word text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_host BOOLEAN;
    v_player_count INTEGER;
    v_imposter_count INTEGER;
    v_players UUID[];
    v_imposter_indices INTEGER[];
    v_i INTEGER;
    v_random_idx INTEGER;
BEGIN
    -- Verify host
    SELECT host_id = p_host_player_id, imposter_count
    INTO v_is_host, v_imposter_count
    FROM rooms
    WHERE id = p_room_id;
    
    IF NOT v_is_host THEN
        RETURN FALSE;
    END IF;
    
    -- Get all players
    SELECT array_agg(player_id ORDER BY joined_at), count(*)::INTEGER
    INTO v_players, v_player_count
    FROM room_players
    WHERE room_id = p_room_id;
    
    IF v_player_count < 3 THEN
        RETURN FALSE;
    END IF;
    
    -- Reset all players
    UPDATE room_players
    SET is_imposter = FALSE,
        has_seen_role = FALSE,
        votes = 0,
        voted_for = NULL,
        player_order = floor(random() * 1000)::INTEGER
    WHERE room_id = p_room_id;
    
    -- Select random imposters
    v_imposter_indices := ARRAY[]::INTEGER[];
    WHILE array_length(v_imposter_indices, 1) IS NULL OR array_length(v_imposter_indices, 1) < v_imposter_count LOOP
        v_random_idx := floor(random() * v_player_count)::INTEGER + 1;
        IF NOT (v_random_idx = ANY(v_imposter_indices)) THEN
            v_imposter_indices := array_append(v_imposter_indices, v_random_idx);
        END IF;
    END LOOP;
    
    -- Mark imposters
    FOR v_i IN 1..array_length(v_imposter_indices, 1) LOOP
        UPDATE room_players
        SET is_imposter = TRUE
        WHERE room_id = p_room_id AND player_id = v_players[v_imposter_indices[v_i]];
    END LOOP;
    
    -- Reset room to playing state
    UPDATE rooms
    SET status = 'playing',
        secret_word = p_secret_word,
        current_player_index = 0,
        winner = NULL,
        timer_started_at = NULL,
        timer_remaining = NULL
    WHERE id = p_room_id;
    
    RETURN TRUE;
END;
$$;