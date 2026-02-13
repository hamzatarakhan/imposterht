
DROP VIEW IF EXISTS public.public_rooms;
CREATE VIEW public.public_rooms AS
SELECT 
  id, code, host_id, player_count, imposter_count, category, categories,
  discussion_time, discussion_time_enabled, current_player_index,
  timer_started_at, timer_remaining, status, winner,
  word_guess_status, word_guessed, word_guess_options,
  created_at, updated_at
FROM rooms;
