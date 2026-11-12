import { describe, expect, it } from 'vitest';
import { pickArabicVoice } from './speech';

const voice = (lang: string) => ({ lang } as SpeechSynthesisVoice);

describe('Arabic voice selection', () => {
  it('prefers Jordanian over other installed voices regardless of order', () => {
    const jordanian = voice('ar_JO');
    expect(pickArabicVoice([voice('en-US'), voice('ar-SA'), voice('ar-LB'), jordanian])).toBe(jordanian);
  });
  it('prefers a Levantine fallback and never selects an English voice', () => {
    const levantine = voice('ar-PS');
    expect(pickArabicVoice([voice('ar-SA'), levantine])).toBe(levantine);
    expect(pickArabicVoice([voice('en-US')])).toBeNull();
    expect(pickArabicVoice([])).toBeNull();
  });
  it('rechecks newly available voices rather than caching an unavailable voice', () => {
    expect(pickArabicVoice([])).toBeNull();
    const jordanian = voice('ar-JO');
    expect(pickArabicVoice([jordanian])).toBe(jordanian);
  });
});
