
CREATE OR REPLACE FUNCTION public.get_guessing_spectator_words(p_room_id uuid)
RETURNS TABLE(player1_word text, player2_word text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status FROM guessing_rooms WHERE id = p_room_id;
  IF v_status NOT IN ('playing', 'round_result', 'finished') THEN RETURN; END IF;

  RETURN QUERY SELECT gr.player1_word, gr.player2_word FROM guessing_rooms gr WHERE gr.id = p_room_id;
END;
$$;
