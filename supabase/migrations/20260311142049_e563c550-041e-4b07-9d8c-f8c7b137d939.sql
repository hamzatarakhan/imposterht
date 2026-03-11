CREATE OR REPLACE FUNCTION public.replay_guessing_room(
  p_room_id uuid,
  p_host_player_id uuid,
  p_word1 text,
  p_word2 text,
  p_categories text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_host BOOLEAN;
BEGIN
  SELECT is_host INTO v_is_host
  FROM guessing_players WHERE room_id = p_room_id AND player_id = p_host_player_id;

  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  UPDATE guessing_players SET wins = 0 WHERE room_id = p_room_id;

  UPDATE guessing_rooms
  SET status = 'playing',
      current_round = 1,
      round_winner_id = NULL,
      player1_word = p_word1,
      player2_word = p_word2,
      categories = COALESCE(p_categories, categories),
      updated_at = now()
  WHERE id = p_room_id;

  RETURN true;
END;
$$;