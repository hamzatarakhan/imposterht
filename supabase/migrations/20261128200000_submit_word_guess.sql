-- Imposter's last-chance word guess (was created outside migrations on the old backend).
-- Only an imposter in a finished room with a pending guess may answer; a right guess gives +2.
CREATE OR REPLACE FUNCTION public.submit_word_guess(p_room_id uuid, p_player_id uuid, p_guessed_word text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_secret text;
  v_correct boolean;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM room_players WHERE room_id = p_room_id AND player_id = p_player_id AND is_imposter) THEN
    RETURN false;
  END IF;

  SELECT secret_word INTO v_secret FROM rooms
  WHERE id = p_room_id AND word_guess_status = 'pending'
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_correct := lower(trim(coalesce(p_guessed_word, ''))) = lower(trim(coalesce(v_secret, '')));

  IF v_correct THEN
    UPDATE room_players SET score = score + 2 WHERE room_id = p_room_id AND player_id = p_player_id;
  END IF;

  UPDATE rooms SET word_guessed = v_correct, word_guess_status = 'completed', updated_at = now()
  WHERE id = p_room_id;

  RETURN v_correct;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.submit_word_guess(uuid, uuid, text) TO anon, authenticated;
