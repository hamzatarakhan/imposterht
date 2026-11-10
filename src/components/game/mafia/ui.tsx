import React from 'react';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import {
  MafiaPlayer, MafiaRole, MafiaState, MafiaAction, ROLE_INFO, STEP_INFO, isMafia, nightSteps, buildRoles, maxMafia, MAFIA_SPECIALS, TOWN_SPECIALS,
} from '@/lib/mafia';

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

export const RoleEditor: React.FC<{ n: number; roles: MafiaRole[]; setRoles: (r: MafiaRole[]) => void }> = ({ n, roles, setRoles }) => {
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
      <p className="text-xs text-muted-foreground leading-relaxed">
        الكروت: {Object.entries(counts).map(([r, c]) => `${ROLE_INFO[r as MafiaRole].icon} ${ROLE_INFO[r as MafiaRole].name}${c > 1 ? ` ×${c}` : ''}`).join(' · ')}
      </p>
    </div>
  );
};

export const RoleCard: React.FC<{ me: MafiaPlayer; players: MafiaPlayer[] }> = ({ me, players }) => {
  const info = ROLE_INFO[me.role];
  const mates = isMafia(me) ? players.filter((q) => q !== me && isMafia(q)) : [];
  return (
    <div className={`card-game text-center border-2 ${info.team === 'mafia' ? 'border-red-500/50' : 'border-emerald-500/40'}`}>
      <div className="text-7xl mb-3">{info.icon}</div>
      <h2 className={`text-3xl font-black mb-2 ${info.team === 'mafia' ? 'text-red-500' : 'text-emerald-500'}`}>{info.name}</h2>
      <p className="text-sm text-muted-foreground mb-2">{info.desc}</p>
      {mates.length > 0 && (
        <div className="rounded-2xl bg-red-500/10 p-3 mt-3 text-sm">
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

export const EndView: React.FC<{ s: MafiaState }> = ({ s }) => {
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
      {s.log.length > 0 && <div className="card-game text-xs text-muted-foreground space-y-1">{s.log.map((l, i) => <p key={i}>{l}</p>)}</div>}
    </>
  );
};

/** What the auto narrator is saying right now, or the big countdown number. */
export const VoiceBanner: React.FC<{ line: string; count: number | null }> = ({ line, count }) => (
  <div className="rounded-xl bg-primary/10 text-center py-2 px-3 text-sm font-bold">
    🔊 {count !== null ? <span className="text-2xl font-black text-primary">{count}</span> : line || 'الراوي الآلي شغّال'}
  </div>
);

export const SheikhAnswer: React.FC<{ p: MafiaPlayer }> = ({ p }) => (
  <div className={`card-game text-center text-xl font-black ${isMafia(p) ? 'text-red-500' : 'text-emerald-500'}`}>
    {p.name}: {isMafia(p) ? '👎 مافيا' : '👍 مواطن'}
  </div>
);

/**
 * The narrator's screen for every phase after cards are dealt. Used by the local game and the online host.
 * `online` adds who-has-acted hints and live vote counts; the narrator can always pick on someone's behalf.
 */
export const NarratorView: React.FC<{
  s: MafiaState; dispatch: (a: MafiaAction) => void; onQuit: () => void; onRestart: () => void;
  online?: { stepHint?: React.ReactNode; voteCounts?: Record<number, number>; revealFooter?: React.ReactNode; revealBody?: React.ReactNode };
  banner?: React.ReactNode;
}> = ({ s, dispatch, onQuit, onRestart, online, banner }) => {
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
            {online?.stepHint ?? <p className="text-sm text-muted-foreground">{info.who} بيأشّر، والراوي بيختار:</p>}
            <PlayerGrid players={s.players} selected={picked} onPick={(i) => dispatch({ type: 'pick', key, idx: i })}
              filter={key === 'kill' ? (p) => p.alive && !isMafia(p) : undefined} />
            {key === 'check' && picked !== null && <SheikhAnswer p={s.players[picked]} />}
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
      <EndView s={s} />
    </Shell>
  );
};
