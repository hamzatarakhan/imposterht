-- Update public_rooms view to include timer fields
DROP VIEW IF EXISTS public_rooms;

CREATE VIEW public_rooms AS
SELECT 
  id,
  code,
  host_id,
  status,
  player_count,
  imposter_count,
  category,
  discussion_time,
  discussion_time_enabled,
  current_player_index,
  winner,
  timer_started_at,
  timer_remaining,
  created_at,
  updated_at
FROM rooms;

-- Grant permissions
GRANT SELECT ON public_rooms TO anon;
GRANT SELECT ON public_rooms TO authenticated;