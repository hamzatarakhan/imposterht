import React, { useState } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { ArrowRight, Users, Skull, Clock, Loader2 } from 'lucide-react';
import { AVATAR_OPTIONS } from '@/context/GameContext';
import { categoryNames, Category } from '@/data/words';

const categories = Object.entries(categoryNames)
  .filter(([id]) => id !== 'custom')
  .map(([id, name]) => ({ id, name, icon: name.split(' ')[1] || '🎲' }));

const CreateRoomScreen: React.FC = () => {
  const { setScreen, createRoom } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [playerCount, setPlayerCount] = useState(4);
  const [imposterCount, setImposterCount] = useState(1);
  const [category, setCategory] = useState('random');
  const [discussionTime, setDiscussionTime] = useState(90);
  const [discussionTimeEnabled, setDiscussionTimeEnabled] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || isCreating) return;
    
    playSound('click');
    vibrate(50);
    setIsCreating(true);

    const success = await createRoom(name.trim(), avatar, {
      playerCount,
      imposterCount,
      category,
      discussionTime,
      discussionTimeEnabled,
    });

    if (!success) {
      setIsCreating(false);
      // Handle error
    }
  };

  const handleBack = () => {
    playSound('click');
    vibrate(30);
    setScreen('modeSelect');
  };

  const handleJoinInstead = () => {
    playSound('click');
    vibrate(30);
    setScreen('joinRoom');
  };

  return (
    <div className="min-h-screen flex flex-col p-6 pt-0 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <ArrowRight size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">إنشاء غرفة 🎮</h1>
              <p className="text-sm text-muted-foreground">اعمل غرفة وشارك الكود</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-auto space-y-4 pb-4">
          {/* Name Input */}
          <div className="card-game">
            <label className="block text-sm font-medium mb-2">اسمك</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك..."
              className="w-full p-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary outline-none text-center text-lg"
              maxLength={20}
            />
          </div>

          {/* Avatar Selection */}
          <div className="card-game">
            <label className="block text-sm font-medium mb-2">الأفاتار</label>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  onClick={() => {
                    playSound('click');
                    setAvatar(av);
                  }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    avatar === av
                      ? 'bg-primary scale-110'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Player Count */}
          <div className="card-game">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                <span className="font-medium">عدد اللاعبين</span>
              </div>
              <span className="text-2xl font-bold text-primary">{playerCount}</span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              value={playerCount}
              onChange={(e) => {
                const count = parseInt(e.target.value);
                setPlayerCount(count);
                if (count < 4) setImposterCount(1);
              }}
              className="w-full accent-primary"
            />
          </div>

          {/* Imposter Count */}
          <div className="card-game">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Skull size={18} className="text-imposter" />
                <span className="font-medium">عدد الإمبوسترز</span>
              </div>
              <span className="text-2xl font-bold text-imposter">{imposterCount}</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    playSound('click');
                    setImposterCount(count);
                  }}
                  disabled={playerCount < 4 && count > 1}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                    imposterCount === count
                      ? 'bg-imposter text-white'
                      : playerCount < 4 && count > 1
                      ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="card-game">
            <label className="block text-sm font-medium mb-2">الفئة</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    playSound('click');
                    setCategory(cat.id);
                  }}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    category === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Discussion Time */}
          <div className="card-game">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-accent" />
                <span className="font-medium">وقت النقاش</span>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setDiscussionTimeEnabled(!discussionTimeEnabled);
                }}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  discussionTimeEnabled
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {discussionTimeEnabled ? 'مفعّل' : 'معطّل'}
              </button>
            </div>
            {discussionTimeEnabled && (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={30}
                  max={300}
                  step={30}
                  value={discussionTime}
                  onChange={(e) => setDiscussionTime(parseInt(e.target.value))}
                  className="flex-1 accent-accent"
                />
                <span className="text-lg font-bold w-16 text-left">
                  {Math.floor(discussionTime / 60)}:{(discussionTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 mt-4">
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className={`w-full btn-primary-game text-xl ${
              !name.trim() || isCreating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                جاري الإنشاء...
              </span>
            ) : (
              '🚀 إنشاء الغرفة'
            )}
          </button>
          
          <button
            onClick={handleJoinInstead}
            className="w-full p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors text-center"
          >
            عندك كود؟ <span className="text-primary font-bold">انضم لغرفة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomScreen;
