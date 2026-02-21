
-- Add turn_time column to guessing_rooms (seconds per turn, default 30)
ALTER TABLE public.guessing_rooms ADD COLUMN turn_time integer NOT NULL DEFAULT 30;

-- Also need to expose it in the public view
DROP VIEW IF EXISTS public.public_guessing_rooms;
CREATE VIEW public.public_guessing_rooms AS
SELECT id, code, host_id, status, categories, total_rounds, current_round,
       round_winner_id, turn_time, created_at, updated_at
FROM public.guessing_rooms;
