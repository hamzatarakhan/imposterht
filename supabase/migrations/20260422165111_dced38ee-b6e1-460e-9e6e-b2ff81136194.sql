CREATE TABLE IF NOT EXISTS public.app_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_key text NOT NULL,
  user_name text,
  user_avatar text,
  app_version text,
  user_agent text,
  language text,
  is_pwa boolean DEFAULT false,
  referrer text,
  game_played text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_key)
);

CREATE INDEX IF NOT EXISTS idx_app_sessions_user_id ON public.app_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_app_sessions_created_at ON public.app_sessions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_sessions_last_seen_at ON public.app_sessions (last_seen_at DESC);

ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert app sessions"
ON public.app_sessions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update app sessions"
ON public.app_sessions FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.log_app_session(
  p_session_key text,
  p_user_id uuid DEFAULT NULL,
  p_user_name text DEFAULT NULL,
  p_user_avatar text DEFAULT NULL,
  p_app_version text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_language text DEFAULT NULL,
  p_is_pwa boolean DEFAULT false,
  p_referrer text DEFAULT NULL,
  p_game_played text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.app_sessions (
    session_key, user_id, user_name, user_avatar, app_version,
    user_agent, language, is_pwa, referrer, game_played, last_seen_at
  ) VALUES (
    p_session_key, p_user_id, p_user_name, p_user_avatar, p_app_version,
    p_user_agent, p_language, p_is_pwa, p_referrer, p_game_played, now()
  )
  ON CONFLICT (session_key) DO UPDATE SET
    user_name = COALESCE(EXCLUDED.user_name, app_sessions.user_name),
    user_avatar = COALESCE(EXCLUDED.user_avatar, app_sessions.user_avatar),
    game_played = COALESCE(EXCLUDED.game_played, app_sessions.game_played),
    app_version = COALESCE(EXCLUDED.app_version, app_sessions.app_version),
    last_seen_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_read_sessions(p_pin text, p_limit int DEFAULT 500)
RETURNS SETOF public.app_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_pin IS DISTINCT FROM 'fa3aliyat-2026' THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT * FROM public.app_sessions
    ORDER BY last_seen_at DESC
    LIMIT GREATEST(1, LEAST(p_limit, 5000));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_read_feedback(p_pin text, p_limit int DEFAULT 500)
RETURNS SETOF public.app_feedback
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_pin IS DISTINCT FROM 'fa3aliyat-2026' THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT * FROM public.app_feedback
    ORDER BY created_at DESC
    LIMIT GREATEST(1, LEAST(p_limit, 5000));
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_app_session(text, uuid, text, text, text, text, text, boolean, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_read_sessions(text, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_read_feedback(text, int) TO anon, authenticated;