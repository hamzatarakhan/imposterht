
CREATE OR REPLACE FUNCTION public.change_guessing_words(p_room_id uuid, p_host_player_id uuid, p_word1 text, p_word2 text)
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

  UPDATE guessing_rooms
  SET player1_word = p_word1, player2_word = p_word2, updated_at = now()
  WHERE id = p_room_id AND status = 'playing';

  RETURN FOUND;
END;
$$;
