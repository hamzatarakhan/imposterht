
-- 1. Create countries_rooms table
CREATE TABLE public.countries_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar NOT NULL DEFAULT generate_room_code(),
  host_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'playing',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create countries_players table
CREATE TABLE public.countries_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.countries_rooms(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  lives integer NOT NULL DEFAULT 3,
  status text NOT NULL DEFAULT 'active',
  player_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create countries_burned table
CREATE TABLE public.countries_burned (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.countries_rooms(id) ON DELETE CASCADE,
  country_name varchar NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.countries_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries_burned ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for countries_rooms
CREATE POLICY "Allow insert countries_rooms" ON public.countries_rooms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow read countries_rooms" ON public.countries_rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Countries room updates via RPC only" ON public.countries_rooms FOR UPDATE TO public USING (false);
CREATE POLICY "Countries room deletes via RPC only" ON public.countries_rooms FOR DELETE TO public USING (false);

-- 6. RLS policies for countries_players
CREATE POLICY "Allow insert countries_players" ON public.countries_players FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow read countries_players" ON public.countries_players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Countries players updates via RPC only" ON public.countries_players FOR UPDATE TO public USING (false);
CREATE POLICY "Countries players deletes via RPC only" ON public.countries_players FOR DELETE TO public USING (false);

-- 7. RLS policies for countries_burned
CREATE POLICY "Allow insert countries_burned" ON public.countries_burned FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow read countries_burned" ON public.countries_burned FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Countries burned updates via RPC only" ON public.countries_burned FOR UPDATE TO public USING (false);
CREATE POLICY "Countries burned deletes via RPC only" ON public.countries_burned FOR DELETE TO public USING (false);

-- 8. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.countries_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.countries_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.countries_burned;

-- 9. RPC: update_countries_player_lives
CREATE OR REPLACE FUNCTION public.update_countries_player_lives(p_room_id uuid, p_host_id uuid, p_player_id uuid, p_delta integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_host boolean;
  v_new_lives integer;
BEGIN
  SELECT host_id = p_host_id INTO v_is_host FROM countries_rooms WHERE id = p_room_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  UPDATE countries_players SET lives = GREATEST(0, lives + p_delta)
  WHERE id = p_player_id AND room_id = p_room_id
  RETURNING lives INTO v_new_lives;

  IF v_new_lives = 0 THEN
    UPDATE countries_players SET status = 'eliminated' WHERE id = p_player_id AND room_id = p_room_id;
  ELSIF v_new_lives > 0 THEN
    UPDATE countries_players SET status = 'active' WHERE id = p_player_id AND room_id = p_room_id;
  END IF;

  UPDATE countries_rooms SET updated_at = now() WHERE id = p_room_id;
  RETURN true;
END;
$$;

-- 10. RPC: add_countries_burned
CREATE OR REPLACE FUNCTION public.add_countries_burned(p_room_id uuid, p_host_id uuid, p_country_name varchar)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_host boolean;
BEGIN
  SELECT host_id = p_host_id INTO v_is_host FROM countries_rooms WHERE id = p_room_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  INSERT INTO countries_burned (room_id, country_name) VALUES (p_room_id, p_country_name);
  UPDATE countries_rooms SET updated_at = now() WHERE id = p_room_id;
  RETURN true;
END;
$$;

-- 11. RPC: remove_countries_burned
CREATE OR REPLACE FUNCTION public.remove_countries_burned(p_room_id uuid, p_host_id uuid, p_burned_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_host boolean;
BEGIN
  SELECT host_id = p_host_id INTO v_is_host FROM countries_rooms WHERE id = p_room_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  DELETE FROM countries_burned WHERE id = p_burned_id AND room_id = p_room_id;
  UPDATE countries_rooms SET updated_at = now() WHERE id = p_room_id;
  RETURN true;
END;
$$;

-- 12. RPC: swap_countries_players
CREATE OR REPLACE FUNCTION public.swap_countries_players(p_room_id uuid, p_host_id uuid, p_active_player_id uuid, p_eliminated_player_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_host boolean;
  v_active_lives integer;
BEGIN
  SELECT host_id = p_host_id INTO v_is_host FROM countries_rooms WHERE id = p_room_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  SELECT lives INTO v_active_lives FROM countries_players WHERE id = p_active_player_id AND room_id = p_room_id AND status = 'active';
  IF v_active_lives IS NULL THEN RETURN false; END IF;

  -- Eliminate the active player
  UPDATE countries_players SET status = 'eliminated', lives = 0 WHERE id = p_active_player_id AND room_id = p_room_id;
  -- Revive the eliminated player with the active player's lives
  UPDATE countries_players SET status = 'active', lives = v_active_lives WHERE id = p_eliminated_player_id AND room_id = p_room_id;

  UPDATE countries_rooms SET updated_at = now() WHERE id = p_room_id;
  RETURN true;
END;
$$;

-- 13. RPC: add_countries_player
CREATE OR REPLACE FUNCTION public.add_countries_player(p_room_id uuid, p_host_id uuid, p_name varchar)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_host boolean;
  v_player_id uuid;
  v_order integer;
BEGIN
  SELECT host_id = p_host_id INTO v_is_host FROM countries_rooms WHERE id = p_room_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN NULL; END IF;

  SELECT COALESCE(MAX(player_order), 0) + 1 INTO v_order FROM countries_players WHERE room_id = p_room_id;

  INSERT INTO countries_players (room_id, name, player_order)
  VALUES (p_room_id, p_name, v_order)
  RETURNING id INTO v_player_id;

  UPDATE countries_rooms SET updated_at = now() WHERE id = p_room_id;
  RETURN v_player_id;
END;
$$;

-- 14. RPC: remove_countries_player
CREATE OR REPLACE FUNCTION public.remove_countries_player(p_room_id uuid, p_host_id uuid, p_player_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_host boolean;
BEGIN
  SELECT host_id = p_host_id INTO v_is_host FROM countries_rooms WHERE id = p_room_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  DELETE FROM countries_players WHERE id = p_player_id AND room_id = p_room_id;
  UPDATE countries_rooms SET updated_at = now() WHERE id = p_room_id;
  RETURN true;
END;
$$;

-- 15. RPC: delete_countries_room
CREATE OR REPLACE FUNCTION public.delete_countries_room(p_room_id uuid, p_host_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_host boolean;
BEGIN
  SELECT host_id = p_host_id INTO v_is_host FROM countries_rooms WHERE id = p_room_id;
  IF NOT COALESCE(v_is_host, false) THEN RETURN false; END IF;

  DELETE FROM countries_rooms WHERE id = p_room_id;
  RETURN true;
END;
$$;

-- 16. Cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_countries_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM countries_rooms WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;
