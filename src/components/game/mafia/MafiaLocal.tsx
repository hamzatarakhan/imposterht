import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { AVATAR_OPTIONS } from '@/context/GameContext';
import { useSavedPlayers } from '@/hooks/useSavedPlayers';
import { MafiaAction, MafiaRole, MafiaState, MIN_PLAYERS, mafiaReducer, newGame, suggestRoles } from '@/lib/mafia';
import { NarratorView, RoleCard, RoleEditor, Shell, useTap } from './ui';

/** One phone, held by the narrator; cards are revealed by passing the phone around. */
const MafiaLocal: React.FC<{ onQuit: () => void }> = ({ onQuit }) => {
  const tap = useTap();
  const { savedPlayers } = useSavedPlayers();
  const [names, setNames] = useState(savedPlayers.map((p) => ({ name: p.name, avatar: p.avatar })));
  const [newName, setNewName] = useState('');
  const [roles, setRoles] = useState<MafiaRole[] | null>(null);
  const [game, setGame] = useState<MafiaState | null>(null);
  const [reveal, setReveal] = useState<{ i: number; shown: boolean } | null>(null);
  const dispatch = (a: MafiaAction) => setGame((g) => g && mafiaReducer(g, a));

  const n = names.length;
  const roleList = roles && roles.length === n ? roles : n >= MIN_PLAYERS ? suggestRoles(n) : [];

  const start = () => {
    tap(50);
    setGame(newGame(names, roleList));
    setReveal({ i: 0, shown: false });
  };

  if (game) {
    if (reveal) {
      const p = game.players[reveal.i];
      const next = () => { tap(); setReveal(reveal.i + 1 < game.players.length ? { i: reveal.i + 1, shown: false } : null); };
      return (
        <Shell title="توزيع الكروت" onBack={onQuit}>
          <div className="text-center text-sm text-muted-foreground font-bold">{reveal.i + 1} / {game.players.length}</div>
          {!reveal.shown ? (
            <div className="card-game text-center">
              <div className="text-6xl mb-4">{p.avatar}</div>
              <p className="text-muted-foreground mb-6">أعطِ الجوال لـ <span className="text-primary font-bold">{p.name}</span></p>
              <button onClick={() => { tap(50); setReveal({ ...reveal, shown: true }); }} className="w-full btn-primary-game text-lg">👀 أنا {p.name}، وريني كرتي</button>
            </div>
          ) : (
            <>
              <RoleCard me={p} players={game.players} />
              <button onClick={next} className="w-full btn-secondary-game">🙈 خبّيت كرتي، التالي</button>
            </>
          )}
        </Shell>
      );
    }
    return <NarratorView s={game} dispatch={dispatch} onQuit={onQuit} onRestart={() => { setGame(null); setRoles(null); }} />;
  }

  const add = () => {
    const name = newName.trim();
    if (!name || names.some((x) => x.name === name)) return;
    tap(); setNames([...names, { name, avatar: AVATAR_OPTIONS[n % AVATAR_OPTIONS.length] }]); setNewName(''); setRoles(null);
  };

  return (
    <Shell title="المافيا (جوال واحد)" onBack={onQuit}
      footer={<button onClick={start} disabled={n < MIN_PLAYERS} className="w-full btn-primary-game text-xl disabled:opacity-50 disabled:cursor-not-allowed">
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
      {n >= MIN_PLAYERS && <RoleEditor n={n} roles={roleList} setRoles={setRoles} />}
    </Shell>
  );
};

export default MafiaLocal;
