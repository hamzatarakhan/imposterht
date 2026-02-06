-- Add cumulative score column to room_players
ALTER TABLE public.room_players ADD COLUMN IF NOT EXISTS score integer NOT NULL DEFAULT 0;

-- Add word_guess_status to track imposter word guessing phase
-- 'none' = no guessing phase, 'pending' = waiting for imposter guess, 'completed' = guess submitted
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS word_guess_status text DEFAULT 'none';

-- Add word_guessed to track if imposter guessed correctly
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS word_guessed boolean DEFAULT NULL;

-- Create function to update player scores (called after game ends)
CREATE OR REPLACE FUNCTION public.update_player_scores(
  p_room_id uuid,
  p_winner text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update scores based on winner
  IF p_winner = 'players' THEN
    -- Regular players win - they get 1 point each
    UPDATE room_players
    SET score = score + 1
    WHERE room_id = p_room_id AND is_imposter = false;
  ELSE
    -- Imposters win - they get 3 points each
    UPDATE room_players
    SET score = score + 3
    WHERE room_id = p_room_id AND is_imposter = true;
  END IF;
  
  RETURN true;
END;
$$;

-- Create function for imposter to submit word guess
CREATE OR REPLACE FUNCTION public.submit_word_guess(
  p_room_id uuid,
  p_player_id uuid,
  p_guessed_word text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_imposter boolean;
  v_secret_word text;
  v_is_correct boolean;
BEGIN
  -- Verify player is an imposter in this room
  SELECT is_imposter INTO v_is_imposter
  FROM room_players
  WHERE room_id = p_room_id AND player_id = p_player_id;
  
  IF NOT v_is_imposter THEN
    RETURN false;
  END IF;
  
  -- Get the secret word
  SELECT secret_word INTO v_secret_word
  FROM rooms
  WHERE id = p_room_id;
  
  -- Check if guess is correct
  v_is_correct := (p_guessed_word = v_secret_word);
  
  -- Update room with guess result
  UPDATE rooms
  SET word_guess_status = 'completed',
      word_guessed = v_is_correct
  WHERE id = p_room_id;
  
  -- If correct, give imposter 2 bonus points
  IF v_is_correct THEN
    UPDATE room_players
    SET score = score + 2
    WHERE room_id = p_room_id AND player_id = p_player_id;
  END IF;
  
  RETURN v_is_correct;
END;
$$;

-- Update restart_game_secure to reset word guess status and keep scores
CREATE OR REPLACE FUNCTION public.restart_game_secure(
  p_room_id uuid,
  p_host_player_id uuid,
  p_secret_word text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_host boolean;
  v_player_count integer;
  v_imposter_count integer;
  v_random_indices integer[];
  v_i integer;
  v_rand_idx integer;
BEGIN
  -- Verify host
  SELECT is_host INTO v_is_host
  FROM room_players
  WHERE room_id = p_room_id AND player_id = p_host_player_id;
  
  IF NOT v_is_host THEN
    RETURN false;
  END IF;
  
  -- Get room settings
  SELECT player_count, imposter_count INTO v_player_count, v_imposter_count
  FROM rooms
  WHERE id = p_room_id;
  
  -- Reset room (keep scores by NOT resetting them)
  UPDATE rooms
  SET status = 'playing',
      secret_word = p_secret_word,
      current_player_index = 0,
      winner = NULL,
      word_guess_status = 'none',
      word_guessed = NULL,
      timer_started_at = NULL,
      timer_remaining = NULL,
      updated_at = now()
  WHERE id = p_room_id;
  
  -- Reset player game state but keep scores
  UPDATE room_players
  SET is_imposter = false,
      has_seen_role = false,
      votes = 0,
      voted_for = NULL
  WHERE room_id = p_room_id;
  
  -- Select random imposters
  v_random_indices := ARRAY[]::integer[];
  WHILE array_length(v_random_indices, 1) IS NULL OR array_length(v_random_indices, 1) < v_imposter_count LOOP
    v_rand_idx := floor(random() * v_player_count)::integer;
    IF NOT v_rand_idx = ANY(v_random_indices) THEN
      v_random_indices := array_append(v_random_indices, v_rand_idx);
    END IF;
  END LOOP;
  
  -- Mark imposters
  FOR v_i IN 0..v_player_count-1 LOOP
    IF v_i = ANY(v_random_indices) THEN
      UPDATE room_players
      SET is_imposter = true
      WHERE room_id = p_room_id AND player_order = v_i;
    END IF;
  END LOOP;
  
  RETURN true;
END;
$$;

-- Update calculate_winner_secure to also update scores and set word guess status
CREATE OR REPLACE FUNCTION public.calculate_winner_secure(
  p_room_id uuid,
  p_host_player_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_host boolean;
  v_most_voted_id uuid;
  v_is_imposter boolean;
  v_winner text;
  v_imposter_count integer;
BEGIN
  -- Verify host
  SELECT is_host INTO v_is_host
  FROM room_players
  WHERE room_id = p_room_id AND player_id = p_host_player_id;
  
  IF NOT v_is_host THEN
    RETURN 'imposters';
  END IF;
  
  -- Get the most voted player
  SELECT id, is_imposter INTO v_most_voted_id, v_is_imposter
  FROM room_players
  WHERE room_id = p_room_id
  ORDER BY votes DESC
  LIMIT 1;
  
  -- Determine winner
  IF v_is_imposter THEN
    v_winner := 'players';
  ELSE
    v_winner := 'imposters';
  END IF;
  
  -- Update scores
  PERFORM update_player_scores(p_room_id, v_winner);
  
  -- Get imposter count for word guess phase
  SELECT imposter_count INTO v_imposter_count
  FROM rooms
  WHERE id = p_room_id;
  
  -- Update room status
  -- If players won (imposter caught), enable word guess phase for imposter
  UPDATE rooms
  SET status = 'finished',
      winner = v_winner,
      word_guess_status = CASE WHEN v_winner = 'players' THEN 'pending' ELSE 'none' END,
      updated_at = now()
  WHERE id = p_room_id;
  
  RETURN v_winner;
END;
$$;

-- Update public_rooms view to include new columns
DROP VIEW IF EXISTS public.public_rooms;
CREATE VIEW public.public_rooms
WITH (security_invoker=on) AS
  SELECT 
    id,
    code,
    host_id,
    player_count,
    imposter_count,
    category,
    categories,
    discussion_time,
    discussion_time_enabled,
    current_player_index,
    timer_started_at,
    timer_remaining,
    status,
    winner,
    word_guess_status,
    word_guessed,
    created_at,
    updated_at
  FROM public.rooms;

-- Update public_room_players view to include score
DROP VIEW IF EXISTS public.public_room_players;
CREATE VIEW public.public_room_players
WITH (security_invoker=on) AS
  SELECT 
    id,
    room_id,
    player_id,
    name,
    avatar,
    is_host,
    -- Only show is_imposter after game is finished
    CASE 
      WHEN (SELECT status FROM rooms WHERE id = room_id) = 'finished' THEN is_imposter
      ELSE NULL
    END as is_imposter,
    has_seen_role,
    votes,
    voted_for,
    player_order,
    score,
    joined_at
  FROM public.room_players;