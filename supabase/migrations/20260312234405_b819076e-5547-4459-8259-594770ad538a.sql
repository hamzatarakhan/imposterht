
CREATE OR REPLACE FUNCTION public.rename_guessing_player(
  p_room_id uuid,
  p_requester_player_id text,
  p_target_player_id text,
  p_new_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_host boolean;
  v_room_status text;
BEGIN
  -- Check room exists and is waiting
  SELECT status INTO v_room_status FROM guessing_rooms WHERE id = p_room_id;
  IF v_room_status IS NULL OR v_room_status != 'waiting' THEN
    RETURN false;
  END IF;

  -- Check if requester is host
  SELECT is_host INTO v_is_host FROM guessing_players WHERE room_id = p_room_id AND player_id = p_requester_player_id;
  IF v_is_host IS NULL THEN RETURN false; END IF;

  -- Allow if host or editing self
  IF NOT v_is_host AND p_requester_player_id != p_target_player_id THEN
    RETURN false;
  END IF;

  UPDATE guessing_players SET name = p_new_name WHERE room_id = p_room_id AND player_id = p_target_player_id;
  
  -- Touch room to trigger realtime
  UPDATE guessing_rooms SET updated_at = now() WHERE id = p_room_id;
  
  RETURN true;
END;
$$;
