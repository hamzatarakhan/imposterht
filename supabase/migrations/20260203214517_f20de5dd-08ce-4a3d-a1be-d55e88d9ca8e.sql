-- Add timer sync fields to rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timer_remaining INTEGER DEFAULT NULL;

-- Create secure RPC to update timer state (host only)
CREATE OR REPLACE FUNCTION public.update_timer_secure(
  p_room_id uuid,
  p_host_player_id uuid,
  p_timer_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_timer_remaining INTEGER DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_host BOOLEAN;
BEGIN
    SELECT host_id = p_host_player_id INTO v_is_host
    FROM rooms
    WHERE id = p_room_id;
    
    IF NOT v_is_host THEN
        RETURN FALSE;
    END IF;
    
    UPDATE rooms
    SET timer_started_at = p_timer_started_at,
        timer_remaining = p_timer_remaining
    WHERE id = p_room_id;
    
    RETURN TRUE;
END;
$$;