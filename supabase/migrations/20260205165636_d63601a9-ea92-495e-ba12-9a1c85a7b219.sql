-- Fix public_room_players view to hide is_imposter until game is finished
DROP VIEW IF EXISTS public.public_room_players;

CREATE VIEW public.public_room_players
WITH (security_invoker=on) AS
SELECT 
    rp.id,
    rp.room_id,
    rp.player_id,
    rp.name,
    rp.avatar,
    rp.is_host,
    -- Only show is_imposter when game is finished
    CASE 
        WHEN r.status = 'finished' THEN rp.is_imposter
        ELSE NULL
    END AS is_imposter,
    rp.has_seen_role,
    rp.votes,
    rp.voted_for,
    rp.player_order,
    rp.joined_at
FROM public.room_players rp
JOIN public.rooms r ON r.id = rp.room_id;

-- Fix public_rooms view to ensure secret_word is never exposed
DROP VIEW IF EXISTS public.public_rooms;

CREATE VIEW public.public_rooms
WITH (security_invoker=on) AS
SELECT 
    id,
    code,
    host_id,
    status,
    player_count,
    imposter_count,
    category,
    categories,
    discussion_time,
    discussion_time_enabled,
    current_player_index,
    winner,
    timer_started_at,
    timer_remaining,
    created_at,
    updated_at
    -- secret_word is intentionally excluded
FROM public.rooms;

-- Grant SELECT on views to anon and authenticated roles
GRANT SELECT ON public.public_rooms TO anon, authenticated;
GRANT SELECT ON public.public_room_players TO anon, authenticated;