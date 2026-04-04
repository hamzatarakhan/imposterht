
CREATE OR REPLACE FUNCTION public.mark_guessing_winner(p_room_id uuid, p_host_player_id uuid, p_winner_player_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_is_host BOOLEAN;
  v_status TEXT;
BEGIN
  SELECT is_host INTO v_is_host
  FROM guessing_players WHERE room_id = p_room_id AND player_id = p_host_player_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  -- Only allow marking winner when game is actively playing
  SELECT status INTO v_status FROM guessing_rooms WHERE id = p_room_id;
  IF v_status != 'playing' THEN RETURN false; END IF;

  UPDATE guessing_players SET wins = wins + 1
  WHERE room_id = p_room_id AND player_id = p_winner_player_id;

  UPDATE guessing_rooms
  SET status = 'round_result', round_winner_id = p_winner_player_id, updated_at = now()
  WHERE id = p_room_id;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_guessing_draw(p_room_id uuid, p_host_player_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room guessing_rooms%ROWTYPE;
BEGIN
  SELECT * INTO v_room FROM guessing_rooms 
  WHERE id = p_room_id AND host_id = p_host_player_id AND status = 'playing';
  
  IF NOT FOUND THEN RETURN false; END IF;

  UPDATE guessing_rooms SET status = 'round_result', round_winner_id = NULL, updated_at = now() WHERE id = p_room_id;

  RETURN true;
END;
$function$;
