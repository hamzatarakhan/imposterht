-- Function to get the secret word after game is finished
CREATE OR REPLACE FUNCTION public.get_finished_game_word(p_room_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_status TEXT;
    v_secret_word TEXT;
BEGIN
    -- Only return secret word if game is finished
    SELECT status, secret_word INTO v_status, v_secret_word
    FROM rooms
    WHERE id = p_room_id;
    
    IF v_status = 'finished' THEN
        RETURN v_secret_word;
    END IF;
    
    RETURN NULL;
END;
$$;