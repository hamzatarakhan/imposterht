import React from 'react';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';

const GuessingOnlinePlayScreen: React.FC = () => {
  const { room, players, isHost, markWinner, myWord } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();

  if (!room || players.length < 2) return null;

  const handleWinner = async (playerId: string) => {
    playSound('win'); vibrate([50, 30, 50]);
    await markWinner(playerId);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        <div className="text-sm text-muted-foreground font-bold">
          المواجهة {room.current_round} / {room.total_rounds}
        </div>

        {/* VS */}
        <div className="card-game">
          <div className="flex items-center justify-center gap-6">
            {players.map(p => (
              <div key={p.id} className="text-center">
                <div className="text-4xl mb-2">{p.avatar}</div>
                <p className="font-bold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.wins} فوز</p>
              </div>
            ))}
          </div>
          <div className="text-3xl font-black text-primary text-center my-2">⚔️</div>
        </div>

        {/* My Word Reminder */}
        {myWord && (
          <div className="card-game text-center">
            <p className="text-xs text-muted-foreground mb-1">كلمتك:</p>
            <p className="text-2xl font-black text-primary">{myWord}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="card-game text-center">
          <p className="text-lg font-bold mb-2">🗣️ اسألوا بعض!</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            كل واحد يسأل الثاني أسئلة عن كلمته
            <br />
            أول واحد يحزر كلمة خصمه يفوز! 🏆
          </p>
        </div>

        {/* Winner Buttons - Host Only */}
        {isHost ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-bold text-center">مين حزر أول؟</p>
            {players.map(player => (
              <button key={player.id} onClick={() => handleWinner(player.player_id)}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
                  player.is_host
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-2 border-blue-500/40 text-foreground hover:border-blue-500'
                    : 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/40 text-foreground hover:border-red-500'
                }`}>
                <span className="text-2xl">{player.avatar}</span>
                🏆 {player.name} فاز!
              </button>
            ))}
          </div>
        ) : (
          <div className="card-game text-center">
            <p className="text-muted-foreground animate-pulse">⏳ المضيف يحدد الفائز...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuessingOnlinePlayScreen;
