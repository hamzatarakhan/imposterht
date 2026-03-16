
-- First drop views that depend on the tables
DROP VIEW IF EXISTS public.public_rooms;
DROP VIEW IF EXISTS public.public_guessing_rooms;

-- Add columns
ALTER TABLE public.rooms 
ADD COLUMN voice_chat_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN presence_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.guessing_rooms 
ADD COLUMN voice_chat_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN presence_enabled boolean NOT NULL DEFAULT false;

-- Recreate views with original column order + new columns
CREATE VIEW public.public_rooms AS
SELECT id, code, host_id, player_count, imposter_count, category, categories,
       discussion_time, discussion_time_enabled, current_player_index,
       timer_started_at, timer_remaining, status, winner,
       word_guess_status, word_guessed, word_guess_options,
       voice_chat_enabled, presence_enabled,
       created_at, updated_at
FROM public.rooms;

CREATE VIEW public.public_guessing_rooms AS
SELECT id, code, host_id, status, categories, total_rounds, current_round,
       round_winner_id, turn_time, voice_chat_enabled, presence_enabled,
       created_at, updated_at
FROM public.guessing_rooms;
