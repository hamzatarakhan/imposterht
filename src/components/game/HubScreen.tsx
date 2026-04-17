import React, { useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { useOnlineGuessing } from "@/context/OnlineGuessingContext";
import { useCountries } from "@/context/CountriesGameContext";
import { useSettings } from "@/context/SettingsContext";
import { Settings, QrCode, Users, FolderOpen, Download, Plus, X, Trash2, Smartphone, Info } from "lucide-react";
import { useSavedPlayers } from "@/hooks/useSavedPlayers";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useSavedGroups } from "@/hooks/useSavedGroups";
import { AVATAR_OPTIONS } from "@/context/GameContext";
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

const games = [
  {
    id: "imposter",
    name: "الإمبوستر",
    icon: "😈",
    description: "اكشف المندس بينكم!",
    gradient: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/30",
    accent: "text-red-500",
    players: "3-10 لاعبين",
    duration: "10-20 دقيقة",
    mode: "محلي (تمرير الجهاز)",
    howToPlay: [
      { icon: "📱", text: "كل لاعب بدوره بياخد الجهاز ويشوف دوره بالسر" },
      { icon: "🤫", text: "أغلب اللاعبين بيشوفوا نفس الكلمة، بس واحد (أو أكثر) هو 'المندس' وما بيشوفها" },
      { icon: "💬", text: "بتبلش جلسة نقاش، كل لاعب بيوصف الكلمة بكلمة وحدة بدون ما يفضحها" },
      { icon: "🗳️", text: "بعد النقاش، كل لاعب بيصوّت على اللي بشك إنه المندس" },
      { icon: "🎯", text: "إذا انكشف المندس، بصير عنده فرصة يخمّن الكلمة من 4 خيارات وينقذ نفسه" },
    ],
    tips: [
      "اختر كلمات وصفك دقيقة بس مش واضحة",
      "إذا انت المندس، ركّز على ردود الباقيين عشان تخمّن الكلمة",
      "تقدر تختار أكتر من فئة كلمات بنفس الوقت",
    ],
  },
  {
    id: "guessing",
    name: "التخمين",
    icon: "🤔",
    description: "احزر كلمة خصمك قبل ما يحزر كلمتك!",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    accent: "text-blue-500",
    players: "لاعبين فقط (1 ضد 1)",
    duration: "5-15 دقيقة",
    mode: "أونلاين (غرفة برابط)",
    howToPlay: [
      { icon: "🔗", text: "المضيف بيعمل غرفة وبيختار الفئة (أشياء، رياضة، دول، أكل، أو الكل)" },
      { icon: "📤", text: "بيشير الرابط لخصمه وبفوت معه بالغرفة" },
      { icon: "🎲", text: "كل لاعب بيطلعله كلمة عشوائية من الفئة المختارة (الخصم ما بيشوفها)" },
      { icon: "❓", text: "بتبدأوا تسألوا بعض أسئلة جوابها 'نعم' أو 'لا' فقط" },
      { icon: "🚫", text: "ممنوع تكرار سؤال انسأل من قبل، إذا تكرر بنحرق عليك دورك" },
      { icon: "🏆", text: "أول واحد يخمّن كلمة خصمه بفوز الجولة. اللعبة 3 أو 5 أو 7 جولات" },
    ],
    tips: [
      "ابدأ بأسئلة عامة لتصفية الخيارات (هل هو شخص؟ هل هو حي؟)",
      "ركّز على إجابات خصمك واستنتج منها",
      "تقدر تشغل المحادثة الصوتية من الإعدادات",
    ],
  },
  {
    id: "countries",
    name: "الدول",
    icon: "🌍",
    description: "ابنوا اسم دولة حرف بحرف!",
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
    accent: "text-green-500",
    players: "لاعبين أو أكثر",
    duration: "غير محدد",
    mode: "جلسة جماعية (أدمن + متابعين)",
    howToPlay: [
      { icon: "👑", text: "في 'أدمن' بيدير الجلسة وبضيف اللاعبين من لوحة التحكم، وبشير رابط متابعة للحضور" },
      { icon: "🔤", text: "كل لاعب بدوره بقول حرف واحد، والمجموعة عم تبني اسم دولة حرف بحرف" },
      { icon: "❤️", text: "كل لاعب عنده 3 أرواح، وبخسر روح بحالتين أساسيتين 👇" },
      { icon: "❌", text: "الحالة الأولى: إذا غلط بالحرف أو ما عرف يكمّل اسم دولة صحيحة" },
      { icon: "🕵️", text: "الحالة الثانية (التشييك): تقدر تشك على اللي قبلك إنه عم يركّب حروف عشوائي. بتقله 'شيّك!'" },
      { icon: "⚖️", text: "إذا طلع كان فعلاً ببالو دولة صحيحة → انت بتخسر روح. إذا ما كان ببالو شي وكان بيركّب → هو بخسر روح" },
      { icon: "🔥", text: "أي دولة اتذكرت بصير اسمها 'محروق' وما بتنفع تتكرر بنفس الجلسة" },
      { icon: "🔄", text: "التبديل: لما لاعب جوا اللعبة يتفاعل مع لاعب برا (يحكي معه، يرد عليه، يناديه)، اللي برا بفوت مكانو بنفس عدد أرواحو المتبقية" },
      { icon: "💡", text: "مثال: إبراهيم جوا ومعه روحين، حمزة برا. حمزة ناداه وإبراهيم رد عليه → حمزة بفوت مكانو بروحين" },
    ],
    tips: [
      "فكّر منيح قبل ما تشيّك، لأنك ممكن تخسر روح إذا طلع غلط",
      "الأدمن بشوف كل الدول المحروقة وبقدر يرتبها أبجدي أو بالأحدث",
      "اللاعب اللي طلع برا بقدر يرجع للجلسة عبر التبديل (التفاعل مع لاعب جوا)",
      "اللعبة محمية برمز دخول 🔒",
    ],
  },
];

const HubScreen: React.FC = () => {
  const { setScreen } = useGame();
  const { setScreen: setOnlineGuessingScreen } = useOnlineGuessing();
  const { setScreen: setCountriesScreen, createRoom: createCountriesRoom } = useCountries();
  const { playSound, vibrate } = useSettings();
  const { savedPlayers, addPlayers, removePlayer, clearAllPlayers } = useSavedPlayers();
  const { isInstallable, installApp } = usePWAInstall();
  const { groups } = useSavedGroups();

  const [showDeleteAllDialog, setShowDeleteAllDialog] = React.useState(false);
  const [showAddPlayerDialog, setShowAddPlayerDialog] = React.useState(false);
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [showVideoModal, setShowVideoModal] = React.useState(false);
  const [showInstallSteps, setShowInstallSteps] = React.useState(false);
  const [showGroupsModal, setShowGroupsModal] = React.useState(false);
  const [newPlayerName, setNewPlayerName] = React.useState("");
  const [newPlayerAvatar, setNewPlayerAvatar] = React.useState("👤");
  const [infoGameId, setInfoGameId] = React.useState<string | null>(null);
  const infoGame = games.find((g) => g.id === infoGameId);

  const hasPlayedWelcome = useRef(false);

  useEffect(() => {
    if (!hasPlayedWelcome.current) {
      hasPlayedWelcome.current = true;
      setTimeout(() => {
        playSound("welcome");
        vibrate(30);
      }, 300);
    }
  }, [playSound, vibrate]);

  type DeviceType = "ios" | "android" | "desktop";
  const [deviceType, setDeviceType] = React.useState<DeviceType>("desktop");

  React.useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setDeviceType("ios");
    else if (/android/.test(ua)) setDeviceType("android");
    else setDeviceType("desktop");
  }, []);

  const installSteps: Record<DeviceType, { step: number; icon: string; text: string }[]> = {
    ios: [
      { step: 1, icon: "🧭", text: "افتح الرابط في Safari" },
      { step: 2, icon: "📤", text: "اضغط على زر المشاركة (أسفل الشاشة)" },
      { step: 3, icon: "➕", text: 'اختر "إضافة إلى الشاشة الرئيسية"' },
      { step: 4, icon: "✅", text: 'اضغط "إضافة" للتأكيد' },
    ],
    android: [
      { step: 1, icon: "🌐", text: "افتح الرابط في Chrome" },
      { step: 2, icon: "⋮", text: "اضغط على القائمة (ثلاث نقاط)" },
      { step: 3, icon: "📲", text: 'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"' },
      { step: 4, icon: "✅", text: 'اضغط "تثبيت" للتأكيد' },
    ],
    desktop: [
      { step: 1, icon: "🌐", text: "افتح الرابط في Chrome أو Edge" },
      { step: 2, icon: "📥", text: "ابحث عن أيقونة التثبيت في شريط العنوان" },
      { step: 3, icon: "✅", text: 'اضغط "تثبيت" للتأكيد' },
    ],
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
      if (!keepOpen) setShowAddPlayerDialog(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => {
              playSound("click");
              vibrate(30);
              setScreen("settings");
            }}
            className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings size={24} />
          </button>
          <button
            onClick={() => {
              playSound("click");
              vibrate(30);
              setShowQRModal(true);
            }}
            className="p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <QrCode size={24} />
          </button>
        </div>

        {/* Owner contact chip - subtle */}
        <a
          href="tel:0770706289"
          onClick={() => { playSound('click'); vibrate(30); }}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-2xl bg-secondary/50 hover:bg-secondary/80 border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="تواصل مع الـ Owner Hamza Tarakhan"
        >
          <span className="text-sm">💬</span>
          <span className="text-[10px] font-medium leading-tight text-right hidden xs:inline">
            تواصل مع الـ Owner
          </span>
          <span className="text-[10px] font-bold leading-tight" dir="ltr">
            Hamza
          </span>
        </a>
      </div>

      {/* Modals */}
      <QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} url={appUrl} />
      <VideoTutorialModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} />
      <GroupManagementModal isOpen={showGroupsModal} onClose={() => setShowGroupsModal(false)} />

      {/* Add Player Dialog */}
      <Dialog open={showAddPlayerDialog} onOpenChange={setShowAddPlayerDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">➕ إضافة لاعب جديد</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-3">
            <button
              onClick={() => {
                playSound("click");
                const idx = AVATAR_OPTIONS.indexOf(newPlayerAvatar);
                setNewPlayerAvatar(AVATAR_OPTIONS[(idx + 1) % AVATAR_OPTIONS.length]);
              }}
              className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
            >
              {newPlayerAvatar}
            </button>
            <p className="text-xs text-muted-foreground">اضغط لتغيير الأفاتار</p>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value.slice(0, 20))}
              placeholder="اسم اللاعب"
              maxLength={20}
              className="w-full text-center text-lg font-bold py-2.5 px-3 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddPlayer(false);
              }}
            />
            <p className="text-xs text-muted-foreground">{newPlayerName.length}/20 حرف</p>
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => {
                  playSound("click");
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
                  playSound("click");
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

      {/* Delete All Dialog */}
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
          <AlertDialogFooter className="flex-row gap-3 justify-center">
            <AlertDialogCancel className="flex-1 m-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
            {installSteps[deviceType].map((item) => (
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
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3 animate-float">
            <span className="text-6xl drop-shadow-2xl">🎮</span>
          </div>
          <h1 className="text-4xl font-black text-gradient mb-2">فعاليات</h1>
          <p className="text-muted-foreground text-sm">اختر لعبتك وابدأ المرح!</p>
        </div>

        {/* Games Row */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-3 mb-8">
          {games.map((game) => (
            <div
              key={game.id}
              className={`relative flex flex-col rounded-3xl bg-gradient-to-br ${game.gradient} border ${game.border} backdrop-blur-sm shadow-lg overflow-hidden`}
            >
              <button
                onClick={() => {
                  playSound("click");
                  vibrate(50);
                  if (game.id === "guessing") {
                    setOnlineGuessingScreen("guessingCreateRoom");
                  } else if (game.id === "countries") {
                    createCountriesRoom();
                  } else {
                    setScreen("home");
                  }
                }}
                className="flex flex-col items-center gap-1.5 pt-4 pb-2 px-1.5 hover:scale-[1.03] active:scale-95 transition-transform duration-300"
              >
                <span className="text-3xl drop-shadow-lg">{game.icon}</span>
                <span className="text-sm font-bold text-foreground">{game.name}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight px-0.5 min-h-[1.5rem]">
                  {game.description}
                </span>
              </button>
              <button
                onClick={() => {
                  playSound("click");
                  vibrate(20);
                  setInfoGameId(game.id);
                }}
                className="mt-1 mx-2 mb-2 py-1.5 rounded-xl bg-card/60 hover:bg-card/90 active:bg-card border border-border/40 text-[10px] font-bold text-foreground flex items-center justify-center gap-1 transition-colors"
                aria-label={`شرح لعبة ${game.name}`}
              >
                <Info size={11} className={game.accent} />
                <span>كيف تلعب؟</span>
              </button>
            </div>
          ))}
        </div>

        {/* Game Info Modal */}
        <Dialog open={!!infoGameId} onOpenChange={(open) => !open && setInfoGameId(null)}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-3xl p-0 overflow-hidden max-h-[85vh] flex flex-col">
            {infoGame && (
              <>
                {/* Hero header */}
                <div className={`relative bg-gradient-to-br ${infoGame.gradient} border-b ${infoGame.border} px-5 pt-6 pb-5`}>
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-16 h-16 rounded-2xl bg-card/70 backdrop-blur flex items-center justify-center shadow-lg">
                      <span className="text-4xl drop-shadow-lg">{infoGame.icon}</span>
                    </div>
                    <DialogTitle className="text-xl font-black text-foreground">{infoGame.name}</DialogTitle>
                    <p className="text-xs text-muted-foreground">{infoGame.description}</p>
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto px-5 py-4 space-y-4">
                  {/* Quick info chips */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary/50 border border-border/40">
                      <span className="text-base">👥</span>
                      <span className="text-[10px] font-bold text-foreground text-center leading-tight">{infoGame.players}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary/50 border border-border/40">
                      <span className="text-base">⏱️</span>
                      <span className="text-[10px] font-bold text-foreground text-center leading-tight">{infoGame.duration}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary/50 border border-border/40">
                      <span className="text-base">🎮</span>
                      <span className="text-[10px] font-bold text-foreground text-center leading-tight">{infoGame.mode}</span>
                    </div>
                  </div>

                  {/* How to play */}
                  <div>
                    <h3 className={`text-sm font-black mb-2 flex items-center gap-1.5 ${infoGame.accent}`}>
                      📖 طريقة اللعب
                    </h3>
                    <ol className="space-y-2">
                      {infoGame.howToPlay.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-secondary/40 border border-border/30">
                          <div className={`shrink-0 w-7 h-7 rounded-full bg-card flex items-center justify-center text-xs font-black ${infoGame.accent} border ${infoGame.border}`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 flex items-start gap-1.5">
                            <span className="text-base shrink-0 leading-tight">{step.icon}</span>
                            <p className="text-xs text-foreground leading-relaxed flex-1">{step.text}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  <div>
                    <h3 className={`text-sm font-black mb-2 flex items-center gap-1.5 ${infoGame.accent}`}>
                      💡 نصائح
                    </h3>
                    <ul className="space-y-1.5">
                      {infoGame.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
                          <span className="text-xs">✨</span>
                          <p className="text-xs text-muted-foreground leading-relaxed flex-1">{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sticky CTA */}
                <div className="border-t border-border/40 p-3 bg-card/80 backdrop-blur">
                  <button
                    onClick={() => {
                      const id = infoGame.id;
                      setInfoGameId(null);
                      playSound("click");
                      vibrate(50);
                      if (id === "guessing") {
                        setOnlineGuessingScreen("guessingCreateRoom");
                      } else if (id === "countries") {
                        createCountriesRoom();
                      } else {
                        setScreen("home");
                      }
                    }}
                    className={`w-full py-3 rounded-2xl bg-gradient-to-r ${infoGame.gradient} border ${infoGame.border} font-black text-sm text-foreground hover:opacity-90 transition-opacity`}
                  >
                    {infoGame.icon} ابدأ اللعب الآن
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Utility Buttons */}
        <div className="w-full max-w-sm space-y-3">
          {/* Owner contact - subtle */}
          <div className="w-full rounded-2xl bg-card/40 backdrop-blur-sm border border-border/40 p-3 flex items-center gap-3">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-base">
              💬
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground leading-tight mb-0.5">
                لأي استفسار أو اقتراح أو شرح عن أي لعبة
              </p>
              <p className="text-[11px] text-foreground leading-tight">
                تواصل مع الـ Owner <span className="font-bold" dir="ltr">Hamza Tarakhan</span>
              </p>
            </div>
            <a
              href="tel:0770706289"
              onClick={() => { playSound('click'); vibrate(30); }}
              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-[11px] font-black text-primary transition-colors"
              dir="ltr"
            >
              0770706289
            </a>
          </div>

          <button
            onClick={() => {
              playSound("click");
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
                playSound("click");
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

export default HubScreen;
