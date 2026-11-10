import React, { useState } from 'react';
import { ArrowRight, Plus, X, Minus } from 'lucide-react';
import { useGame, AVATAR_OPTIONS } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { useSavedPlayers } from '@/hooks/useSavedPlayers';
import {
  MafiaPlayer, MafiaRole, ROLE_INFO, MIN_PLAYERS, suggestRoles, shuffle, isMafia, resolveNight, winner,
} from '@/lib/mafia';

type Phase =
  | { t: 'setup' }
  | { t: 'pass'; i: number }
  | { t: 'role'; i: number }
  | { t: 'handback' }
  | { t: 'night'; step: number }
  | { t: 'day' }
  | { t: 'vote' }
  | { t: 'out'; idx: number; by: 'night' | 'vote' | 'boy'; then?: 'day' | 'vote' }
  | { t: 'boy'; then: 'day' | 'vote' }
  | { t: 'end'; win: 'mafia' | 'town' };

type NightStep = { key: 'intro' | 'kill' | 'silence' | 'check' | 'protect'; line: string; who: string; icon: string };

const Shell: React.FC<{ title?: string; onBack?: () => void; children: React.ReactNode; footer?: React.ReactNode }> = ({ title, onBack, children, footer }) => (
  <div className="min-h-screen flex flex-col relative">
    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors" aria-label="رجوع">
          <ArrowRight size={20} />
        </button>
      )}
      <h1 className="text-xl font-black">🔪 {title ?? 'المافيا'}</h1>
    </div>
    <div className="flex-1 p-4 pb-32 space-y-4">{children}</div>
    {footer && <div className="sticky bottom-0 p-4 bg-gradient-to-t from-background via-background to-transparent">{footer}</div>}
  </div>
);

const MafiaGame: React.FC = () => {
  const { setScreen } = useGame();
  const { playSound, vibrate } = useSettings();
  const { savedPlayers } = useSavedPlayers();
  const tap = (ms = 30) => { playSound('click'); vibrate(ms); };

  const [names, setNames] = useState<{ name: string; avatar: string }[]>(
    savedPlayers.length ? savedPlayers.map((p) => ({ name: p.name, avatar: p.avatar })) : [],
  );
  const [newName, setNewName] = useState('');
  const [roles, setRoles] = useState<MafiaRole[] | null>(null); // null = auto-suggest
  const [players, setPlayers] = useState<MafiaPlayer[]>([]);
  const [phase, setPhase] = useState<Phase>({ t: 'setup' });
  const [night, setNight] = useState(1);
  const [picks, setPicks] = useState<{ kill: number | null; silence: number | null; check: number | null; protect: number | null }>({ kill: null, silence: null, check: null, protect: null });
  const [silenced, setSilenced] = useState<number | null>(null);
  const [lastKilled, setLastKilled] = useState<number | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const roleList = roles ?? (names.length >= MIN_PLAYERS ? suggestRoles(names.length) : []);
  const quit = () => { tap(); setScreen('hub'); };

  // ---------- helpers ----------
  const aliveWith = (r: MafiaRole) => players.some((p) => p.alive && p.role === r);
  const kill = (ps: MafiaPlayer[], idx: number) => ps.map((p, i) => (i === idx ? { ...p, alive: false } : p));

  const afterOut = (ps: MafiaPlayer[], idx: number, by: 'night' | 'vote' | 'boy', then?: 'day' | 'vote') => {
    setPlayers(ps);
    setLog((l) => [...l, `${by === 'vote' ? '🗳️ انطرد' : by === 'boy' ? '💣 أخذه الولد' : '💀 انقتل'}: ${ps[idx].name} (${ROLE_INFO[ps[idx].role].name})`]);
    setPhase({ t: 'out', idx, by, then });
  };

  const continueAfterOut = (idx: number, by: 'night' | 'vote' | 'boy', then?: 'day' | 'vote') => {
    tap();
    if (players[idx].role === 'boy' && by !== 'boy') return setPhase({ t: 'boy', then: by === 'night' ? 'day' : 'vote' });
    const w = winner(players);
    if (w) return setPhase({ t: 'end', win: w });
    const origin = by === 'boy' ? then : by === 'night' ? 'day' : 'vote';
    setPhase(origin === 'vote' ? startNight() : { t: 'day' });
  };

  const nightSteps: NightStep[] =
    night === 1
      ? [{ key: 'intro', icon: '🌙', who: 'الكل', line: 'الكل ينام… المافيا تفتح وتتعرّف على بعض. الشيخ يفتح، البنت تفتح، الولد يفتح… الكل يسكّر.' }]
      : [
          { key: 'kill', icon: '🔪', who: 'المافيا', line: 'المافيا تفتح… مين بدكم تقتلوا؟' },
          ...(aliveWith('silencer') ? [{ key: 'silence' as const, icon: '✂️', who: 'قص المافيا', line: 'قص المافيا يفتح… مين بدك تسكّت بكرا؟' }] : []),
          ...(aliveWith('sheikh') ? [{ key: 'check' as const, icon: '🕵️', who: 'الشيخ', line: 'الشيخ يفتح… عن مين بدك تسأل؟' }] : []),
          ...(aliveWith('girl') ? [{ key: 'protect' as const, icon: '💉', who: 'البنت', line: 'البنت تفتح… مين بدك تحمي؟' }] : []),
        ];

  function startNight(): Phase {
    setPicks({ kill: null, silence: null, check: null, protect: null });
    setShowCheck(false);
    return { t: 'night', step: 0 };
  }

  const finishNight = () => {
    if (night === 1) {
      setNight(2); setSilenced(null); setLastKilled(null);
      return setPhase({ t: 'day' });
    }
    setNight((n) => n + 1);
    setSilenced(picks.silence);
    const dead = resolveNight(picks.kill, picks.protect);
    setLastKilled(dead);
    if (dead === null) return setPhase({ t: 'day' });
    afterOut(kill(players, dead), dead, 'night');
  };

  const startGame = () => {
    tap(50);
    const dealt = shuffle(roleList);
    setPlayers(names.map((n, i) => ({ ...n, role: dealt[i], alive: true })));
    setNight(1); setLog([]); setSilenced(null); setLastKilled(null);
    setPhase({ t: 'pass', i: 0 });
  };

  const PlayerGrid: React.FC<{ onPick: (i: number) => void; selected?: number | null; filter?: (p: MafiaPlayer) => boolean }> = ({ onPick, selected, filter = (p) => p.alive }) => (
    <div className="grid grid-cols-3 gap-2">
      {players.map((p, i) => filter(p) && (
        <button key={i} onClick={() => { tap(); onPick(i); }}
          className={`p-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${selected === i ? 'border-primary bg-primary/15' : 'border-transparent bg-secondary/60'}`}>
          <span className="text-2xl">{p.avatar}</span>
          <span className="text-xs font-bold truncate max-w-full">{p.name}</span>
        </button>
      ))}
    </div>
  );

  // ---------- screens ----------
  if (phase.t === 'setup') {
    const n = names.length;
    const mafiaN = roleList.filter((r) => ROLE_INFO[r].team === 'mafia').length;
    const setMafia = (m: number) => {
      const maf: MafiaRole[] = [];
      if (m >= 2) maf.push('godfather');
      if (m >= 3 || (m >= 2 && n >= 9)) maf.push('silencer');
      while (maf.length < m) maf.push('mafia');
      const next = [...maf.slice(0, m), ...roleList.filter((r) => r === 'sheikh' || r === 'girl' || r === 'boy')];
      while (next.length < n) next.push('citizen');
      setRoles(next.slice(0, n));
    };
    const toggleTown = (r: MafiaRole) => {
      const has = roleList.includes(r);
      const next = [...roleList];
      if (has) next[next.indexOf(r)] = 'citizen';
      else if (next.includes('citizen')) next[next.indexOf('citizen')] = r;
      setRoles(next);
    };
    const add = () => {
      const name = newName.trim();
      if (!name || names.some((x) => x.name === name)) return;
      tap(); setNames([...names, { name, avatar: AVATAR_OPTIONS[n % AVATAR_OPTIONS.length] }]); setNewName(''); setRoles(null);
    };

    return (
      <Shell onBack={quit}
        footer={<button onClick={startGame} disabled={n < MIN_PLAYERS} className="w-full btn-primary-game text-xl disabled:opacity-50 disabled:cursor-not-allowed">
          {n < MIN_PLAYERS ? `بدنا ${MIN_PLAYERS} لاعبين على الأقل` : '🎴 وزّع الكروت'}
        </button>}>
        <div className="card-game">
          <h2 className="font-bold mb-1">👥 اللاعبين ({n})</h2>
          <p className="text-xs text-muted-foreground mb-3">الراوي ما بيلعب، هو اللي ماسك الجوال</p>
          <div className="flex gap-2 mb-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value.slice(0, 20))} onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="اسم اللاعب" className="flex-1 text-sm font-bold py-2.5 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none" />
            <button onClick={add} disabled={!newName.trim()} className="px-4 rounded-xl bg-primary text-primary-foreground disabled:opacity-50" aria-label="إضافة"><Plus size={20} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {names.map((p, i) => (
              <span key={p.name} className="flex items-center gap-1 pl-1 pr-3 py-1.5 rounded-full bg-secondary text-sm font-bold">
                {p.avatar} {p.name}
                <button onClick={() => { tap(); setNames(names.filter((_, j) => j !== i)); setRoles(null); }} className="p-1 text-muted-foreground hover:text-destructive" aria-label={`حذف ${p.name}`}><X size={14} /></button>
              </span>
            ))}
          </div>
        </div>

        {n >= MIN_PLAYERS && (
          <div className="card-game space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">🔪 عدد المافيا</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => { tap(); setMafia(Math.max(1, mafiaN - 1)); }} className="p-2 rounded-xl bg-secondary" aria-label="أقل"><Minus size={16} /></button>
                <span className="text-2xl font-black text-primary w-6 text-center">{mafiaN}</span>
                <button onClick={() => { tap(); setMafia(Math.min(Math.floor((n - 1) / 2), mafiaN + 1)); }} className="p-2 rounded-xl bg-secondary" aria-label="أكثر"><Plus size={16} /></button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">أدوار المواطنين (اضغط لتشغيل أو إطفاء)</p>
              <div className="flex flex-wrap gap-2">
                {(['sheikh', 'girl', 'boy'] as MafiaRole[]).map((r) => (
                  <button key={r} onClick={() => { tap(); toggleTown(r); }}
                    className={`px-3 py-2 rounded-xl text-sm font-bold ${roleList.includes(r) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    {ROLE_INFO[r].icon} {ROLE_INFO[r].name}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              الكروت: {Object.entries(roleList.reduce<Record<string, number>>((a, r) => ({ ...a, [r]: (a[r] ?? 0) + 1 }), {}))
                .map(([r, c]) => `${ROLE_INFO[r as MafiaRole].icon} ${ROLE_INFO[r as MafiaRole].name}${c > 1 ? ` ×${c}` : ''}`).join(' · ')}
            </div>
          </div>
        )}
      </Shell>
    );
  }

  if (phase.t === 'pass' || phase.t === 'role') {
    const p = players[phase.i];
    const next = () => { tap(); setPhase(phase.i + 1 < players.length ? { t: 'pass', i: phase.i + 1 } : { t: 'handback' }); };
    const info = ROLE_INFO[p.role];
    const mates = players.filter((q) => q !== p && isMafia(q));
    return (
      <Shell title="توزيع الكروت" onBack={quit}>
        <div className="text-center text-sm text-muted-foreground font-bold">{phase.i + 1} / {players.length}</div>
        {phase.t === 'pass' ? (
          <div className="card-game text-center">
            <div className="text-6xl mb-4">{p.avatar}</div>
            <p className="text-muted-foreground mb-6">أعطِ الجوال لـ <span className="text-primary font-bold">{p.name}</span></p>
            <button onClick={() => { tap(50); setPhase({ t: 'role', i: phase.i }); }} className="w-full btn-primary-game text-lg">👀 أنا {p.name}، وريني كرتي</button>
          </div>
        ) : (
          <div className={`card-game text-center border-2 ${info.team === 'mafia' ? 'border-red-500/50' : 'border-emerald-500/40'}`}>
            <div className="text-7xl mb-3">{info.icon}</div>
            <h2 className={`text-3xl font-black mb-2 ${info.team === 'mafia' ? 'text-red-500' : 'text-emerald-500'}`}>{info.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{info.desc}</p>
            {info.team === 'mafia' && mates.length > 0 && (
              <div className="rounded-2xl bg-red-500/10 p-3 mb-4 text-sm">
                <p className="font-bold mb-1">جماعتك:</p>
                {mates.map((m) => <p key={m.name}>{m.avatar} {m.name} — {ROLE_INFO[m.role].name}</p>)}
              </div>
            )}
            <button onClick={next} className="w-full btn-secondary-game">🙈 خبّيت كرتي، التالي</button>
          </div>
        )}
      </Shell>
    );
  }

  if (phase.t === 'handback') {
    return (
      <Shell title="جاهزين؟" onBack={quit} footer={<button onClick={() => { tap(50); setPhase(startNight()); }} className="w-full btn-primary-game text-xl">🌙 ابدأ الليل</button>}>
        <div className="card-game text-center">
          <div className="text-6xl mb-4">🎙️</div>
          <p className="text-lg font-bold">الكل شاف كرته</p>
          <p className="text-muted-foreground mt-2">رجّعوا الجوال للراوي</p>
        </div>
      </Shell>
    );
  }

  if (phase.t === 'night') {
    const step = nightSteps[phase.step];
    const last = phase.step === nightSteps.length - 1;
    const key = step.key;
    const picked = key === 'intro' ? null : picks[key];
    const nextStep = () => { tap(50); if (last) finishNight(); else { setShowCheck(false); setPhase({ t: 'night', step: phase.step + 1 }); } };
    const canNext = key === 'intro' || picked !== null;
    return (
      <Shell title={night === 1 ? 'ليلة التعارف' : `الليلة ${night - 1}`} onBack={quit}
        footer={<button onClick={nextStep} disabled={!canNext} className="w-full btn-primary-game text-lg disabled:opacity-50">{last ? '☀️ الكل يفتح' : 'التالي'}</button>}>
        <div className="flex gap-1 justify-center">{nightSteps.map((_, i) => <span key={i} className={`h-1.5 w-8 rounded-full ${i <= phase.step ? 'bg-primary' : 'bg-secondary'}`} />)}</div>
        <div className="card-game text-center">
          <div className="text-5xl mb-2">{step.icon}</div>
          <p className="text-xs text-muted-foreground mb-1">الراوي بيحكي بصوت عالي:</p>
          <p className="text-lg font-bold leading-relaxed">"{step.line}"</p>
        </div>
        {key !== 'intro' && (
          <>
            <p className="text-sm text-muted-foreground">{step.who} بيأشّر، والراوي بيختار:</p>
            <PlayerGrid selected={picked} onPick={(i) => { setPicks({ ...picks, [key]: i }); if (key === 'check') setShowCheck(true); }}
              filter={key === 'kill' ? (p) => p.alive && !isMafia(p) : undefined} />
            {key === 'check' && showCheck && picked !== null && (
              <div className={`card-game text-center text-xl font-black ${isMafia(players[picked]) ? 'text-red-500' : 'text-emerald-500'}`}>
                {isMafia(players[picked]) ? '👎 مافيا' : '👍 مواطن'}
                <p className="text-xs font-normal text-muted-foreground mt-1">أشّر للشيخ بالإشارة</p>
              </div>
            )}
          </>
        )}
      </Shell>
    );
  }

  if (phase.t === 'out') {
    const p = players[phase.idx];
    const info = ROLE_INFO[p.role];
    return (
      <Shell title={phase.by === 'vote' ? 'نتيجة التصويت' : 'صباح الخير'} onBack={quit}
        footer={<button onClick={() => continueAfterOut(phase.idx, phase.by, phase.then)}className="w-full btn-primary-game text-lg">كمّل</button>}>
        <div className="card-game text-center">
          <div className="text-6xl mb-2">{p.avatar}</div>
          <p className="text-2xl font-black mb-1">{p.name}</p>
          <p className="text-muted-foreground mb-4">{phase.by === 'vote' ? 'طلع من اللعبة بالتصويت 🗳️' : phase.by === 'boy' ? 'أخذه الولد معه 💣' : 'انقتل بالليل 💀'}</p>
          <div className={`inline-block px-4 py-2 rounded-2xl font-black ${info.team === 'mafia' ? 'bg-red-500/15 text-red-500' : 'bg-emerald-500/15 text-emerald-500'}`}>
            كان {info.icon} {info.name}
          </div>
        </div>
      </Shell>
    );
  }

  if (phase.t === 'boy') {
    const boyIdx = players.findIndex((p) => p.role === 'boy');
    return (
      <Shell title="💣 الولد" onBack={quit}>
        <div className="card-game text-center">
          <p className="text-lg font-bold">{players[boyIdx]?.name} كان الولد!</p>
          <p className="text-muted-foreground">مين بدّه ياخد معه؟</p>
        </div>
        <PlayerGrid onPick={(i) => afterOut(kill(players, i), i, 'boy', phase.then)} />
      </Shell>
    );
  }

  if (phase.t === 'day') {
    const saved = night > 2 && lastKilled === null && picks.kill !== null;
    return (
      <Shell title="النهار ☀️" onBack={quit}
        footer={<button onClick={() => { tap(50); setPhase({ t: 'vote' }); }} className="w-full btn-primary-game text-lg">🗳️ للتصويت</button>}>
        <div className="card-game text-center space-y-2">
          {night === 2 && lastKilled === null && !saved && <p className="font-bold">ليلة التعارف خلصت، ما حدا انقتل 🌅</p>}
          {saved && <p className="font-bold text-emerald-500">🛡️ المافيا حاولت تقتل، بس البنت أنقذته!</p>}
          {silenced !== null && players[silenced]?.alive && (
            <p className="font-bold text-amber-500">🤐 {players[silenced].name} مسكّت، ممنوع يحكي هالنهار</p>
          )}
          <p className="text-sm text-muted-foreground">كل واحد بدوره يحكي ويتّهم أو يحكي "سكيب"</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {players.map((p, i) => (
            <div key={i} className={`p-3 rounded-2xl flex flex-col items-center gap-1 bg-secondary/60 ${p.alive ? '' : 'opacity-40 line-through'}`}>
              <span className="text-2xl">{p.alive ? p.avatar : '💀'}</span>
              <span className="text-xs font-bold truncate max-w-full">{p.name}</span>
              {i === silenced && p.alive && <span className="text-[10px]">🤐 مسكّت</span>}
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  if (phase.t === 'vote') {
    return (
      <Shell title="التصويت 🗳️" onBack={quit}
        footer={<button onClick={() => { tap(); setLog((l) => [...l, '🗳️ ما حدا طلع']); setPhase(startNight()); }} className="w-full btn-secondary-game">ما حدا طلع، كمّلوا لليل 🌙</button>}>
        <div className="card-game text-center">
          <p className="font-bold">صوّتوا بإيديكم</p>
          <p className="text-sm text-muted-foreground">اللي أخد أكثر أصوات بيدافع عن حاله، وبعدين تصويت أخير. الراوي يختار مين طلع:</p>
        </div>
        <PlayerGrid onPick={(i) => afterOut(kill(players, i), i, 'vote')} />
      </Shell>
    );
  }

  // end
  return (
    <Shell title="خلصت اللعبة" onBack={quit}
      footer={<button onClick={() => { tap(50); setRoles(null); setPhase({ t: 'setup' }); }} className="w-full btn-primary-game text-lg">🔄 العب مرة تانية</button>}>
      <div className={`card-game text-center ${phase.win === 'mafia' ? 'text-red-500' : 'text-emerald-500'}`}>
        <div className="text-6xl mb-2">{phase.win === 'mafia' ? '🔪' : '🏆'}</div>
        <p className="text-3xl font-black">{phase.win === 'mafia' ? 'المافيا ربحت!' : 'المواطنين ربحوا!'}</p>
      </div>
      <div className="card-game space-y-2">
        {players.map((p) => (
          <div key={p.name} className={`flex items-center gap-2 text-sm ${p.alive ? '' : 'opacity-60'}`}>
            <span>{p.avatar}</span><span className="font-bold flex-1">{p.name}</span>
            <span className={ROLE_INFO[p.role].team === 'mafia' ? 'text-red-500' : 'text-emerald-500'}>{ROLE_INFO[p.role].icon} {ROLE_INFO[p.role].name}</span>
            {!p.alive && <span>💀</span>}
          </div>
        ))}
      </div>
      {log.length > 0 && <div className="card-game text-xs text-muted-foreground space-y-1">{log.map((l, i) => <p key={i}>{l}</p>)}</div>}
    </Shell>
  );
};

export default MafiaGame;
