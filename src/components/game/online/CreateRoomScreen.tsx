import React, { useState } from 'react';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { useSettings } from '@/context/SettingsContext';
import { useSavedGroups } from '@/hooks/useSavedGroups';
import { ArrowRight, Users, Skull, Clock, Loader2, FolderOpen } from 'lucide-react';
import { AVATAR_OPTIONS } from '@/context/GameContext';
import { categoryNames, Category } from '@/data/words';
import OnlineRestartButton from './OnlineRestartButton';
import GroupManagementModal from '../GroupManagementModal';
import { SavedPlayer } from '@/hooks/useSavedPlayers';

const categoryOptions = Object.entries(categoryNames)
  .filter(([id]) => id !== 'custom')
  .map(([id, name]) => ({ id: id as Category, name, icon: name.split(' ')[1] || '🎲' }));

const CreateRoomScreen: React.FC = () => {
  const { setScreen, createRoom } = useOnlineGame();
  const { playSound, vibrate } = useSettings();
  const { groups } = useSavedGroups();
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [playerCount, setPlayerCount] = useState(4);
  const [imposterCount, setImposterCount] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['random']);
  const [discussionTime, setDiscussionTime] = useState(90);
  const [discussionTimeEnabled, setDiscussionTimeEnabled] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ name: string; members: SavedPlayer[] } | null>(null);

  const handleCreate = async () => {
    if (!name.trim() || isCreating) return;
    
    playSound('click');
    vibrate(50);
    setIsCreating(true);

    const success = await createRoom(name.trim(), avatar, {
      playerCount,
      imposterCount,
      categories: selectedCategories,
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

  const handleSelectGroup = (members: SavedPlayer[]) => {
    setSelectedGroup({ name: '', members });
    setPlayerCount(members.length);
    playSound('click');
    vibrate(50);
  };

  const handleClearGroup = () => {
    playSound('click');
    vibrate(30);
    setSelectedGroup(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-6 py-4">
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
        <div className="flex-1 overflow-auto space-y-4 px-6 pb-56">
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

          {/* Avatar Selection - Hidden for now */}

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

          {/* Group Selection */}
          <div className="card-game">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <FolderOpen className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="font-bold">مجموعة سريعة</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedGroup ? `${selectedGroup.members.length} لاعبين` : 'لتحديد عدد اللاعبين بسرعة'}
                </p>
              </div>
            </div>
            
            {selectedGroup ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {selectedGroup.members.map((member, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary/20 rounded-lg text-xs flex items-center gap-1"
                    >
                      {member.avatar} {member.name}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => {
                    playSound('click');
                    vibrate(30);
                    setShowGroupsModal(true);
                  }}
                  className="w-full py-2 bg-secondary rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  اختر مجموعة ثانية 🔄
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Show existing groups directly */}
                {groups.length > 0 ? (
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => {
                          handleSelectGroup(group.members);
                        }}
                        className="w-full p-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors text-right"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {group.members.length} لاعبين
                          </span>
                          <span className="font-medium">{group.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2 justify-end">
                          {group.members.slice(0, 5).map((m, i) => (
                            <span key={i} className="text-sm">{m.avatar}</span>
                          ))}
                          {group.members.length > 5 && (
                            <span className="text-xs text-muted-foreground">+{group.members.length - 5}</span>
                          )}
                        </div>
                      </button>
                    ))}
                    
                    {/* Create/manage groups button */}
                    <button
                      onClick={() => {
                        playSound('click');
                        vibrate(30);
                        setShowGroupsModal(true);
                      }}
                      className="w-full py-3 mt-2 border-2 border-primary/40 rounded-xl text-primary font-medium hover:bg-primary/10 hover:border-primary transition-all flex items-center justify-center gap-2"
                    >
                      <FolderOpen size={18} />
                      إدارة المجموعات ⚙️
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      playSound('click');
                      vibrate(30);
                      setShowGroupsModal(true);
                    }}
                    className="w-full py-3 border-2 border-dashed border-muted-foreground/30 rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <FolderOpen size={18} />
                    إنشاء مجموعة جديدة
                  </button>
                )}
              </div>
            )}
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

          {/* Category - Multi-Select */}
          <div className="card-game">
            <label className="block text-sm font-medium mb-2">
              الفئة {selectedCategories.includes('random') 
                ? '(كل الفئات)' 
                : selectedCategories.length > 1 
                  ? `(${selectedCategories.length} فئات)` 
                  : ''}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                const isRandom = cat.id === 'random';
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playSound('click');
                      vibrate(30);
                      // Toggle category logic
                      if (isRandom) {
                        setSelectedCategories(['random']);
                      } else if (selectedCategories.includes('random')) {
                        setSelectedCategories([cat.id]);
                      } else if (isSelected) {
                        if (selectedCategories.length > 1) {
                          setSelectedCategories(selectedCategories.filter(c => c !== cat.id));
                        }
                      } else {
                        setSelectedCategories([...selectedCategories, cat.id]);
                      }
                    }}
                    className={`p-3 rounded-xl text-sm font-medium transition-all relative ${
                      isSelected
                        ? isRandom
                          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                          : 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {isSelected && !isRandom && (
                      <span className="absolute top-1 left-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                    {cat.icon} {cat.name}
                  </button>
                );
              })}
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

        {/* Sticky Buttons */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="w-full max-w-md mx-auto space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleJoinInstead}
                className="flex-1 p-3 rounded-xl bg-secondary border border-primary/30 hover:bg-primary/20 hover:border-primary transition-all text-center"
              >
                <span className="text-primary font-bold text-sm">انضم لغرفة ←</span>
              </button>
              
              <button
                onClick={handleCreate}
                disabled={!name.trim() || isCreating}
                className={`flex-1 p-3 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-primary-foreground font-bold text-sm transition-all ${
                  !name.trim() || isCreating ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
                }`}
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-1">
                    <Loader2 className="animate-spin" size={16} />
                    جاري...
                  </span>
                ) : (
                  '🚀 إنشاء الغرفة'
                )}
              </button>
            </div>
            
            <div className="flex justify-center">
              <OnlineRestartButton />
            </div>
          </div>
        </div>
      </div>

      {/* Groups Modal */}
      <GroupManagementModal
        isOpen={showGroupsModal}
        onClose={() => setShowGroupsModal(false)}
        onSelectGroup={handleSelectGroup}
      />
    </div>
  );
};

export default CreateRoomScreen;
