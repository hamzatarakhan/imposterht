export type MafiaRole = 'godfather' | 'silencer' | 'mafia' | 'sheikh' | 'girl' | 'boy' | 'citizen';

export const ROLE_INFO: Record<MafiaRole, { name: string; icon: string; team: 'mafia' | 'town'; desc: string }> = {
  godfather: { name: 'شيخ المافيا', icon: '🎩', team: 'mafia', desc: 'إذا اختلفت المافيا، إنت اللي بتقرر مين ينقتل' },
  silencer: { name: 'قص المافيا', icon: '✂️', team: 'mafia', desc: 'كل ليلة بتختار حدا يسكت طول النهار' },
  mafia: { name: 'مافيا', icon: '🔪', team: 'mafia', desc: 'كل ليلة بتتفقوا على حدا تقتلوه، وبالنهار مثّل إنك مواطن' },
  sheikh: { name: 'الشيخ', icon: '🕵️', team: 'town', desc: 'كل ليلة بتسأل عن لاعب وبتعرف إذا مافيا أو مواطن' },
  girl: { name: 'البنت', icon: '💉', team: 'town', desc: 'كل ليلة بتحمي لاعب من القتل' },
  boy: { name: 'الولد', icon: '💣', team: 'town', desc: 'لما تطلع من اللعبة بتاخد حدا معك' },
  citizen: { name: 'مواطن صالح', icon: '👤', team: 'town', desc: 'اكشف المافيا بالنقاش والتصويت' },
};

export const MIN_PLAYERS = 5;

/** Suggested role list for n players (any size >= MIN_PLAYERS). */
export function suggestRoles(n: number): MafiaRole[] {
  const mafiaCount = n <= 6 ? 1 : n <= 10 ? 2 : n <= 13 ? 3 : Math.floor(n / 4);
  const mafia: MafiaRole[] = [];
  if (mafiaCount >= 2) mafia.push('godfather');
  if (n >= 9) mafia.push('silencer');
  while (mafia.length < mafiaCount) mafia.push('mafia');
  const town: MafiaRole[] = ['sheikh', 'girl'];
  if (n >= 9) town.push('boy');
  const roles = [...mafia, ...town];
  while (roles.length < n) roles.push('citizen');
  return roles;
}

export function shuffle<T>(arr: T[], rand = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface MafiaPlayer { name: string; avatar: string; role: MafiaRole; alive: boolean }

export const isMafia = (p: MafiaPlayer) => ROLE_INFO[p.role].team === 'mafia';

/** Kill target dies unless the girl protected the same player. Returns index killed or null. */
export function resolveNight(kill: number | null, protect: number | null): number | null {
  return kill !== null && kill !== protect ? kill : null;
}

export function winner(players: MafiaPlayer[]): 'mafia' | 'town' | null {
  const alive = players.filter((p) => p.alive);
  const m = alive.filter(isMafia).length;
  if (m === 0) return 'town';
  if (m >= alive.length - m) return 'mafia';
  return null;
}
