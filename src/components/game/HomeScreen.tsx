import React, { useState, useEffect, useRef } from "react";
import { useGame, AVATAR_OPTIONS } from "@/context/GameContext";
import { useSettings } from "@/context/SettingsContext";
import { Play, HelpCircle, Settings, Users, X, Trash2, Plus, Download, QrCode, Smartphone, Video, FolderOpen, ArrowRight } from "lucide-react";
import { useSavedPlayers } from "@/hooks/useSavedPlayers";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useSavedGroups } from "@/hooks/useSavedGroups";
import QRCodeModal from "./QRCodeModal";
import VideoTutorialModal from "./VideoTutorialModal";
import GroupManagementModal from "./GroupManagementModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const HomeScreen: React.FC = () => {
  const { setScreen } = useGame();
  const { playSound, vibrate } = useSettings();
  const { savedPlayers, addPlayers, removePlayer, clearAllPlayers } = useSavedPlayers();
  const { isInstallable, installApp } = usePWAInstall();
  const { groups } = useSavedGroups();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showInstallSteps, setShowInstallSteps] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerAvatar, setNewPlayerAvatar] = useState("👤");
  const hasPlayedWelcome = useRef(false);

  type DeviceType = "ios" | "android" | "desktop";
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  // Play welcome sound when entering home screen
  useEffect(() => {
    if (!hasPlayedWelcome.current) {
      hasPlayedWelcome.current = true;
      setTimeout(() => {
        playSound('welcome');
        vibrate(30);
      }, 300);
    }
  }, [playSound, vibrate]);

  React.useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType("ios");
    } else if (/android/.test(userAgent)) {
      setDeviceType("android");
    } else {
      setDeviceType("desktop");
    }
  }, []);

  const iosSteps = [
    { step: 1, icon: "🧭", text: "افتح الرابط في Safari" },
    { step: 2, icon: "📤", text: "اضغط على زر المشاركة (أسفل الشاشة)" },
    { step: 3, icon: "➕", text: 'اختر "إضافة إلى الشاشة الرئيسية"' },
    { step: 4, icon: "✅", text: 'اضغط "إضافة" للتأكيد' },
  ];

  const androidSteps = [
    { step: 1, icon: "🌐", text: "افتح الرابط في Chrome" },
    { step: 2, icon: "⋮", text: "اضغط على القائمة (ثلاث نقاط)" },
    { step: 3, icon: "📲", text: 'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"' },
    { step: 4, icon: "✅", text: 'اضغط "تثبيت" للتأكيد' },
  ];

  const desktopSteps = [
    { step: 1, icon: "🌐", text: "افتح الرابط في Chrome أو Edge" },
    { step: 2, icon: "📥", text: "ابحث عن أيقونة التثبيت في شريط العنوان" },
    { step: 3, icon: "✅", text: 'اضغط "تثبيت" للتأكيد' },
  ];

  const getSteps = () => {
    if (deviceType === "ios") return iosSteps;
    if (deviceType === "android") return androidSteps;
    return desktopSteps;
  };

  const getDeviceLabel = () => {
    if (deviceType === "ios") return "التثبيت على iPhone";
    if (deviceType === "android") return "التثبيت على Android";
    return "التثبيت على الكمبيوتر";
  };

  const appUrl = "https://imposterht.lovable.app";

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
      setNewPlayerName("");
      setNewPlayerAvatar("👤");
      if (!keepOpen) {
        setShowAddPlayerDialog(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-40 h-40 bg-imposter/10 rounded-full blur-3xl" />

      {/* Header Icons */}
      <div className="relative z-10 flex justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => { playSound('click'); vibrate(30); setScreen('hub'); }}
            className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight size={24} />
          </button>
          <button
            onClick={() => {
              playSound('click');
              vibrate(30);
              setScreen("settings");
            }}
            className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings size={24} />
          </button>
          <button
            onClick={() => {
              playSound('click');
              vibrate(30);
              setShowQRModal(true);
            }}
            className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <QrCode size={24} />
          </button>
          <button
            onClick={() => {
              playSound('click');
              vibrate(30);
              setShowGroupsModal(true);
            }}
            className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors relative"
          >
            <FolderOpen size={24} />
            {groups.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                {groups.length}
              </span>
            )}
          </button>
        </div>

        {/* Saved Players Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors relative">
              <Users size={24} />
              {savedPlayers.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                  {savedPlayers.length}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-[220px] bg-card/95 backdrop-blur-md border-border/50 rounded-xl"
          >
            <DropdownMenuLabel className="text-muted-foreground flex items-center gap-2">
              👥 اللاعبين المحفوظين
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Add New Player Button */}
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2 text-primary"
              onSelect={() => setShowAddPlayerDialog(true)}
            >
              <Plus size={16} />
              إضافة لاعب جديد
            </DropdownMenuItem>
            {savedPlayers.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="max-h-[200px] overflow-y-auto">
                  {savedPlayers.map((player) => (
                    <DropdownMenuItem
                      key={player.name}
                      className="flex items-center justify-between cursor-default"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="flex items-center gap-2">
                        <span>{player.avatar}</span>
                        <span>{player.name}</span>
                      </span>
                      <button
                        onClick={(e) => handleRemovePlayer(e, player.name)}
                        className="p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer flex items-center gap-2"
                  onSelect={() => setShowDeleteAllDialog(true)}
                >
                  <Trash2 size={16} />
                  مسح الكل
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} url={appUrl} />

      {/* Video Tutorial Modal */}
      <VideoTutorialModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} />

      {/* Groups Management Modal */}
      <GroupManagementModal 
        isOpen={showGroupsModal} 
        onClose={() => setShowGroupsModal(false)} 
      />

      {/* Add Player Dialog */}
      <Dialog open={showAddPlayerDialog} onOpenChange={setShowAddPlayerDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">➕ إضافة لاعب جديد</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 sm:gap-4 py-3 sm:py-4">
            {/* Avatar Picker */}
            <button
              onClick={() => {
                playSound('click');
                const currentIndex = AVATAR_OPTIONS.indexOf(newPlayerAvatar);
                const nextIndex = (currentIndex + 1) % AVATAR_OPTIONS.length;
                setNewPlayerAvatar(AVATAR_OPTIONS[nextIndex]);
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl sm:text-3xl hover:scale-110 transition-transform"
            >
              {newPlayerAvatar}
            </button>
            <p className="text-xs text-muted-foreground">اضغط لتغيير الأفاتار</p>

            {/* Name Input */}
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value.slice(0, 20))}
              placeholder="اسم اللاعب"
              maxLength={20}
              className="w-full text-center text-lg sm:text-xl font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddPlayer(false);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">{newPlayerName.length}/20 حرف</p>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => {
                  playSound('click');
                  vibrate(30);
                  handleAddPlayer(false);
                }}
                disabled={!newPlayerName.trim()}
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                ✅ حفظ وإغلاق
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  vibrate(30);
                  handleAddPlayer(true);
                }}
                disabled={!newPlayerName.trim()}
                className="w-full py-3 px-4 rounded-xl bg-secondary text-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
              >
                ➕ حفظ وإضافة آخر
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">🗑️ مسح كل الأسماء؟</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              هل أنت متأكد من مسح كل الأسماء المحفوظة؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:gap-2 justify-center sm:justify-end">
            <AlertDialogCancel className="flex-1 sm:flex-none m-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="flex-1 sm:flex-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              نعم، امسح الكل
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
            <p className="text-sm text-muted-foreground mt-1">اتبع الخطوات التالية</p>
          </DialogHeader>

          <div className="space-y-3 my-4">
            {getSteps().map((item) => (
              <div key={item.step} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">الخطوة {item.step}</p>
                  <p className="text-sm font-medium text-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowInstallSteps(false)}
            className="w-full py-3 px-4 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-colors"
          >
            فهمت! 👍
          </button>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Logo with Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/40 backdrop-blur-sm mb-3">
            <span className="text-2xl">😈</span>
            <h1 className="text-xl font-black text-gradient">IMPOSTER</h1>
          </div>
          <p className="text-xs text-muted-foreground">لعبة الإمبوستر الجماعية</p>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => {
              playSound('click');
              vibrate(50);
              setScreen("modeSelect");
            }}
            className="w-full btn-primary-game flex items-center justify-center gap-3 text-xl"
          >
            <Play size={28} fill="currentColor" />
            ابدأ لعبة جديدة
          </button>

          <button
            onClick={() => {
              playSound('click');
              vibrate(30);
              setScreen("howToPlay");
            }}
            className="w-full btn-secondary-game flex items-center justify-center gap-3"
          >
            <HelpCircle size={24} />
            طريقة اللعب
          </button>

          <button
            onClick={() => {
              playSound('click');
              vibrate(30);
              setShowVideoModal(true);
            }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-imposter/80 to-primary/60 text-foreground font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg border border-primary/20"
          >
            <Video size={24} />
            شاهد فيديو الشرح 🎬
          </button>

          <button
            onClick={() => {
              playSound('click');
              vibrate(30);
              setShowInstallSteps(true);
            }}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-accent to-primary/80 text-accent-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Download size={20} />
            كيف أضيف التطبيق للشاشة الرئيسية؟
          </button>

          {isInstallable && (
            <button
              onClick={() => {
                playSound('click');
                vibrate(50);
                installApp();
              }}
              className="w-full py-3 px-6 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg"
            >
              <Download size={24} />
              تثبيت التطبيق
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-4 space-y-2">
        <p className="text-sm text-muted-foreground">العبوا مع بعض في نفس المكان 🎮</p>
        <p className="text-xs text-muted-foreground">
          Powered by <span className="text-primary font-bold">Hamza Tarkhan</span>
        </p>
        <div className="flex flex-col items-center gap-1">
          <a
            href="mailto:Hamzatarakhan2000@gmail.com"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-primary transition-colors"
          >
            ✉️ Hamzatarakhan2000@gmail.com
          </a>
          <a
            href="https://instagram.com/hamza_tarakhan_"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-primary transition-colors"
          >
            📸 @hamza_tarakhan_
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
