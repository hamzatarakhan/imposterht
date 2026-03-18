import React, { useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { useOnlineGuessing } from '@/context/OnlineGuessingContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { Settings, QrCode, Users, FolderOpen, Download, Plus, X, Trash2, Smartphone } from 'lucide-react';
import { useSavedPlayers } from '@/hooks/useSavedPlayers';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useSavedGroups } from '@/hooks/useSavedGroups';
import { AVATAR_OPTIONS } from '@/context/GameContext';
import QRCodeModal from './QRCodeModal';
import VideoTutorialModal from './VideoTutorialModal';
import GroupManagementModal from './GroupManagementModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const HubScreen: React.FC = () => {
  const { setScreen } = useGame();
  const { setScreen: setOnlineGuessingScreen } = useOnlineGuessing();
  const { playSound, vibrate } = useSettings();
  const { t, language } = useLanguage();
  const { savedPlayers, addPlayers, removePlayer, clearAllPlayers } = useSavedPlayers();
  const { isInstallable, installApp } = usePWAInstall();
  const { groups } = useSavedGroups();

  const [showDeleteAllDialog, setShowDeleteAllDialog] = React.useState(false);
  const [showAddPlayerDialog, setShowAddPlayerDialog] = React.useState(false);
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [showVideoModal, setShowVideoModal] = React.useState(false);
  const [showInstallSteps, setShowInstallSteps] = React.useState(false);
  const [showGroupsModal, setShowGroupsModal] = React.useState(false);
  const [newPlayerName, setNewPlayerName] = React.useState('');
  const [newPlayerAvatar, setNewPlayerAvatar] = React.useState('👤');

  const hasPlayedWelcome = useRef(false);

  useEffect(() => {
    if (!hasPlayedWelcome.current) {
      hasPlayedWelcome.current = true;
      setTimeout(() => {
        playSound('welcome');
        vibrate(30);
      }, 300);
    }
  }, [playSound, vibrate]);

  type DeviceType = 'ios' | 'android' | 'desktop';
  const [deviceType, setDeviceType] = React.useState<DeviceType>('desktop');

  React.useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setDeviceType('ios');
    else if (/android/.test(ua)) setDeviceType('android');
    else setDeviceType('desktop');
  }, []);

  const getStepsKey = () => {
    if (deviceType === 'ios') return 'iosSteps';
    if (deviceType === 'android') return 'androidSteps';
    return 'desktopSteps';
  };

  const stepIcons: Record<string, string[]> = {
    iosSteps: ['🧭', '📤', '➕', '✅'],
    androidSteps: ['🌐', '⋮', '📲', '✅'],
    desktopSteps: ['🌐', '📥', '✅'],
  };

  const getDeviceLabel = () => {
    if (deviceType === 'ios') return t('hub.installOnIphone');
    if (deviceType === 'android') return t('hub.installOnAndroid');
    return t('hub.installOnDesktop');
  };

  const appUrl = 'https://imposterht.lovable.app';

  const handleRemovePlayer = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    removePlayer(name);
  };

  const handleClearAll = () => {
    clearAllPlayers();
    setShowDeleteAllDialog(false);
  };

  const handleAddPlayer = (keepOpen: boolean = false) => {
    const trimmedName = newPlayerName.trim();
    if (trimmedName) {
      addPlayers([{ name: trimmedName, avatar: newPlayerAvatar }]);
      setNewPlayerName('');
      setNewPlayerAvatar('👤');
      if (!keepOpen) setShowAddPlayerDialog(false);
    }
  };

  const games = [
    {
      id: 'imposter',
      name: t('hub.imposter'),
      icon: '😈',
      description: t('hub.imposterDesc'),
      gradient: 'from-red-500/20 to-orange-500/20',
      border: 'border-red-500/30',
    },
    {
      id: 'guessing',
      name: t('hub.guessing'),
      icon: '🤔',
      description: t('hub.guessingDesc'),
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
    },
  ];

  const stepsKey = getStepsKey();
  const stepsArr = t(`hub.${stepsKey}`) as unknown as string[];
  const icons = stepIcons[stepsKey];

  return (
    <div className="min-h-screen flex flex-col p-6 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

      {/* Header Icons */}
      <div className="relative z-10 flex justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => { playSound('click'); vibrate(30); setScreen('settings'); }}
            className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings size={24} />
          </button>
          <button
            onClick={() => { playSound('click'); vibrate(30); setShowQRModal(true); }}
            className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <QrCode size={24} />
          </button>
        </div>
      </div>

      {/* Modals */}
      <QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} url={appUrl} />
      <VideoTutorialModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} />
      <GroupManagementModal isOpen={showGroupsModal} onClose={() => setShowGroupsModal(false)} />

      {/* Add Player Dialog */}
      <Dialog open={showAddPlayerDialog} onOpenChange={setShowAddPlayerDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">➕ {t('hub.addNewPlayer')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-3">
            <button
              onClick={() => {
                playSound('click');
                const idx = AVATAR_OPTIONS.indexOf(newPlayerAvatar);
                setNewPlayerAvatar(AVATAR_OPTIONS[(idx + 1) % AVATAR_OPTIONS.length]);
              }}
              className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
            >
              {newPlayerAvatar}
            </button>
            <p className="text-xs text-muted-foreground">{t('hub.tapToChangeAvatar')}</p>
            <input
              type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value.slice(0, 20))}
              placeholder={t('hub.playerName')} maxLength={20}
              className="w-full text-center text-lg font-bold py-2.5 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
              autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleAddPlayer(false); }}
            />
            <p className="text-xs text-muted-foreground">{newPlayerName.length}/20 {t('hub.charLimit')}</p>
            <div className="w-full flex flex-col gap-2">
              <button onClick={() => { playSound('click'); vibrate(30); handleAddPlayer(false); }} disabled={!newPlayerName.trim()}
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                {t('hub.saveAndClose')}
              </button>
              <button onClick={() => { playSound('click'); vibrate(30); handleAddPlayer(true); }} disabled={!newPlayerName.trim()}
                className="w-full py-3 px-4 rounded-xl bg-secondary text-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors">
                {t('hub.saveAndAddAnother')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Dialog */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">{t('hub.deleteAllNames')}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('hub.deleteAllConfirm')}<br />{t('hub.deleteAllWarn')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 justify-center">
            <AlertDialogCancel className="flex-1 m-0">{t('hub.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('hub.yesDeleteAll')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Install Steps Dialog */}
      <Dialog open={showInstallSteps} onOpenChange={setShowInstallSteps}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-5">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Smartphone size={28} className="text-primary-foreground" />
              </div>
            </div>
            <DialogTitle className="text-lg">{getDeviceLabel()}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{t('hub.followSteps')}</p>
          </DialogHeader>
          <div className="space-y-3 my-4">
            {Array.isArray(stepsArr) && stepsArr.map((text: string, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{icons[idx]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">{t('hub.step')} {idx + 1}</p>
                  <p className="text-sm font-medium text-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowInstallSteps(false)} className="w-full py-3 px-4 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-colors">
            {t('hub.gotIt')}
          </button>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3 animate-float">
            <span className="text-6xl drop-shadow-2xl">🎮</span>
          </div>
          <h1 className="text-4xl font-black text-gradient mb-2">{t('hub.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('hub.subtitle')}</p>
        </div>

        {/* Games Grid */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-8">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                playSound('click');
                vibrate(50);
                if (game.id === 'guessing') {
                  setOnlineGuessingScreen('guessingCreateRoom');
                } else {
                  setScreen('home');
                }
              }}
              className={`flex flex-col items-center gap-3 p-6 rounded-3xl bg-gradient-to-br ${game.gradient} border ${game.border} backdrop-blur-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg`}
            >
              <span className="text-5xl drop-shadow-lg">{game.icon}</span>
              <span className="text-lg font-bold text-foreground">{game.name}</span>
              <span className="text-xs text-muted-foreground text-center leading-relaxed">{game.description}</span>
            </button>
          ))}
        </div>

        {/* Utility Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => { playSound('click'); vibrate(30); setShowInstallSteps(true); }}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-accent to-primary/80 text-accent-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Download size={20} />
            {t('hub.howToAddApp')}
          </button>

          {isInstallable && (
            <button
              onClick={() => { playSound('click'); vibrate(50); installApp(); }}
              className="w-full py-3 px-6 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg"
            >
              <Download size={24} />
              {t('hub.installApp')}
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-4 space-y-2">
        <p className="text-sm text-muted-foreground">{t('hub.playTogether')}</p>
        <p className="text-xs text-muted-foreground">
          {t('hub.poweredBy')} <span className="text-primary font-bold">Hamza Tarkhan</span>
        </p>
        <div className="flex flex-col items-center gap-1">
          <a href="mailto:Hamzatarakhan2000@gmail.com" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-primary transition-colors">
            ✉️ Hamzatarakhan2000@gmail.com
          </a>
          <a href="https://instagram.com/hamza_tarakhan_" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-primary transition-colors">
            📸 @hamza_tarakhan_
          </a>
        </div>
      </div>
    </div>
  );
};

export default HubScreen;
