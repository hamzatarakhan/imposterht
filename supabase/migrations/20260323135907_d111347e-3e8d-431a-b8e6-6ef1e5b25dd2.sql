
CREATE OR REPLACE FUNCTION public.update_countries_player_lives(p_room_id uuid, p_host_id uuid, p_player_id uuid, p_delta integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_host boolean;
  v_new_lives integer;
BEGIN
  SELECT host_id = p_host_id INTO v_is_host FROM countries_rooms WHERE id = p_room_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  UPDATE countries_players SET lives = LEAST(3, GREATEST(0, lives + p_delta))
  WHERE id = p_player_id AND room_id = p_room_id
  RETURNING lives INTO v_new_lives;

  IF v_new_lives = 0 THEN
    UPDATE countries_players SET status = 'eliminated' WHERE id = p_player_id AND room_id = p_room_id;
  ELSIF v_new_lives > 0 THEN
    UPDATE countries_players SET status = 'active' WHERE id = p_player_id AND room_id = p_room_id;
  END IF;

  UPDATE countries_rooms SET updated_at = now() WHERE id = p_room_id;
  RETURN true;
END;
$$;
