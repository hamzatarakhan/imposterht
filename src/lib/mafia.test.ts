import { describe, it, expect } from 'vitest';
import { suggestRoles, resolveNight, winner, ROLE_INFO, MafiaPlayer, MafiaRole } from './mafia';

const mafiaCount = (roles: MafiaRole[]) => roles.filter((r) => ROLE_INFO[r].team === 'mafia').length;
const mk = (roles: [MafiaRole, boolean][]): MafiaPlayer[] => roles.map(([role, alive], i) => ({ name: `p${i}`, avatar: '', role, alive }));

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
});
