import { supabase } from '@/integrations/supabase/client';
import { MafiaPlayer, Ranking, ROLE_INFO } from '@/lib/mafia';

/** Adds one finished game for a group. Fails quietly (the local ranking still counts it). */
export async function pushResult(group: string, players: MafiaPlayer[], win: 'mafia' | 'town') {
  const rows = players.map((p) => ({ group_name: group, player_name: p.name, won: ROLE_INFO[p.role].team === win }));
  const { error } = await supabase.from('mafia_results').insert(rows);
  return !error;
}

/** The group's ranking, or null if the database can't be reached. */
export async function fetchRanking(group: string): Promise<Ranking | null> {
  const { data, error } = await supabase.from('mafia_results').select('player_name, won').eq('group_name', group).limit(10000);
  if (error || !data) return null;
  const r: Ranking = {};
  for (const row of data) {
    const cur = r[row.player_name] ?? { wins: 0, games: 0 };
    r[row.player_name] = { wins: cur.wins + (row.won ? 1 : 0), games: cur.games + 1 };
  }
  return r;
}
