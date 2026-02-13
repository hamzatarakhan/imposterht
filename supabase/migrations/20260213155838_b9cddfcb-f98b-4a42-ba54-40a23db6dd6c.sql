
-- Update the scoring function with the new comprehensive scoring system
CREATE OR REPLACE FUNCTION public.update_player_scores(p_room_id uuid, p_winner text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_winner = 'players' THEN
    -- Regular players win: +1 point for team win
    UPDATE room_players
    SET score = score + 1
    WHERE room_id = p_room_id AND is_imposter = false;
    
    -- Bonus +2 for players who voted correctly (voted for an imposter)
    UPDATE room_players rp
    SET score = score + 2
    WHERE room_id = p_room_id 
      AND is_imposter = false
      AND voted_for IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM room_players target
        WHERE target.room_id = p_room_id
          AND target.player_id = rp.voted_for
          AND target.is_imposter = true
      );
  ELSE
    -- Imposters win: +3 points for surviving
    UPDATE room_players
    SET score = score + 3
    WHERE room_id = p_room_id AND is_imposter = true;
    
    -- Even when imposters win, reward players who voted correctly with +2
    UPDATE room_players rp
    SET score = score + 2
    WHERE room_id = p_room_id 
      AND is_imposter = false
      AND voted_for IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM room_players target
        WHERE target.room_id = p_room_id
          AND target.player_id = rp.voted_for
          AND target.is_imposter = true
      );
  END IF;
  
  RETURN true;
END;
$function$;
