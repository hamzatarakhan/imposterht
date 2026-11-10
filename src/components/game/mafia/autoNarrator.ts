import { useEffect, useRef, useState } from 'react';
import { MafiaAction, MafiaState, ROLE_INFO, STEP_INFO, nightSteps, voteResult } from '@/lib/mafia';

export interface Lobbyist { id: string; name: string; avatar: string }
export interface Snapshot { lobby: Lobbyist[]; game: MafiaState | null; seen: string[]; votes: Record<string, number>; mafiaPicks: Record<string, number> }

// ---------- speech + beeps ----------
const hasSpeech = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
const arabic = (vs: SpeechSynthesisVoice[]) => vs.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith('ar')) ?? null;
let voice: SpeechSynthesisVoice | null | undefined; // undefined = voices not loaded yet
const pickVoice = () => {
  if (voice !== undefined || !hasSpeech()) return voice ?? null;
  const vs = speechSynthesis.getVoices();
  if (!vs.length) return null; // not loaded yet, try again next time
  voice = arabic(vs);
  return voice;
};

/** Resolves to whether this phone has an Arabic text-to-speech voice (voices load lazily on Chrome). */
export function hasArabicVoice(): Promise<boolean> {
  if (!hasSpeech()) return Promise.resolve(false);
  if (speechSynthesis.getVoices().length) return Promise.resolve(!!pickVoice());
  return new Promise((resolve) => {
    const done = () => resolve(!!pickVoice());
    speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 2000);
  });
}

let audio: AudioContext | null = null;
/** A short tone; works even when the phone has no Arabic voice. */
export function beep(freq = 880, ms = 160) {
  try {
    audio ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.35, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + ms / 1000);
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + ms / 1000);
  } catch { /* no audio */ }
}

let wakeLock: { release: () => Promise<void> } | null = null;
/** Keeps the screen on while the phone narrates (a locked phone stops speaking). */
export async function keepAwake(on: boolean) {
  try {
    if (on && !wakeLock) wakeLock = await (navigator as unknown as { wakeLock: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock.request('screen');
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch { /* unsupported or denied */ }
}

/**
 * Call from a tap. iOS and Chrome only allow sound that starts inside a user gesture, and iOS ignores an
 * empty utterance, so this speaks a real word and resumes the audio context.
 */
export const unlockSpeech = (text = 'يلا') => {
  beep(660, 80);
  void audio?.resume();
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    const v = pickVoice();
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch { /* unsupported */ }
  void keepAwake(true);
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Speaks Arabic text; resolves when done (or after a length-based fallback if speech is missing or stalls). */
export function say(text: string): Promise<void> {
  const fallback = 700 + text.length * 70;
  // voices loaded and none is Arabic: an English voice would read nothing useful, so stay quiet (beeps still play)
  if (!hasSpeech() || (voice === null && speechSynthesis.getVoices().length)) return wait(fallback);
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 0.95;
    const t = setTimeout(resolve, fallback + 2500);
    u.onend = u.onerror = () => { clearTimeout(t); resolve(); };
    speechSynthesis.speak(u);
  });
}

const NUMBERS = ['خمسة', 'أربعة', 'تلاتة', 'اتنين', 'واحد'];

// Mafia are many, the girl is a girl, the rest are one man.
const VERBS = {
  kill: { ready: 'جهّزوا حالكم', open: 'فتّحوا', close: 'غمّضوا' },
  silence: { ready: 'جهّز حالك', open: 'فتّح', close: 'غمّض' },
  check: { ready: 'جهّز حالك', open: 'فتّح', close: 'غمّض' },
  protect: { ready: 'جهّزي حالك', open: 'فتّحي', close: 'غمّضي' },
} as const;

// ---------- the narrator ----------
const PICK_TIMEOUT = 45_000;
const isOn = (cancelled: { v: boolean }) => !cancelled.v;

/**
 * Runs the game by itself on the room creator's phone: speaks each step, counts 5..1 before eyes open/close,
 * waits for players to act on their phones, and advances. Re-runs its script whenever the phase changes.
 */
export function useAutoNarrator(enabled: boolean, snap: Snapshot, apply: (a: MafiaAction) => void, opts: { samePhone?: boolean } = {}) {
  const samePhone = !!opts.samePhone; // one phone in the middle: no per-player "seen" or phone votes
  const [line, setLine] = useState<string>('');
  const [count, setCount] = useState<number | null>(null);
  const snapRef = useRef(snap);
  snapRef.current = snap;
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const prevPhase = useRef<string>('');

  const g = snap.game;
  const phaseKey = g ? `${g.night}|${JSON.stringify(g.phase)}` : 'none';

  // ponytail: the OS drops the wake lock when the tab is hidden; re-request on return if that bites
  useEffect(() => {
    if (!enabled) return;
    void keepAwake(true);
    return () => { void keepAwake(false); };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !g) return;
    const cancelled = { v: false };
    const cameFrom = prevPhase.current;
    prevPhase.current = g.phase.t;

    const speak = async (text: string) => { if (isOn(cancelled)) { setLine(text); await say(text); } };
    const countdown = async (word: string) => {
      for (let i = 0; i < NUMBERS.length && isOn(cancelled); i++) { setCount(5 - i); beep(880, 140); await Promise.all([say(NUMBERS[i]), wait(900)]); }
      setCount(null);
      if (isOn(cancelled)) beep(1320, 450);
      await speak(word);
    };
    const waitFor = async (cond: () => boolean, timeout = Infinity) => {
      const start = Date.now();
      while (isOn(cancelled) && !cond() && Date.now() - start < timeout) await wait(300);
    };
    const act = (a: MafiaAction) => { if (isOn(cancelled)) applyRef.current(a); };
    const cur = () => snapRef.current.game!;

    (async () => {
      const ph = g.phase;
      if (ph.t === 'reveal') {
        if (samePhone) await speak('حطّوا الموبايل بالنص، وعلّوا الصوت');
        else {
          await speak('كل واحد يشوف كرته على موبايله');
          await waitFor(() => cur().players.every((p) => p.id && snapRef.current.seen.includes(p.id)));
        }
        await speak('الكل ينام');
        await countdown('غمّضوا عيونكم');
        act({ type: 'beginNight' });
      } else if (ph.t === 'night') {
        const key = nightSteps(g)[ph.step];
        if (key === 'intro') {
          await speak('المافيا، تعرّفوا على بعض');
          await countdown('فتّحوا');
          await wait(7000);
          await countdown('غمّضوا');
          act({ type: 'nextStep' });
          return;
        }
        if (ph.step === 0 && cameFrom !== 'night') { await speak('الكل ينام'); await countdown('غمّضوا عيونكم'); }
        const info = STEP_INFO[key];
        const v = VERBS[key];
        await speak(`${info.who}، ${v.ready}`);
        await countdown(v.open);
        await speak((info.line.split('…')[1]?.trim() || info.line) + (samePhone ? '، اختار على الموبايل' : ''));
        await waitFor(() => cur().picks[key] !== null, PICK_TIMEOUT);
        await wait(2500);
        await countdown(v.close);
        act({ type: 'nextStep', force: true });
      } else if (ph.t === 'out') {
        const p = g.players[ph.idx];
        if (ph.by === 'night') { await speak('صباح الخير'); await countdown('الكل يفتّح'); }
        await speak(`${p.name} ${ph.by === 'vote' ? 'طلع بالتصويت' : ph.by === 'boy' ? 'أخده الولد معه' : 'انقتل بالليل'}. كان ${ROLE_INFO[p.role].name}`);
        await wait(3000);
        act({ type: 'continue' });
      } else if (ph.t === 'boy') {
        await speak('الولد، اختار مين تاخد معك');
      } else if (ph.t === 'day') {
        if (cameFrom === 'night') { await speak('صباح الخير'); await countdown('الكل يفتّح'); }
        if (g.night === 2) await speak('خلصت ليلة التعارف');
        if (g.saved) await speak('المافيا حاولت تقتل، بس البنت أنقذته');
        if (g.silenced !== null && g.players[g.silenced]?.alive) await speak(`${g.players[g.silenced].name} مسكّت، ممنوع يحكي`);
        await speak('يلا ابدأوا النقاش');
      } else if (ph.t === 'vote' && samePhone) {
        await speak('صوّتوا بإيديكم، وبعدين اختاروا على الموبايل مين طلع');
      } else if (ph.t === 'vote') {
        await speak('صوّتوا هلأ على موبايلاتكم');
        const alive = () => cur().players.filter((p) => p.alive && p.id);
        await waitFor(() => alive().every((p) => snapRef.current.votes[p.id!] !== undefined));
        const out = voteResult(snapRef.current.votes);
        if (out === null) await speak('تعادل، ما حدا طلع');
        act({ type: 'voteOut', idx: out });
      } else if (ph.t === 'end') {
        await speak(ph.win === 'mafia' ? 'المافيا ربحت' : 'المواطنين ربحوا');
      }
    })();

    return () => { cancelled.v = true; setCount(null); try { speechSynthesis.cancel(); } catch { /* unsupported */ } };
  }, [enabled, phaseKey, samePhone]); // eslint-disable-line react-hooks/exhaustive-deps

  return { line, count };
}
