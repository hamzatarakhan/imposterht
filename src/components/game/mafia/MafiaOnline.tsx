import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Share2, QrCode } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  MafiaAction, MafiaRole, MafiaState, MIN_PLAYERS, STEP_INFO, isMafia, mafiaDecision, mafiaReducer, newGame, nightSteps, suggestRoles,
} from '@/lib/mafia';
import QRCodeModal from '../QRCodeModal';
import { DayInfo, EndView, NarratorView, OutCard, PlayerGrid, RoleCard, RoleEditor, SheikhAnswer, Shell, useTap } from './ui';

// ponytail: the narrator's phone holds the whole game and talks to players over a Supabase Realtime channel
// (no tables). Roles travel in the broadcast, so a player poking at devtools could peek; move dealing to an
// edge function if that ever matters. If the narrator's phone closes the tab mid-game, sessionStorage restores it.

export interface Lobbyist { id: string; name: string; avatar: string }
interface Snapshot { lobby: Lobbyist[]; game: MafiaState | null; seen: string[]; votes: Record<string, number>; mafiaPicks: Record<string, number> }
interface Act { from: string; kind: 'seen' | 'pick' | 'vote' | 'boy'; idx?: number }

const emptySnap: Snapshot = { lobby: [], game: null, seen: [], votes: {}, mafiaPicks: {} };

/** Per-tab player id: survives a refresh, but two tabs in one browser are two different players. */
export const tabId = () => {
  let id = sessionStorage.getItem('mafia_tab_id');
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('mafia_tab_id', id); }
  return id;
};

export const newRoomCode = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('');

function useChannel(code: string, me: { id: string; name: string; avatar: string; host?: boolean }, handlers: {
  onState?: (s: Snapshot) => void; onAct?: (a: Act) => void; onPresence?: (lobby: Lobbyist[]) => void; onJoin?: () => void;
}) {
  const [connected, setConnected] = useState(false);
  const chRef = useRef<RealtimeChannel | null>(null);
  const h = useRef(handlers);
  h.current = handlers;

  useEffect(() => {
    const ch = supabase.channel(`mafia-${code}`, { config: { presence: { key: me.id }, broadcast: { self: false } } });
    ch.on('broadcast', { event: 'state' }, ({ payload }) => h.current.onState?.(payload as Snapshot))
      .on('broadcast', { event: 'act' }, ({ payload }) => h.current.onAct?.(payload as Act))
      .on('presence', { event: 'sync' }, () => {
        const st = ch.presenceState<{ name: string; avatar: string; host?: boolean }>();
        const lobby = Object.entries(st).flatMap(([id, metas]) => (metas[0] && !metas[0].host ? [{ id, name: metas[0].name, avatar: metas[0].avatar }] : []));
        h.current.onPresence?.(lobby);
      })
      .on('presence', { event: 'join' }, () => h.current.onJoin?.())
      .subscribe(async (status) => {
        setConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') await ch.track({ name: me.name, avatar: me.avatar, host: !!me.host });
      });
    chRef.current = ch;
    return () => { supabase.removeChannel(ch); chRef.current = null; };
  }, [code, me.id, me.name, me.avatar, me.host]);

  const send = (event: 'state' | 'act', payload: unknown) => chRef.current?.send({ type: 'broadcast', event, payload });
  return { connected, send };
}

const Offline: React.FC<{ connected: boolean }> = ({ connected }) =>
  connected ? null : <div className="rounded-xl bg-amber-500/15 text-amber-600 text-xs font-bold text-center py-2">⏳ عم نتصل بالغرفة…</div>;

/** Applies a game action and clears per-phase scratch (votes, mafia picks) when a new phase starts. */
function withAction(sn: Snapshot, a: MafiaAction): Snapshot {
  if (!sn.game) return sn;
  const prev = sn.game.phase;
  const game = mafiaReducer(sn.game, a);
  const ph = game.phase;
  return {
    ...sn, game,
    votes: ph.t === 'vote' && prev.t !== 'vote' ? {} : sn.votes,
    mafiaPicks: ph.t === 'night' && prev.t !== 'night' ? {} : sn.mafiaPicks,
  };
}

/** Narrator's phone: creates the room, deals, and runs the game. */
export const MafiaHost: React.FC<{ code: string; onQuit: () => void }> = ({ code, onQuit }) => {
  const tap = useTap();
  const me = useMemo(() => ({ id: tabId(), name: 'الراوي', avatar: '🎙️', host: true }), []);
  const storeKey = `mafia_host_${code}`;
  const [snap, setSnap] = useState<Snapshot>(() => {
    try { return { ...emptySnap, ...JSON.parse(sessionStorage.getItem(storeKey) || '{}') }; } catch { return emptySnap; }
  });
  const [roles, setRoles] = useState<MafiaRole[] | null>(null);
  const [showQR, setShowQR] = useState(false);
  const snapRef = useRef(snap);
  snapRef.current = snap;

  const onAct = (a: Act) => setSnap((sn) => {
    const g = sn.game;
    if (!g) return sn;
    const me = g.players.find((p) => p.id === a.from);
    if (!me) return sn;
    const ph = g.phase;
    if (a.kind === 'seen' && ph.t === 'reveal') return sn.seen.includes(a.from) ? sn : { ...sn, seen: [...sn.seen, a.from] };
    if (a.idx === undefined || !g.players[a.idx]?.alive) return sn;
    if (a.kind === 'vote' && ph.t === 'vote' && me.alive) return { ...sn, votes: { ...sn.votes, [a.from]: a.idx } };
    if (a.kind === 'boy' && ph.t === 'boy' && me.role === 'boy') return withAction(sn, { type: 'boyTake', idx: a.idx });
    if (a.kind === 'pick' && ph.t === 'night' && me.alive) {
      const key = nightSteps(g)[ph.step];
      if (key === 'kill' && isMafia(me) && !isMafia(g.players[a.idx])) {
        const mafiaPicks = { ...sn.mafiaPicks, [a.from]: a.idx };
        const kill = mafiaDecision(g.players, mafiaPicks);
        return kill === null ? { ...sn, mafiaPicks } : withAction({ ...sn, mafiaPicks }, { type: 'pick', key: 'kill', idx: kill });
      }
      if (key !== 'intro' && key !== 'kill' && STEP_INFO[key].role === me.role) return withAction(sn, { type: 'pick', key, idx: a.idx });
    }
    return sn;
  });

  const { connected, send } = useChannel(code, me, {
    onAct,
    onPresence: (lobby) => setSnap((sn) => ({ ...sn, lobby })),
    onJoin: () => send('state', snapRef.current),
  });

  useEffect(() => {
    send('state', snap);
    try { sessionStorage.setItem(storeKey, JSON.stringify(snap)); } catch { /* private mode */ }
  }, [snap, connected]); // eslint-disable-line react-hooks/exhaustive-deps

  const quit = () => { try { sessionStorage.removeItem(storeKey); } catch { /* ignore */ } onQuit(); };
  const link = `${window.location.origin}/?mafia=${code}`;
  const share = async () => {
    tap();
    try { if (navigator.share) await navigator.share({ title: 'المافيا', text: `ادخل غرفة المافيا: ${code}`, url: link }); else await navigator.clipboard.writeText(link); } catch { /* cancelled */ }
  };

  const g = snap.game;
  if (g) {
    const byId = (id: string) => g.players.find((p) => p.id === id);
    const ph = g.phase;
    let stepHint: React.ReactNode;
    if (ph.t === 'night') {
      const key = nightSteps(g)[ph.step];
      if (key === 'kill') {
        const picks = Object.entries(snap.mafiaPicks);
        stepHint = (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>المافيا عم يختاروا على موبايلاتهم{g.players.some((p) => p.alive && p.role === 'godfather') ? ' (شيخ المافيا بيحسم)' : ''}:</p>
            {picks.length === 0 ? <p>⏳ لسا ما حدا اختار</p> : picks.map(([id, t]) => <p key={id}>{byId(id)?.name} ← {g.players[t]?.name}</p>)}
          </div>
        );
      } else if (key !== 'intro') {
        const holder = g.players.find((p) => p.alive && p.role === STEP_INFO[key].role);
        stepHint = <p className="text-sm text-muted-foreground">{g.picks[key] === null ? `⏳ بانتظار ${STEP_INFO[key].who} (${holder?.name})…` : `✅ ${STEP_INFO[key].who} اختار`}</p>;
      }
    }
    const voteCounts: Record<number, number> = {};
    Object.values(snap.votes).forEach((t) => { voteCounts[t] = (voteCounts[t] ?? 0) + 1; });
    const allSeen = g.players.every((p) => p.id && snap.seen.includes(p.id));

    return (
      <NarratorView
        s={g}
        dispatch={(a) => setSnap((sn) => withAction(sn, a))}
        onQuit={quit}
        onRestart={() => setSnap((sn) => ({ ...sn, game: null, seen: [], votes: {}, mafiaPicks: {} }))}
        online={{
          stepHint, voteCounts,
          revealBody: (
            <div className="card-game space-y-2">
              <p className="font-bold text-center mb-2">كل واحد عم يشوف كرته على موبايله</p>
              {g.players.map((p) => <p key={p.id} className="text-sm">{p.id && snap.seen.includes(p.id) ? '✅' : '⏳'} {p.avatar} {p.name}</p>)}
            </div>
          ),
          revealFooter: (
            <button onClick={() => { tap(50); setSnap((sn) => withAction(sn, { type: 'beginNight' })); }} className="w-full btn-primary-game text-xl">
              {allSeen ? '🌙 ابدأ الليل' : `🌙 ابدأ الليل (${snap.seen.length}/${g.players.length} شافوا)`}
            </button>
          ),
        }}
      />
    );
  }

  const n = snap.lobby.length;
  const roleList = roles && roles.length === n ? roles : n >= MIN_PLAYERS ? suggestRoles(n) : [];
  return (
    <Shell title="غرفة المافيا" onBack={quit}
      footer={<button onClick={() => { tap(50); setSnap((sn) => ({ ...sn, game: newGame(sn.lobby, roleList), seen: [], votes: {}, mafiaPicks: {} })); }}
        disabled={n < MIN_PLAYERS} className="w-full btn-primary-game text-xl disabled:opacity-50 disabled:cursor-not-allowed">
        {n < MIN_PLAYERS ? `بدنا ${MIN_PLAYERS} لاعبين على الأقل (${n})` : '🎴 وزّع الكروت'}
      </button>}>
      <Offline connected={connected} />
      <div className="card-game text-center">
        <p className="text-xs text-muted-foreground mb-1">كود الغرفة</p>
        <p className="text-4xl font-black tracking-[0.3em] text-primary mb-3" dir="ltr">{code}</p>
        <div className="flex gap-2">
          <button onClick={share} className="flex-1 py-2.5 rounded-xl bg-secondary font-bold text-sm flex items-center justify-center gap-2"><Share2 size={16} /> شارك الرابط</button>
          <button onClick={() => { tap(); setShowQR(true); }} className="flex-1 py-2.5 rounded-xl bg-secondary font-bold text-sm flex items-center justify-center gap-2"><QrCode size={16} /> QR</button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">إنت الراوي 🎙️، ما بتلعب. اللاعبين بيدخلوا من موبايلاتهم</p>
      </div>
      <QRCodeModal isOpen={showQR} onClose={() => setShowQR(false)} url={link} />
      <div className="card-game">
        <h2 className="font-bold mb-3">👥 اللي دخلوا ({n})</h2>
        {n === 0 ? <p className="text-sm text-muted-foreground">⏳ بانتظار اللاعبين…</p> : (
          <div className="flex flex-wrap gap-2">{snap.lobby.map((p) => <span key={p.id} className="px-3 py-1.5 rounded-full bg-secondary text-sm font-bold">{p.avatar} {p.name}</span>)}</div>
        )}
      </div>
      {n >= MIN_PLAYERS && <RoleEditor n={n} roles={roleList} setRoles={setRoles} />}
    </Shell>
  );
};

/** A player's own phone. */
export const MafiaPlayerScreen: React.FC<{ code: string; name: string; avatar: string; onQuit: () => void }> = ({ code, name, avatar, onQuit }) => {
  const tap = useTap();
  const me = useMemo(() => ({ id: tabId(), name, avatar }), [name, avatar]);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [checked, setChecked] = useState<number | null>(null);
  const { connected, send } = useChannel(code, me, { onState: setSnap });
  const act = (kind: Act['kind'], idx?: number) => { tap(); send('act', { from: me.id, kind, idx } satisfies Act); };

  const g = snap?.game;
  const myIdx = g ? g.players.findIndex((p) => p.id === me.id) : -1;
  const mine = g?.players[myIdx];
  const phaseKey = g ? `${g.night}-${g.phase.t}-${g.phase.t === 'night' ? g.phase.step : ''}` : '';
  useEffect(() => setChecked(null), [phaseKey]);

  const wrap = (title: string, body: React.ReactNode, footer?: React.ReactNode) => (
    <Shell title={title} onBack={onQuit} footer={footer}>
      <Offline connected={connected} />
      {mine && !mine.alive && g?.phase.t !== 'end' && <div className="rounded-xl bg-secondary text-center text-sm font-bold py-2">💀 طلعت من اللعبة، تابع بس ولا تحكي</div>}
      {body}
    </Shell>
  );

  if (!snap) return wrap('غرفة المافيا', <div className="card-game text-center"><div className="text-5xl mb-3">⏳</div><p className="font-bold">عم ندوّر على الغرفة {code}…</p><p className="text-sm text-muted-foreground mt-1">تأكد إنّو الراوي فاتح الغرفة</p></div>);
  if (!g) return wrap('غرفة المافيا', (
    <div className="card-game text-center">
      <div className="text-5xl mb-3">{avatar}</div>
      <p className="text-lg font-bold">أهلا {name}! إنت بالغرفة ✅</p>
      <p className="text-sm text-muted-foreground mt-1">استنى الراوي يوزّع الكروت ({snap.lobby.length} لاعبين لهلأ)</p>
    </div>
  ));
  if (!mine) return wrap('غرفة المافيا', <div className="card-game text-center"><p className="font-bold">اللعبة بلّشت بدونك 😅</p><p className="text-sm text-muted-foreground">استنى الجولة الجاية</p></div>);

  const ph = g.phase;
  if (ph.t === 'reveal') {
    const seen = snap.seen.includes(me.id);
    return wrap('كرتك', <RoleCard me={mine} players={g.players} />,
      <button onClick={() => act('seen')} disabled={seen} className="w-full btn-primary-game text-lg disabled:opacity-60">{seen ? '✅ تمام، استنى الراوي' : '🙈 شفت كرتي'}</button>);
  }

  if (ph.t === 'night') {
    const key = nightSteps(g)[ph.step];
    const mineTurn = mine.alive && key !== 'intro' && (key === 'kill' ? isMafia(mine) : STEP_INFO[key].role === mine.role);
    if (!mineTurn) return wrap('الليل 🌙', <div className="card-game text-center py-10"><div className="text-6xl mb-3">😴</div><p className="text-lg font-bold">نام وسكّر عيونك</p><p className="text-sm text-muted-foreground mt-1">الراوي بيصحّيك إذا إلك دور</p></div>);
    const info = STEP_INFO[key];
    const myPick = key === 'kill' ? snap.mafiaPicks[me.id] ?? null : checked;
    return wrap('دورك 🌙', (
      <>
        <div className="card-game text-center"><div className="text-5xl mb-2">{info.icon}</div><p className="text-lg font-bold">{info.line}</p></div>
        {key === 'kill' && Object.keys(snap.mafiaPicks).length > 0 && (
          <div className="card-game text-sm space-y-1">
            {Object.entries(snap.mafiaPicks).map(([id, t]) => <p key={id}>{g.players.find((p) => p.id === id)?.name} ← {g.players[t]?.name}</p>)}
            {g.picks.kill !== null && <p className="font-bold text-red-500">القرار: {g.players[g.picks.kill].name}</p>}
          </div>
        )}
        <PlayerGrid players={g.players} selected={myPick} onPick={(i) => { setChecked(i); act('pick', i); }}
          filter={key === 'kill' ? (p) => p.alive && !isMafia(p) : (p, i) => p.alive && (key !== 'check' || i !== myIdx)} />
        {key === 'check' && checked !== null && <SheikhAnswer p={g.players[checked]} />}
      </>
    ));
  }

  if (ph.t === 'day') return wrap('النهار ☀️', <DayInfo s={g} />);
  if (ph.t === 'out') return wrap(ph.by === 'vote' ? 'نتيجة التصويت' : 'صباح الخير', <OutCard s={g} />);
  if (ph.t === 'end') return wrap('خلصت اللعبة', <EndView s={g} />);

  if (ph.t === 'boy') {
    if (mine.role !== 'boy') return wrap('💣 الولد', <div className="card-game text-center"><p className="font-bold">{g.players.find((p) => p.role === 'boy')?.name} كان الولد!</p><p className="text-sm text-muted-foreground">عم يختار مين ياخد معه…</p></div>);
    return wrap('💣 خود حدا معك', (
      <>
        <div className="card-game text-center"><p className="font-bold">إنت الولد! مين بدك تاخد معك برا اللعبة؟</p></div>
        <PlayerGrid players={g.players} onPick={(i) => act('boy', i)} />
      </>
    ));
  }

  // vote
  const counts: Record<number, number> = {};
  Object.values(snap.votes).forEach((t) => { counts[t] = (counts[t] ?? 0) + 1; });
  return wrap('التصويت 🗳️', (
    <>
      <div className="card-game text-center">
        <p className="font-bold">{mine.alive ? 'مين بدك تطلّع؟' : 'عم يصوّتوا…'}</p>
        <p className="text-sm text-muted-foreground">اللي بياخد أكثر أصوات بيدافع عن حاله، والراوي بيعلن مين طلع</p>
      </div>
      <PlayerGrid players={g.players} selected={snap.votes[me.id] ?? null}
        onPick={mine.alive ? (i) => act('vote', i) : undefined} filter={(p, i) => p.alive && i !== myIdx}
        badge={(i) => counts[i] ? <span className="absolute top-1 left-1 min-w-[20px] h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-black flex items-center justify-center">{counts[i]}</span> : null} />
    </>
  ));
};
