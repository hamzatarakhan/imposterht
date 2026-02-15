
-- Fix views to use SECURITY INVOKER
DROP VIEW IF EXISTS public.public_guessing_rooms;
DROP VIEW IF EXISTS public.public_guessing_players;

CREATE VIEW public.public_guessing_rooms WITH (security_invoker = on) AS
SELECT id, code, host_id, status, categories, total_rounds, current_round,
       round_winner_id, created_at, updated_at
FROM guessing_rooms;

CREATE VIEW public.public_guessing_players WITH (security_invoker = on) AS
SELECT id, room_id, player_id, name, avatar, is_host, wins, joined_at
FROM guessing_players;
