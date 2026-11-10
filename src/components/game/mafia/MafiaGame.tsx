import React, { useState } from 'react';
import { useGame, AVATAR_OPTIONS } from '@/context/GameContext';
import { useSavedPlayers } from '@/hooks/useSavedPlayers';
import MafiaLocal from './MafiaLocal';
import { MafiaHost, MafiaPlayerScreen, newRoomCode } from './MafiaOnline';
import { Shell, useTap } from './ui';

type Mode =
  | { t: 'menu' }
  | { t: 'local' }
  | { t: 'host'; code: string }
  | { t: 'join'; code: string }
  | { t: 'player'; code: string; name: string; avatar: string };

const SESSION = 'mafia_session';

/** Picks a mode; restores an online session after a refresh, and opens the join form for ?mafia=CODE links. */
function initialMode(): Mode {
  const q = new URLSearchParams(window.location.search).get('mafia');
  if (q) {
    window.history.replaceState({}, '', window.location.pathname);
    return { t: 'join', code: q.toUpperCase() };
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION) || 'null') as Mode | null;
    if (saved && (saved.t === 'host' || saved.t === 'player')) return saved;
  } catch { /* ignore */ }
  return { t: 'menu' };
}

/** True when the page should open straight into Mafia: a ?mafia= join link or an online game to resume. */
export const shouldOpenMafia = () => {
  if (new URLSearchParams(window.location.search).has('mafia')) return true;
  try { return !!sessionStorage.getItem(SESSION); } catch { return false; }
};

const MafiaGame: React.FC = () => {
  const { setScreen } = useGame();
  const tap = useTap();
  const { savedPlayers } = useSavedPlayers();
  const [mode, setModeRaw] = useState<Mode>(initialMode);
  const [name, setName] = useState(savedPlayers[0]?.name ?? '');
  const [avatar, setAvatar] = useState(savedPlayers[0]?.avatar ?? '👤');
  const [code, setCode] = useState('');

  const setMode = (m: Mode) => {
    try { if (m.t === 'host' || m.t === 'player') sessionStorage.setItem(SESSION, JSON.stringify(m)); else sessionStorage.removeItem(SESSION); } catch { /* ignore */ }
    setModeRaw(m);
  };
  const toMenu = () => { tap(); setMode({ t: 'menu' }); };

  if (mode.t === 'local') return <MafiaLocal onQuit={toMenu} />;
  if (mode.t === 'host') return <MafiaHost code={mode.code} onQuit={toMenu} />;
  if (mode.t === 'player') return <MafiaPlayerScreen code={mode.code} name={mode.name} avatar={mode.avatar} onQuit={toMenu} />;

  if (mode.t === 'join') {
    const c = (mode.code || code).trim().toUpperCase();
    const ok = c.length === 5 && name.trim();
    return (
      <Shell title="ادخل غرفة" onBack={toMenu}
        footer={<button disabled={!ok} onClick={() => { tap(50); setMode({ t: 'player', code: c, name: name.trim(), avatar }); }} className="w-full btn-primary-game text-xl disabled:opacity-50">🚪 ادخل</button>}>
        <div className="card-game space-y-3">
          {!mode.code && (
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 5))} placeholder="كود الغرفة" dir="ltr"
              className="w-full text-center text-2xl font-black tracking-[0.3em] py-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none" />
          )}
          {mode.code && <p className="text-center text-sm text-muted-foreground">الغرفة <span className="font-black text-primary" dir="ltr">{mode.code}</span></p>}
          <div className="flex items-center gap-3">
            <button onClick={() => { tap(); setAvatar(AVATAR_OPTIONS[(AVATAR_OPTIONS.indexOf(avatar) + 1) % AVATAR_OPTIONS.length]); }}
              className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl shrink-0" aria-label="غيّر الأفاتار">{avatar}</button>
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 20))} placeholder="اسمك"
              className="flex-1 text-sm font-bold py-2.5 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none" />
          </div>
        </div>
      </Shell>
    );
  }

  const Option: React.FC<{ icon: string; title: string; desc: string; onClick: () => void }> = ({ icon, title, desc, onClick }) => (
    <button onClick={() => { tap(50); onClick(); }} className="w-full card-game !p-4 flex items-center gap-4 text-right hover:scale-[1.01] active:scale-[0.99] transition-transform">
      <span className="text-4xl">{icon}</span>
      <span className="flex-1"><span className="block font-black text-lg">{title}</span><span className="block text-xs text-muted-foreground">{desc}</span></span>
    </button>
  );

  return (
    <Shell onBack={() => { tap(); setScreen('hub'); }}>
      <Option icon="📱" title="جوال واحد" desc="الراوي ماسك الجوال وبيلفّ على الكل يشوفوا كروتهم" onClick={() => setMode({ t: 'local' })} />
      <Option icon="🎙️" title="اعمل غرفة أونلاين" desc="إنت الراوي، وكل لاعب بيلعب من موبايله" onClick={() => setMode({ t: 'host', code: newRoomCode() })} />
      <Option icon="🚪" title="ادخل غرفة" desc="معك كود من الراوي؟ ادخل فيه" onClick={() => setMode({ t: 'join', code: '' })} />
    </Shell>
  );
};

export default MafiaGame;
