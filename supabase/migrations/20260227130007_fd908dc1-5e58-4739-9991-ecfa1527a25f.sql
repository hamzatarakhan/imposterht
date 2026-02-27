
CREATE OR REPLACE FUNCTION public.mark_guessing_draw(p_room_id uuid, p_host_player_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room guessing_rooms%ROWTYPE;
BEGIN
  SELECT * INTO v_room FROM guessing_rooms WHERE id = p_room_id AND host_id = p_host_player_id AND status = 'playing';
  IF NOT FOUND THEN RETURN false; END IF;

  IF v_room.current_round >= v_room.total_rounds THEN
    UPDATE guessing_rooms SET status = 'finished', round_winner_id = NULL, updated_at = now() WHERE id = p_room_id;
  ELSE
    UPDATE guessing_rooms SET status = 'round_result', round_winner_id = NULL, updated_at = now() WHERE id = p_room_id;
  END IF;

  RETURN true;
END;
$$;
