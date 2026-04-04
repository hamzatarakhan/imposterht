CREATE OR REPLACE FUNCTION public.next_guessing_round(p_room_id uuid, p_host_player_id uuid, p_word1 text, p_word2 text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_is_host BOOLEAN;
  v_current_round INTEGER;
  v_total_rounds INTEGER;
  v_status TEXT;
BEGIN
  SELECT is_host INTO v_is_host
  FROM guessing_players WHERE room_id = p_room_id AND player_id = p_host_player_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  SELECT current_round, total_rounds, status INTO v_current_round, v_total_rounds, v_status
  FROM guessing_rooms WHERE id = p_room_id;

  -- Only allow from round_result status to prevent double-clicks
  IF v_status != 'round_result' THEN RETURN false; END IF;

  IF v_current_round >= v_total_rounds THEN
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
$function$;