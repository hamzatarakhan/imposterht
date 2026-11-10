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
export const MAFIA_SPECIALS: MafiaRole[] = ['godfather', 'silencer'];
export const TOWN_SPECIALS: MafiaRole[] = ['sheikh', 'girl', 'boy'];

export function suggestRoles(n: number): MafiaRole[] {
  const mafiaCount = n <= 6 ? 1 : n <= 10 ? 2 : n <= 13 ? 3 : Math.floor(n / 4);
  const specials: MafiaRole[] = ['sheikh', 'girl'];
  if (mafiaCount >= 2) specials.push('godfather');
  if (mafiaCount >= 2 && n >= 9) specials.push('silencer');
  if (n >= 9) specials.push('boy');
  return buildRoles(n, mafiaCount, specials);
}

/** Every special role is optional. Mafia specials take mafia seats (as many as fit); the rest are plain mafia / citizens. */
export function buildRoles(n: number, mafiaCount: number, specials: MafiaRole[]): MafiaRole[] {
  const mafia = MAFIA_SPECIALS.filter((r) => specials.includes(r)).slice(0, mafiaCount);
  while (mafia.length < mafiaCount) mafia.push('mafia');
  const roles = [...mafia, ...TOWN_SPECIALS.filter((r) => specials.includes(r))];
  while (roles.length < n) roles.push('citizen');
  return roles.slice(0, n);
}

export const maxMafia = (n: number) => Math.max(1, Math.floor((n - 1) / 2));

export function shuffle<T>(arr: T[], rand = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface MafiaPlayer { id?: string; name: string; avatar: string; role: MafiaRole; alive: boolean }

export const isMafia = (p: MafiaPlayer) => ROLE_INFO[p.role].team === 'mafia';

/** Kill target dies unless the girl protected the same player. Returns index killed or null. */
export function resolveNight(kill: number | null, protect: number | null): number | null {
  return kill !== null && kill !== protect ? kill : null;
}

/** Vote result: the single most-voted player, or null on a tie / no votes. */
export function voteResult(votes: Record<string, number>): number | null {
  const counts: Record<number, number> = {};
  for (const t of Object.values(votes)) counts[t] = (counts[t] ?? 0) + 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!sorted.length || (sorted[1] && sorted[1][1] === sorted[0][1])) return null;
  return Number(sorted[0][0]);
}

export function winner(players: MafiaPlayer[]): 'mafia' | 'town' | null {
  const alive = players.filter((p) => p.alive);
  const m = alive.filter(isMafia).length;
  if (m === 0) return 'town';
  if (m >= alive.length - m) return 'mafia';
  return null;
}

/** Mafia kill choice: the godfather's pick wins; otherwise the most-picked target. */
export function mafiaDecision(players: MafiaPlayer[], picks: Record<string, number>): number | null {
  const gf = players.find((p) => p.alive && p.role === 'godfather' && p.id && picks[p.id] !== undefined);
  if (gf?.id) return picks[gf.id];
  const counts: Record<number, number> = {};
  let best: number | null = null;
  for (const t of Object.values(picks)) {
    counts[t] = (counts[t] ?? 0) + 1;
    if (best === null || counts[t] > counts[best]) best = t;
  }
  return best;
}

// ---------- game state machine (shared by local and online) ----------

export type StepKey = 'intro' | 'kill' | 'silence' | 'check' | 'protect';
export type OutBy = 'night' | 'vote' | 'boy';
export type Phase =
  | { t: 'reveal' }
  | { t: 'night'; step: number }
  | { t: 'day' }
  | { t: 'vote' }
  | { t: 'out'; idx: number; by: OutBy; then?: 'day' | 'vote' }
  | { t: 'boy'; then: 'day' | 'vote' }
  | { t: 'end'; win: 'mafia' | 'town' };

export interface Picks { kill: number | null; silence: number | null; check: number | null; protect: number | null }
export interface MafiaState {
  players: MafiaPlayer[];
  phase: Phase;
  night: number; // 1 = intro night
  picks: Picks;
  silenced: number | null;
  lastKilled: number | null;
  saved: boolean;
  log: string[];
}

export type MafiaAction =
  | { type: 'beginNight' }
  | { type: 'pick'; key: Exclude<StepKey, 'intro'>; idx: number }
  | { type: 'nextStep'; force?: boolean } // force: move on even if nobody picked (auto narrator timeout)
  | { type: 'continue' }
  | { type: 'toVote' }
  | { type: 'voteOut'; idx: number | null }
  | { type: 'boyTake'; idx: number };

export const STEP_INFO: Record<StepKey, { icon: string; who: string; line: string; role?: MafiaRole | 'anyMafia' }> = {
  intro: { icon: '🌙', who: 'الكل', line: 'الكل ينام… المافيا تفتح وتتعرّف على بعض. الشيخ يفتح، البنت تفتح، الولد يفتح… الكل يسكّر.' },
  kill: { icon: '🔪', who: 'المافيا', line: 'المافيا تفتح… مين بدكم تقتلوا؟', role: 'anyMafia' },
  silence: { icon: '✂️', who: 'قص المافيا', line: 'قص المافيا يفتح… مين بدك تسكّت بكرا؟', role: 'silencer' },
  check: { icon: '🕵️', who: 'الشيخ', line: 'الشيخ يفتح… عن مين بدك تسأل؟', role: 'sheikh' },
  protect: { icon: '💉', who: 'البنت', line: 'البنت تفتح… مين بدّك تحمي؟', role: 'girl' },
};

export function nightSteps(s: Pick<MafiaState, 'players' | 'night'>): StepKey[] {
  if (s.night === 1) return ['intro'];
  const alive = (r: MafiaRole) => s.players.some((p) => p.alive && p.role === r);
  return ['kill', ...(alive('silencer') ? ['silence' as const] : []), ...(alive('sheikh') ? ['check' as const] : []), ...(alive('girl') ? ['protect' as const] : [])];
}

const emptyPicks: Picks = { kill: null, silence: null, check: null, protect: null };

export function newGame(people: { id?: string; name: string; avatar: string }[], roles: MafiaRole[], rand = Math.random): MafiaState {
  const dealt = shuffle(roles, rand);
  return {
    players: people.map((p, i) => ({ ...p, role: dealt[i], alive: true })),
    phase: { t: 'reveal' }, night: 1, picks: emptyPicks, silenced: null, lastKilled: null, saved: false, log: [],
  };
}

const outLine = (p: MafiaPlayer, by: OutBy) =>
  `${by === 'vote' ? '🗳️ انطرد' : by === 'boy' ? '💣 أخذه الولد' : '💀 انقتل'}: ${p.name} (${ROLE_INFO[p.role].name})`;

function eliminate(s: MafiaState, idx: number, by: OutBy, then?: 'day' | 'vote'): MafiaState {
  const players = s.players.map((p, i) => (i === idx ? { ...p, alive: false } : p));
  return { ...s, players, log: [...s.log, outLine(s.players[idx], by)], phase: { t: 'out', idx, by, then } };
}

const startNight = (s: MafiaState): MafiaState => ({ ...s, picks: emptyPicks, phase: { t: 'night', step: 0 } });

export function mafiaReducer(s: MafiaState, a: MafiaAction): MafiaState {
  const ph = s.phase;
  switch (a.type) {
    case 'beginNight':
      return ph.t === 'reveal' ? startNight(s) : s;
    case 'pick':
      return ph.t === 'night' ? { ...s, picks: { ...s.picks, [a.key]: a.idx } } : s;
    case 'nextStep': {
      if (ph.t !== 'night') return s;
      const steps = nightSteps(s);
      const key = steps[ph.step];
      if (key !== 'intro' && s.picks[key] === null && !a.force) return s;
      if (ph.step < steps.length - 1) return { ...s, phase: { t: 'night', step: ph.step + 1 } };
      if (s.night === 1) return { ...s, night: 2, silenced: null, lastKilled: null, saved: false, phase: { t: 'day' } };
      const dead = resolveNight(s.picks.kill, s.picks.protect);
      const next = { ...s, night: s.night + 1, silenced: s.picks.silence, lastKilled: dead, saved: dead === null && s.picks.kill !== null };
      return dead === null ? { ...next, phase: { t: 'day' } } : eliminate(next, dead, 'night');
    }
    case 'continue': {
      if (ph.t !== 'out') return s;
      if (s.players[ph.idx].role === 'boy' && ph.by !== 'boy') return { ...s, phase: { t: 'boy', then: ph.by === 'night' ? 'day' : 'vote' } };
      const w = winner(s.players);
      if (w) return { ...s, phase: { t: 'end', win: w } };
      const origin = ph.by === 'boy' ? ph.then : ph.by === 'night' ? 'day' : 'vote';
      return origin === 'vote' ? startNight(s) : { ...s, phase: { t: 'day' } };
    }
    case 'toVote':
      return ph.t === 'day' ? { ...s, phase: { t: 'vote' } } : s;
    case 'voteOut':
      if (ph.t !== 'vote') return s;
      return a.idx === null ? startNight({ ...s, log: [...s.log, '🗳️ ما حدا طلع'] }) : eliminate(s, a.idx, 'vote');
    case 'boyTake':
      return ph.t === 'boy' && s.players[a.idx]?.alive ? eliminate(s, a.idx, 'boy', ph.then) : s;
  }
}
