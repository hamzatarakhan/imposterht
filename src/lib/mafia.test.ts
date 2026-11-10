import { describe, it, expect } from 'vitest';
import {
  suggestRoles, resolveNight, winner, ROLE_INFO, MafiaPlayer, MafiaRole, MafiaState, mafiaReducer, MafiaAction, mafiaDecision,
} from './mafia';

const mafiaCount = (roles: MafiaRole[]) => roles.filter((r) => ROLE_INFO[r].team === 'mafia').length;
const mk = (roles: [MafiaRole, boolean][]): MafiaPlayer[] => roles.map(([role, alive], i) => ({ id: `p${i}`, name: `p${i}`, avatar: '', role, alive }));
const game = (roles: MafiaRole[]): MafiaState => ({
  players: mk(roles.map((r) => [r, true])), phase: { t: 'reveal' }, night: 1,
  picks: { kill: null, silence: null, check: null, protect: null }, silenced: null, lastKilled: null, saved: false, log: [],
});
const run = (s: MafiaState, ...acts: MafiaAction[]) => acts.reduce(mafiaReducer, s);

describe('mafia', () => {
  it('scales roles to any player count', () => {
    for (let n = 5; n <= 20; n++) {
      const r = suggestRoles(n);
      expect(r).toHaveLength(n);
      expect(mafiaCount(r)).toBeLessThan(n / 2);
      expect(r).toContain('sheikh');
    }
    expect(mafiaCount(suggestRoles(12))).toBe(3); // matches the show
    expect(suggestRoles(12)).toEqual(expect.arrayContaining(['godfather', 'silencer', 'boy', 'girl']));
  });

  it('girl protection cancels the kill', () => {
    expect(resolveNight(2, 2)).toBeNull();
    expect(resolveNight(2, 3)).toBe(2);
    expect(resolveNight(null, 1)).toBeNull();
  });

  it('decides the winner', () => {
    expect(winner(mk([['mafia', false], ['citizen', true], ['sheikh', true]]))).toBe('town');
    expect(winner(mk([['mafia', true], ['citizen', true], ['sheikh', false]]))).toBe('mafia');
    expect(winner(mk([['mafia', true], ['citizen', true], ['girl', true]]))).toBeNull();
  });

  it('godfather breaks mafia ties', () => {
    const ps = mk([['godfather', true], ['mafia', true], ['citizen', true], ['citizen', true]]);
    expect(mafiaDecision(ps, { p0: 3, p1: 2 })).toBe(3);
    expect(mafiaDecision(ps, { p1: 2 })).toBe(2);
    expect(mafiaDecision(ps, {})).toBeNull();
  });

  it('plays a round: intro night, kill, boy revenge from a vote, then night', () => {
    // 0 mafia, 1 sheikh, 2 girl, 3 boy, 4 citizen, 5 citizen, 6 citizen
    let s = run(game(['mafia', 'sheikh', 'girl', 'boy', 'citizen', 'citizen', 'citizen']), { type: 'beginNight' }, { type: 'nextStep' });
    expect(s.phase).toEqual({ t: 'day' }); // intro night kills no one
    s = run(s, { type: 'toVote' }, { type: 'voteOut', idx: null });
    expect(s.phase).toEqual({ t: 'night', step: 0 });
    // night 2: kill 4, sheikh checks 0, girl protects 4 -> saved
    s = run(s, { type: 'nextStep' }); // blocked without a pick
    expect(s.phase).toEqual({ t: 'night', step: 0 });
    s = run(s, { type: 'pick', key: 'kill', idx: 4 }, { type: 'nextStep' }, { type: 'pick', key: 'check', idx: 0 }, { type: 'nextStep' }, { type: 'pick', key: 'protect', idx: 4 }, { type: 'nextStep' });
    expect(s.phase).toEqual({ t: 'day' });
    expect(s.saved).toBe(true);
    // town votes out the boy; boy takes the mafia -> town wins
    s = run(s, { type: 'toVote' }, { type: 'voteOut', idx: 3 }, { type: 'continue' });
    expect(s.phase).toEqual({ t: 'boy', then: 'vote' });
    s = run(s, { type: 'boyTake', idx: 0 }, { type: 'continue' });
    expect(s.phase).toEqual({ t: 'end', win: 'town' });
  });

  it('boy taken at night returns to day', () => {
    let s = run(game(['mafia', 'boy', 'citizen', 'citizen', 'citizen', 'citizen']), { type: 'beginNight' }, { type: 'nextStep' }, { type: 'toVote' }, { type: 'voteOut', idx: null });
    s = run(s, { type: 'pick', key: 'kill', idx: 1 }, { type: 'nextStep' });
    expect(s.phase).toMatchObject({ t: 'out', idx: 1, by: 'night' });
    s = run(s, { type: 'continue' }, { type: 'boyTake', idx: 2 }, { type: 'continue' });
    expect(s.phase).toEqual({ t: 'day' });
    expect(s.players.filter((p) => p.alive)).toHaveLength(4);
  });
});
