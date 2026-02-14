
CREATE OR REPLACE FUNCTION public.calculate_winner_secure(p_room_id uuid, p_host_player_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_is_host boolean;
  v_most_voted_id uuid;
  v_is_imposter boolean;
  v_winner text;
BEGIN
  SELECT is_host INTO v_is_host
  FROM room_players
  WHERE room_id = p_room_id AND player_id = p_host_player_id;
  
  IF NOT v_is_host THEN
    RETURN 'imposters';
  END IF;
  
  SELECT id, is_imposter INTO v_most_voted_id, v_is_imposter
  FROM room_players
  WHERE room_id = p_room_id
  ORDER BY votes DESC
  LIMIT 1;
  
  IF v_is_imposter THEN
    v_winner := 'players';
  ELSE
    v_winner := 'imposters';
  END IF;
  
  PERFORM update_player_scores(p_room_id, v_winner);
  
  -- Always enable word guess phase for the imposter
  UPDATE rooms
  SET status = 'finished',
      winner = v_winner,
      word_guess_status = 'pending',
      updated_at = now()
  WHERE id = p_room_id;
  
  RETURN v_winner;
END;
$function$;
