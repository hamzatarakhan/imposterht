import React, { useEffect } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { Trophy, Skull, Home, RotateCcw } from 'lucide-react';


const OnlineResultScreen: React.FC = () => {
  const { room, players, currentPlayer, leaveRoom, resetOnlineGame } = useOnlineGame();
  const { playSound, vibrate } = useSettings();

  const isWinner = room?.winner === 'players' 
    ? !currentPlayer?.is_imposter 
    : currentPlayer?.is_imposter;

  // Sound and vibration on result
  useEffect(() => {
    if (isWinner) {
      playSound('click');
      vibrate(100);
    } else {
      vibrate(200);
    }
  }, [isWinner, playSound, vibrate]);

  const handlePlayAgain = () => {
    playSound('click');
    vibrate(50);
    resetOnlineGame();
  };

  const handleLeave = async () => {
    playSound('click');
    vibrate(50);
    await leaveRoom();
  };

  // Sort players by votes
  const sortedPlayers = [...players].sort((a, b) => b.votes - a.votes);
  const mostVoted = sortedPlayers[0];
  const imposters = players.filter(p => p.is_imposter);

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 ${
        room?.winner === 'players'
          ? 'bg-gradient-to-br from-background via-accent/10 to-background'
          : 'bg-gradient-to-br from-background via-imposter/10 to-background'
      }`} />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        {/* Winner Announcement */}
        <div className="mb-8 animate-reveal">
          {room?.winner === 'players' ? (
            <>
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center glow-accent">
                <Trophy className="text-accent" size={48} />
              </div>
              <h1 className="text-4xl font-black text-accent mb-2">
                🎉 فاز اللاعبون!
              </h1>
              <p className="text-muted-foreground">
                تم كشف الإمبوستر!
              </p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-imposter/20 flex items-center justify-center glow-imposter">
                <Skull className="text-imposter" size={48} />
              </div>
              <h1 className="text-4xl font-black text-imposter mb-2">
                😈 فاز الإمبوستر!
              </h1>
              <p className="text-muted-foreground">
                ما قدروا يكتشفوه!
              </p>
            </>
          )}
        </div>

        {/* Personal Result */}
        <div className={`card-game mb-6 ${
          isWinner ? 'bg-accent/20 border-accent' : 'bg-imposter/20 border-imposter'
        }`}>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">{currentPlayer?.avatar}</span>
            <div>
              <p className="font-bold">{currentPlayer?.name}</p>
              <p className={`text-sm ${isWinner ? 'text-accent' : 'text-imposter'}`}>
                {isWinner ? '🎊 أنت فزت!' : '😢 خسرت هالمرة'}
              </p>
            </div>
          </div>
        </div>

        {/* Secret Word */}
        <div className="card-game mb-6">
          <p className="text-sm text-muted-foreground mb-2">الكلمة السرية كانت</p>
          <span className="text-3xl font-black text-gradient">{room?.secret_word}</span>
        </div>

        {/* Most Voted */}
        <div className="card-game mb-6 w-full max-w-sm">
          <p className="text-sm text-muted-foreground mb-3">الأكثر تصويتاً</p>
          <div className="flex items-center justify-center gap-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              mostVoted?.is_imposter ? 'bg-imposter' : 'bg-secondary'
            }`}>
              <span className="text-2xl">{mostVoted?.avatar}</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{mostVoted?.name}</p>
              <p className="text-sm text-muted-foreground">
                {mostVoted?.votes} أصوات
                {mostVoted?.is_imposter && (
                  <span className="text-imposter mr-2">😈 إمبوستر!</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Imposters Reveal */}
        <div className="card-game mb-8 w-full max-w-sm">
          <p className="text-sm text-muted-foreground mb-3">
            😈 الإمبوستر{imposters.length > 1 ? 'ز' : ''}
          </p>
          <div className="flex justify-center gap-4">
            {imposters.map((imposter) => (
              <div key={imposter.id} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-imposter flex items-center justify-center mb-1">
                  <span className="text-xl">{imposter.avatar}</span>
                </div>
                <span className="text-sm font-medium">{imposter.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={handlePlayAgain}
            className="w-full btn-primary-game text-xl"
          >
            <span className="flex items-center justify-center gap-2">
              <RotateCcw size={20} />
              العب مرة ثانية
            </span>
          </button>
          
          <button
            onClick={handleLeave}
            className="w-full p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={20} />
            الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineResultScreen;
