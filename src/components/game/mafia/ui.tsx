import React, { useEffect, useState } from 'react';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import {
  MafiaPlayer, MafiaRole, MafiaState, MafiaAction, Ranking, ROLE_INFO, STEP_INFO, isMafia, nightSteps, addResult, rankOrder, buildRoles, maxMafia, MAFIA_SPECIALS, TOWN_SPECIALS, NO_SHOT,
} from '@/lib/mafia';
import { fetchRanking, pushResult } from '@/services/mafiaRankingService';
import { hasArabicVoice, unlockSpeech } from './autoNarrator';

export const useTap = () => {
  const { playSound, vibrate } = useSettings();
  return (ms = 30) => { playSound('click'); vibrate(ms); };
};

export const Shell: React.FC<{ title?: string; onBack?: () => void; children: React.ReactNode; footer?: React.ReactNode; banner?: React.ReactNode }> = ({ title, onBack, children, footer, banner }) => (
  <div className="min-h-screen flex flex-col relative">
    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors" aria-label="رجوع">
          <ArrowRight size={20} />
        </button>
      )}
      <h1 className="text-xl font-black">🔪 {title ?? 'المافيا'}</h1>
    </div>
    <div className="flex-1 p-4 pb-32 space-y-4">{banner}{children}</div>
    {footer && <div className="sticky bottom-0 p-4 bg-gradient-to-t from-background via-background to-transparent space-y-2">{footer}</div>}
  </div>
);

/** The sniper may keep the bullet for another night. */
export const NoShotButton: React.FC<{ picked: number | null; onPick: () => void }> = ({ picked, onPick }) => (
  <button onClick={onPick} className={`w-full p-3 rounded-2xl font-bold border-2 ${picked === NO_SHOT ? 'border-primary bg-primary/15' : 'border-transparent bg-secondary/60'}`}>
    🤚 ما بدي أقنص الليلة، بخلّي الرصاصة
  </button>
);

export const PlayerGrid: React.FC<{
  players: MafiaPlayer[]; onPick?: (i: number) => void; selected?: number | null;
  filter?: (p: MafiaPlayer, i: number) => boolean; badge?: (i: number) => React.ReactNode;
}> = ({ players, onPick, selected, filter = (p) => p.alive, badge }) => {
  const tap = useTap();
  return (
    <div className="grid grid-cols-3 gap-2">
      {players.map((p, i) => filter(p, i) && (
        <button key={i} disabled={!onPick} onClick={() => { tap(); onPick?.(i); }}
          className={`relative p-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${selected === i ? 'border-primary bg-primary/15' : 'border-transparent bg-secondary/60'} ${p.alive ? '' : 'opacity-40'}`}>
          <span className="text-2xl">{p.alive ? p.avatar : '💀'}</span>
          <span className="text-xs font-bold truncate max-w-full">{p.name}</span>
          {badge?.(i)}
        </button>
      ))}
    </div>
  );
};

/** How private role cards look: colours and emoji can both be hidden so a neighbour can't read a role at a glance. */
export interface CardLook { plain: boolean; noIcons: boolean }
export const DEFAULT_LOOK: CardLook = { plain: false, noIcons: false };

const Switch: React.FC<{ on: boolean; onToggle: () => void; title: string; onText: string; offText: string }> = ({ on, onToggle, title, onText, offText }) => (
  <button onClick={onToggle} className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl bg-secondary/60 text-start">
    <span>
      <span className="block text-sm font-bold">{title}</span>
      <span className="block text-xs text-muted-foreground">{on ? onText : offText}</span>
    </span>
    <span className={`shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors ${on ? 'bg-primary' : 'bg-secondary'}`}><span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? '-translate-x-5' : ''}`} /></span>
  </button>
);

export const RoleEditor: React.FC<{ n: number; roles: MafiaRole[]; setRoles: (r: MafiaRole[]) => void; look: CardLook; setLook: (l: CardLook) => void }> = ({ n, roles, setRoles, look, setLook }) => {
  const tap = useTap();
  const mafiaN = roles.filter((r) => ROLE_INFO[r].team === 'mafia').length;
  const specials = roles.filter((r) => MAFIA_SPECIALS.includes(r) || TOWN_SPECIALS.includes(r));
  const counts = roles.reduce<Record<string, number>>((a, r) => ({ ...a, [r]: (a[r] ?? 0) + 1 }), {});
  const toggle = (r: MafiaRole) => {
    tap();
    // turning on a mafia special when every mafia seat is taken adds a seat if the game allows it
    const on = !specials.includes(r);
    const seatsNeeded = MAFIA_SPECIALS.filter((x) => x === r ? on : specials.includes(x)).length;
    const m = on && MAFIA_SPECIALS.includes(r) ? Math.min(maxMafia(n), Math.max(mafiaN, seatsNeeded)) : mafiaN;
    setRoles(buildRoles(n, m, on ? [...specials, r] : specials.filter((x) => x !== r)));
  };
  const Chip: React.FC<{ r: MafiaRole }> = ({ r }) => (
    <button onClick={() => toggle(r)}
      className={`px-3 py-2 rounded-xl text-sm font-bold ${specials.includes(r) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground line-through'}`}>
      {ROLE_INFO[r].icon} {ROLE_INFO[r].name}
    </button>
  );
  return (
    <div className="card-game space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">🔪 عدد المافيا</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => { tap(); setRoles(buildRoles(n, Math.max(1, mafiaN - 1), specials)); }} className="p-2 rounded-xl bg-secondary" aria-label="أقل"><Minus size={16} /></button>
          <span className="text-2xl font-black text-primary w-6 text-center">{mafiaN}</span>
          <button onClick={() => { tap(); setRoles(buildRoles(n, Math.min(maxMafia(n), mafiaN + 1), specials)); }} className="p-2 rounded-xl bg-secondary" aria-label="أكثر"><Plus size={16} /></button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">كل الأدوار اختيارية، اضغط لتشغيل أو إطفاء</p>
      <div>
        <p className="text-xs font-bold text-red-500 mb-2">أدوار المافيا</p>
        <div className="flex flex-wrap gap-2">{MAFIA_SPECIALS.map((r) => <Chip key={r} r={r} />)}</div>
      </div>
      <div>
        <p className="text-xs font-bold text-emerald-500 mb-2">أدوار المواطنين</p>
        <div className="flex flex-wrap gap-2">{TOWN_SPECIALS.map((r) => <Chip key={r} r={r} />)}</div>
      </div>
      <Switch on={!look.plain} onToggle={() => { tap(); setLook({ ...look, plain: !look.plain }); }} title="🎨 لون أحمر لكروت المافيا"
        onText="شغّال: كرت المافيا أحمر وكرت المواطن أخضر" offText="مطفي: كل الكروت بنفس اللون، الدور بينعرف من الكتابة بس" />
      <Switch on={!look.noIcons} onToggle={() => { tap(); setLook({ ...look, noIcons: !look.noIcons }); }} title="🔪 أشكال الأدوار على الكرت"
        onText="شغّال: كل كرت عليه شكل دوره (🔪 🕵️ 👤…)" offText="مطفي: الكرت بدون شكل، بس اسم الدور" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        الكروت: {Object.entries(counts).map(([r, c]) => `${ROLE_INFO[r as MafiaRole].icon} ${ROLE_INFO[r as MafiaRole].name}${c > 1 ? ` ×${c}` : ''}`).join(' · ')}
      </p>
    </div>
  );
};

export const RoleCard: React.FC<{ me: MafiaPlayer; players: MafiaPlayer[]; plain?: boolean; noIcons?: boolean }> = ({ me, players, plain, noIcons }) => {
  const info = ROLE_INFO[me.role];
  const tint = (red: string, green: string, neutral: string) => (plain ? neutral : info.team === 'mafia' ? red : green);
  const mates = isMafia(me) ? players.filter((q) => q !== me && isMafia(q)) : [];
  return (
    <div className={`card-game text-center border-2 ${tint('border-red-500/50', 'border-emerald-500/40', 'border-border')}`}>
      {!noIcons && <div className="text-7xl mb-3">{info.icon}</div>}
      <h2 className={`text-3xl font-black mb-2 ${tint('text-red-500', 'text-emerald-500', 'text-foreground')}`}>{info.name}</h2>
      <p className="text-sm text-muted-foreground mb-2">{info.desc}</p>
      {mates.length > 0 && (
        <div className={`rounded-2xl p-3 mt-3 text-sm ${plain ? 'bg-secondary/60' : 'bg-red-500/10'}`}>
          <p className="font-bold mb-1">جماعتك:</p>
          {mates.map((m) => <p key={m.name}>{m.avatar} {m.name} — {ROLE_INFO[m.role].name}</p>)}
        </div>
      )}
    </div>
  );
};

export const OutCard: React.FC<{ s: MafiaState }> = ({ s }) => {
  if (s.phase.t !== 'out') return null;
  const p = s.players[s.phase.idx];
  const info = ROLE_INFO[p.role];
  const by = s.phase.by;
  return (
    <div className="card-game text-center">
      <div className="text-6xl mb-2">{p.avatar}</div>
      <p className="text-2xl font-black mb-1">{p.name}</p>
      <p className="text-muted-foreground mb-4">{by === 'vote' ? 'طلع من اللعبة بالتصويت 🗳️' : by === 'boy' ? 'أخذه الولد معه 💣' : 'انقتل بالليل 💀'}</p>
      <div className={`inline-block px-4 py-2 rounded-2xl font-black ${info.team === 'mafia' ? 'bg-red-500/15 text-red-500' : 'bg-emerald-500/15 text-emerald-500'}`}>
        كان {info.icon} {info.name}
      </div>
    </div>
  );
};

export const DayInfo: React.FC<{ s: MafiaState }> = ({ s }) => (
  <>
    <div className="card-game text-center space-y-2">
      {s.night === 2 && <p className="font-bold">ليلة التعارف خلصت، ما حدا انقتل 🌅</p>}
      {s.saved && <p className="font-bold text-emerald-500">🛡️ المافيا حاولت تقتل، بس البنت أنقذته!</p>}
      {s.silenced !== null && s.players[s.silenced]?.alive && (
        <p className="font-bold text-amber-500">🤐 {s.players[s.silenced].name} مسكّت، ممنوع يحكي هالنهار</p>
      )}
      <p className="text-sm text-muted-foreground">كل واحد بدوره يحكي ويتّهم أو يحكي "سكيب"</p>
    </div>
    <PlayerGrid players={s.players} filter={() => true}
      badge={(i) => i === s.silenced && s.players[i].alive ? <span className="text-[10px]">🤐 مسكّت</span> : null} />
  </>
);

export const EndView: React.FC<{ s: MafiaState; ranking?: Ranking }> = ({ s, ranking }) => {
  if (s.phase.t !== 'end') return null;
  const win = s.phase.win;
  return (
    <>
      <div className={`card-game text-center ${win === 'mafia' ? 'text-red-500' : 'text-emerald-500'}`}>
        <div className="text-6xl mb-2">{win === 'mafia' ? '🔪' : '🏆'}</div>
        <p className="text-3xl font-black">{win === 'mafia' ? 'المافيا ربحت!' : 'المواطنين ربحوا!'}</p>
      </div>
      <div className="card-game space-y-2">
        {s.players.map((p) => (
          <div key={p.name} className={`flex items-center gap-2 text-sm ${p.alive ? '' : 'opacity-60'}`}>
            <span>{p.avatar}</span><span className="font-bold flex-1">{p.name}</span>
            <span className={isMafia(p) ? 'text-red-500' : 'text-emerald-500'}>{ROLE_INFO[p.role].icon} {ROLE_INFO[p.role].name}</span>
            {!p.alive && <span>💀</span>}
          </div>
        ))}
      </div>
      <RankingView ranking={ranking} />
      {s.log.length > 0 && <div className="card-game text-xs text-muted-foreground space-y-1">{s.log.map((l, i) => <p key={i}>{l}</p>)}</div>}
    </>
  );
};

/** "Test the voice" button: plays a beep + an Arabic sentence and says how to fix it if the phone has no Arabic voice. */
export const VoiceCheck: React.FC = () => {
  const [status, setStatus] = React.useState<'idle' | 'ok' | 'noArabic' | 'noSpeech'>('idle');
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const steps = isIOS
    ? 'الإعدادات ← تسهيلات الاستخدام ← المحتوى المنطوق ← الأصوات ← العربية ← نزّل صوت'
    : /android/i.test(ua)
      ? 'الإعدادات ← إدارة عامة / النظام ← تحويل النص إلى كلام ← المحرّك المفضّل: Google ← اللغة: العربية (ونزّل البيانات)'
      : /mac/i.test(ua)
        ? 'إعدادات النظام ← تسهيلات الاستخدام ← المحتوى المنطوق ← صوت النظام ← إدارة الأصوات ← العربية'
        : 'إعدادات ويندوز ← الوقت واللغة ← الكلام ← إضافة أصوات ← العربية';
  const test = async () => {
    unlockSpeech('أهلين يا جماعة، أنا الراوي معكم. يلا نلعب مافيا! خمسة، أربعة، ثلاثة، اثنين، واحد');
    if (!('speechSynthesis' in window)) return setStatus('noSpeech');
    setStatus((await hasArabicVoice()) ? 'ok' : 'noArabic');
  };
  return (
    <div className="space-y-2">
      <button onClick={test} className="w-full py-2.5 rounded-xl bg-secondary font-bold text-sm">🔊 جرّب الصوت</button>
      <p className="text-xs text-muted-foreground leading-relaxed">الراوي بيحكي تعليمات اللعبة لحاله. بيفضّل صوت أردني إذا موجود؛ نبرة الصوت حسب الأصوات المثبّتة على جهازك.</p>
      {status === 'ok' && <p className="text-xs text-emerald-500 leading-relaxed">✅ جهازك فيه صوت عربي. إذا ما سمعت شي: علّي الصوت{isIOS ? '، وشيل الآيفون عن الصامت (الزر الجانبي)' : ''}.</p>}
      {status === 'noArabic' && (
        <p className="text-xs text-amber-500 leading-relaxed">
          ⚠️ جهازك ما فيه صوت عربي، فرح يعدّ بالبيب ويكتب الكلام على الشاشة بس. لتشغيل الحكي: {steps}، وبعدين سكّر المتصفح وارجع افتحه.
        </p>
      )}
      {status === 'noSpeech' && <p className="text-xs text-amber-500">⚠️ هالمتصفح ما بيدعم الحكي. جرّب Chrome أو Safari.</p>}
    </div>
  );
};

/** What the auto narrator is saying right now, or the big countdown number. */
export const VoiceBanner: React.FC<{ line: string; count: number | null }> = ({ line, count }) => (
  <div className="rounded-xl bg-primary/10 text-center py-2 px-3 text-sm font-bold">
    🔊 {count !== null ? <span className="text-2xl font-black text-primary">{count}</span> : line || 'الراوي الآلي شغّال'}
  </div>
);

export const SheikhAnswer: React.FC<{ p: MafiaPlayer; plain?: boolean }> = ({ p, plain }) => (
  <div className={`card-game text-center text-xl font-black ${plain ? '' : isMafia(p) ? 'text-red-500' : 'text-emerald-500'}`}>
    {p.name}: {isMafia(p) ? '👎 مافيا' : '👍 مواطن'}
  </div>
);

// ---------- ranking (stored on the phone that runs the game) ----------

const RANK_KEY = 'mafia_ranking';
export const loadRanking = (): Ranking => { try { return JSON.parse(localStorage.getItem(RANK_KEY) || '{}'); } catch { return {}; } };
export const saveRanking = (r: Ranking) => { try { localStorage.setItem(RANK_KEY, JSON.stringify(r)); } catch { /* private mode */ } };

/** Your own name and face, filled in for you next time. */
export const loadMe = (): { name: string; avatar: string } | null => { try { return JSON.parse(localStorage.getItem('mafia_me') || 'null'); } catch { return null; } };
export const saveMe = (name: string, avatar: string) => { try { localStorage.setItem('mafia_me', JSON.stringify({ name, avatar })); } catch { /* private mode */ } };

const GROUP_KEY = 'mafia_group';
export const loadGroup = () => { try { return localStorage.getItem(GROUP_KEY) ?? ''; } catch { return ''; } };

/** Adds a finished game: always to this phone's ranking, and to the group's shared ranking when a group is set. */
export async function recordResult(g: MafiaState, group: string): Promise<Ranking> {
  if (g.phase.t !== 'end') return loadRanking();
  const players = g.players.filter((p) => !p.id?.startsWith('bot-'));
  const local = addResult(loadRanking(), players, g.phase.win);
  saveRanking(local);
  if (!group) return local;
  await pushResult(group, players, g.phase.win);
  return (await fetchRanking(group)) ?? local;
}

/** The ranking to show: the group's shared one (from the database) if a group is set, otherwise this phone's. */
export function useRanking(group: string) {
  const [ranking, setRanking] = useState<Ranking>(loadRanking);
  useEffect(() => {
    try { localStorage.setItem(GROUP_KEY, group); } catch { /* private mode */ }
    if (!group) { setRanking(loadRanking()); return; }
    let live = true;
    const t = setTimeout(() => { void fetchRanking(group).then((r) => { if (live) setRanking(r ?? loadRanking()); }); }, 500);
    return () => { live = false; clearTimeout(t); };
  }, [group]);
  return [ranking, setRanking] as const;
}

export const GroupField: React.FC<{ group: string; setGroup: (g: string) => void }> = ({ group, setGroup }) => (
  <div className="card-game space-y-2">
    <h2 className="font-bold">👥 اسم الشلة</h2>
    <input value={group} onChange={(e) => setGroup(e.target.value.slice(0, 40))} placeholder="مثلاً: شلة الخميس"
      className="w-full text-sm font-bold py-2.5 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none" />
    <p className="text-xs text-muted-foreground">نفس الاسم = نفس الترتيب، مين ما فتح الغرفة. اتركه فاضي إذا بدك ترتيب على هالجوال بس</p>
  </div>
);

const MEDALS = ['🥇', '🥈', '🥉'];
export const RankingView: React.FC<{ ranking?: Ranking; onReset?: () => void; group?: string }> = ({ ranking, onReset, group }) => {
  const rows = ranking ? rankOrder(ranking) : [];
  if (!rows.length) return null;
  return (
    <div className="card-game space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">🏆 الترتيب{group ? ` · ${group}` : ''}</h2>
        {onReset && <button onClick={() => { if (confirm('أكيد بدك تصفّر الترتيب؟')) onReset(); }} className="text-xs text-muted-foreground underline">صفّر</button>}
      </div>
      {rows.map(([name, { wins, games }], i) => (
        <div key={name} className="flex items-center gap-2 text-sm">
          <span className="w-6 text-center">{MEDALS[i] ?? i + 1}</span>
          <span className="font-bold flex-1">{name}</span>
          <span className="text-muted-foreground">{wins} فوز من {games}</span>
        </div>
      ))}
    </div>
  );
};

export const WinnerButtons: React.FC<{ onPick: (win: 'mafia' | 'town') => void }> = ({ onPick }) => {
  const tap = useTap();
  return (
    <div>
      <p className="text-xs text-center text-muted-foreground mb-2">لما تخلص اللعبة: مين فاز؟</p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => { tap(50); onPick('town'); }} className="btn-secondary-game">👍 المواطنين</button>
        <button onClick={() => { tap(50); onPick('mafia'); }} className="btn-secondary-game">🔪 المافيا</button>
      </div>
    </div>
  );
};

/** With a human narrator the app only deals cards; then the phone waits for the result. */
export const CardsOnlyView: React.FC<{ s: MafiaState; onFinish: (win: 'mafia' | 'town') => void; onQuit: () => void; onRestart: () => void; ranking?: Ranking }> =
  ({ s, onFinish, onQuit, onRestart, ranking }) => {
    const tap = useTap();
    if (s.phase.t === 'end') {
      return (
        <Shell title="خلصت اللعبة" onBack={onQuit} footer={<button onClick={() => { tap(50); onRestart(); }} className="w-full btn-primary-game text-lg">🔄 العب مرة تانية</button>}>
          <EndView s={s} ranking={ranking} />
        </Shell>
      );
    }
    return (
      <Shell title="🤫 الكل عرف دوره" onBack={onQuit} footer={<WinnerButtons onPick={onFinish} />}>
        <div className="card-game text-center">
          <div className="text-6xl mb-3">📵</div>
          <p className="text-lg font-bold">سكّروا الموبايل، والراوي يكمّل اللعبة</p>
          <p className="text-sm text-muted-foreground mt-1">لما تخلص، ارجعوا هون واختاروا مين فاز عشان تنحسب بالترتيب</p>
        </div>
      </Shell>
    );
  };
/**
 * The step-by-step screen for the one-phone game without a narrator (the phone talks, players pick on it).
 * `online` adds who-has-acted hints and live vote counts; the narrator can always pick on someone's behalf.
 */
export const NarratorView: React.FC<{
  s: MafiaState; dispatch: (a: MafiaAction) => void; onQuit: () => void; onRestart: () => void;
  online?: { stepHint?: React.ReactNode; voteCounts?: Record<number, number>; revealFooter?: React.ReactNode; revealBody?: React.ReactNode };
  banner?: React.ReactNode; ranking?: Ranking;
}> = ({ s, dispatch, onQuit, onRestart, online, banner, ranking }) => {
  const tap = useTap();  const go = (a: MafiaAction, ms = 30) => { tap(ms); dispatch(a); };
  const ph = s.phase;

  if (ph.t === 'reveal') {
    return (
      <Shell banner={banner} title="جاهزين؟" onBack={onQuit} footer={online?.revealFooter ?? <button onClick={() => go({ type: 'beginNight' }, 50)} className="w-full btn-primary-game text-xl">🌙 ابدأ الليل</button>}>
        {online?.revealBody ?? (
          <div className="card-game text-center">
            <div className="text-6xl mb-4">🎙️</div>
            <p className="text-lg font-bold">الكل شاف كرته</p>
            <p className="text-muted-foreground mt-2">{banner ? 'حطّوا الجوال بالنص وعلّوا الصوت' : 'رجّعوا الجوال للراوي'}</p>
          </div>
        )}
      </Shell>
    );
  }

  if (ph.t === 'night') {
    const steps = nightSteps(s);
    const key = steps[ph.step];
    const info = STEP_INFO[key];
    const last = ph.step === steps.length - 1;
    const picked = key === 'intro' ? null : s.picks[key];
    return (
      <Shell banner={banner} title={s.night === 1 ? 'ليلة التعارف' : `الليلة ${s.night - 1}`} onBack={onQuit}
        footer={<button onClick={() => go({ type: 'nextStep' }, 50)} disabled={key !== 'intro' && picked === null} className="w-full btn-primary-game text-lg disabled:opacity-50">{last ? '☀️ الكل يفتح' : 'التالي'}</button>}>
        <div className="flex gap-1 justify-center">{steps.map((_, i) => <span key={i} className={`h-1.5 w-8 rounded-full ${i <= ph.step ? 'bg-primary' : 'bg-secondary'}`} />)}</div>
        <div className="card-game text-center">
          <div className="text-5xl mb-2">{info.icon}</div>
          <p className="text-xs text-muted-foreground mb-1">الراوي بيحكي بصوت عالي:</p>
          <p className="text-lg font-bold leading-relaxed">"{info.line}"</p>
        </div>
        {key !== 'intro' && (
          <>
            {online?.stepHint ?? <p className="text-sm text-muted-foreground">{info.who} {key === 'kill' ? 'بيأشّروا' : key === 'protect' ? 'بتأشّر' : 'بيأشّر'}، والراوي بيختار:</p>}
            <PlayerGrid players={s.players} selected={picked} onPick={(i) => dispatch({ type: 'pick', key, idx: i })}
              filter={key === 'kill' ? (p) => p.alive && !isMafia(p) : key === 'snipe' ? (p) => p.alive && p.role !== 'sniper' : undefined} />
            {key === 'snipe' && <NoShotButton picked={picked} onPick={() => dispatch({ type: 'pick', key, idx: NO_SHOT })} />}
            {key === 'check' && picked !== null && picked >= 0 && <SheikhAnswer p={s.players[picked]} plain={s.plain} />}
          </>
        )}
      </Shell>
    );
  }

  if (ph.t === 'out') {
    return (
      <Shell banner={banner} title={ph.by === 'vote' ? 'نتيجة التصويت' : 'صباح الخير'} onBack={onQuit}
        footer={<button onClick={() => go({ type: 'continue' })} className="w-full btn-primary-game text-lg">كمّل</button>}>
        <OutCard s={s} />
      </Shell>
    );
  }

  if (ph.t === 'boy') {
    const boy = s.players.find((p) => p.role === 'boy');
    return (
      <Shell banner={banner} title="💣 الولد" onBack={onQuit}>
        <div className="card-game text-center">
          <p className="text-lg font-bold">{boy?.name} كان الولد!</p>
          <p className="text-muted-foreground">مين بدّه ياخد معه؟</p>
        </div>
        <PlayerGrid players={s.players} onPick={(i) => dispatch({ type: 'boyTake', idx: i })} />
      </Shell>
    );
  }

  if (ph.t === 'day') {
    return (
      <Shell banner={banner} title="النهار ☀️" onBack={onQuit} footer={<button onClick={() => go({ type: 'toVote' }, 50)} className="w-full btn-primary-game text-lg">🗳️ للتصويت</button>}>
        <DayInfo s={s} />
      </Shell>
    );
  }

  if (ph.t === 'vote') {
    const counts = online?.voteCounts;
    return (
      <Shell banner={banner} title="التصويت 🗳️" onBack={onQuit}
        footer={<button onClick={() => go({ type: 'voteOut', idx: null })} className="w-full btn-secondary-game">ما حدا طلع، كمّلوا لليل 🌙</button>}>
        <div className="card-game text-center">
          <p className="font-bold">{counts ? 'الأصوات عم توصل من الموبايلات' : 'صوّتوا بإيديكم'}</p>
          <p className="text-sm text-muted-foreground">اللي أخد أكثر أصوات بيدافع عن حاله، وبعدين تصويت أخير. الراوي يختار مين طلع:</p>
        </div>
        <PlayerGrid players={s.players} onPick={(i) => dispatch({ type: 'voteOut', idx: i })}
          badge={counts ? (i) => counts[i] ? <span className="absolute top-1 left-1 min-w-[20px] h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-black flex items-center justify-center">{counts[i]}</span> : null : undefined} />
      </Shell>
    );
  }

  return (
    <Shell banner={banner} title="خلصت اللعبة" onBack={onQuit} footer={<button onClick={() => { tap(50); onRestart(); }} className="w-full btn-primary-game text-lg">🔄 العب مرة تانية</button>}>
      <EndView s={s} ranking={ranking} />
    </Shell>
  );
};
