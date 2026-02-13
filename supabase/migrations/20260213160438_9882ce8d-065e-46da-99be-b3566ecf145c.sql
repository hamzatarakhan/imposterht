
-- Allow a player to rename themselves, or the host to rename anyone, while room is 'waiting'
CREATE OR REPLACE FUNCTION public.rename_player_secure(
  p_room_id uuid,
  p_requester_player_id uuid,
  p_target_player_id uuid,
  p_new_name text,
  p_new_avatar text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_room_status text;
  v_is_host boolean;
  v_is_self boolean;
BEGIN
  -- Check room is still waiting
  SELECT status INTO v_room_status FROM rooms WHERE id = p_room_id;
  IF v_room_status != 'waiting' THEN
    RETURN false;
  END IF;

  -- Check if requester is the target (self-rename) or host
  v_is_self := (p_requester_player_id = p_target_player_id);
  
  SELECT is_host INTO v_is_host
  FROM room_players
  WHERE room_id = p_room_id AND player_id = p_requester_player_id;

  IF NOT v_is_self AND NOT COALESCE(v_is_host, false) THEN
    RETURN false;
  END IF;

  -- Update name and optionally avatar
  UPDATE room_players
  SET name = p_new_name,
      avatar = COALESCE(p_new_avatar, avatar)
  WHERE room_id = p_room_id AND player_id = p_target_player_id;

  RETURN FOUND;
END;
$$;
