
-- Fix restart_game_secure to properly assign imposters
-- The issue is that player_order values are random (0-999) not sequential (0,1,2...)
CREATE OR REPLACE FUNCTION public.restart_game_secure(p_room_id uuid, p_host_player_id uuid, p_secret_word text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_is_host boolean;
  v_imposter_count integer;
  v_player_ids uuid[];
  v_player_count integer;
  v_random_indices integer[];
  v_i integer;
  v_rand_idx integer;
BEGIN
  -- Verify host
  SELECT is_host INTO v_is_host
  FROM room_players
  WHERE room_id = p_room_id AND player_id = p_host_player_id;
  
  IF NOT v_is_host THEN
    RETURN false;
  END IF;
  
  -- Get room settings
  SELECT imposter_count INTO v_imposter_count
  FROM rooms
  WHERE id = p_room_id;
  
  -- Get all player IDs in the room
  SELECT array_agg(player_id), count(*)::integer
  INTO v_player_ids, v_player_count
  FROM room_players
  WHERE room_id = p_room_id;
  
  -- Reset room (keep scores by NOT resetting them)
  UPDATE rooms
  SET status = 'playing',
      secret_word = p_secret_word,
      current_player_index = 0,
      winner = NULL,
      word_guess_status = 'none',
      word_guessed = NULL,
      timer_started_at = NULL,
      timer_remaining = NULL,
      updated_at = now()
  WHERE id = p_room_id;
  
  -- Reset player game state but keep scores
  UPDATE room_players
  SET is_imposter = false,
      has_seen_role = false,
      votes = 0,
      voted_for = NULL
  WHERE room_id = p_room_id;
  
  -- Select random imposter indices (1-based for array access)
  v_random_indices := ARRAY[]::integer[];
  WHILE array_length(v_random_indices, 1) IS NULL OR array_length(v_random_indices, 1) < v_imposter_count LOOP
    v_rand_idx := floor(random() * v_player_count)::integer + 1;
    IF NOT v_rand_idx = ANY(v_random_indices) THEN
      v_random_indices := array_append(v_random_indices, v_rand_idx);
    END IF;
  END LOOP;
  
  -- Mark imposters using player_id from the array
  FOR v_i IN 1..array_length(v_random_indices, 1) LOOP
    UPDATE room_players
    SET is_imposter = true
    WHERE room_id = p_room_id AND player_id = v_player_ids[v_random_indices[v_i]];
  END LOOP;
  
  RETURN true;
END;
$function$;
