
-- RPC for host to set word guess options
CREATE OR REPLACE FUNCTION public.set_word_guess_options_secure(
  p_room_id uuid,
  p_host_player_id uuid,
  p_options text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_is_host boolean;
BEGIN
  SELECT is_host INTO v_is_host
  FROM room_players
  WHERE room_id = p_room_id AND player_id = p_host_player_id;
  
  IF NOT COALESCE(v_is_host, false) THEN
    RETURN false;
  END IF;
  
  UPDATE rooms
  SET word_guess_options = p_options
  WHERE id = p_room_id;
  
  RETURN true;
END;
$function$;
