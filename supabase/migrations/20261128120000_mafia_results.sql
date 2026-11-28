-- One row per player per finished Mafia game; the ranking for a group is computed from these rows.
CREATE TABLE IF NOT EXISTS public.mafia_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL CHECK (char_length(group_name) BETWEEN 1 AND 40),
  player_name text NOT NULL CHECK (char_length(player_name) BETWEEN 1 AND 20),
  won boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mafia_results_group_idx ON public.mafia_results (lower(group_name));

ALTER TABLE public.mafia_results ENABLE ROW LEVEL SECURITY;

-- No accounts in the app: anyone with the group name can read and add results (party-game trust level).
CREATE POLICY "Anyone can read mafia results" ON public.mafia_results FOR SELECT USING (true);
CREATE POLICY "Anyone can add mafia results" ON public.mafia_results FOR INSERT WITH CHECK (true);

GRANT SELECT, INSERT ON public.mafia_results TO anon, authenticated;
GRANT ALL ON public.mafia_results TO service_role;
