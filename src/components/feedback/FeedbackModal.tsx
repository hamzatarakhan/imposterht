import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Send, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/context/SettingsContext";
import { submitFeedback, type FeedbackRating } from "@/services/feedbackService";

interface Props {
  open: boolean;
  roundsCompleted: number;
  onSubmitted: () => void;
}

const RATINGS: { id: FeedbackRating; label: string; icon: string }[] = [
  { id: "amazing", label: "رائع", icon: "✨" },
  { id: "more_amazing", label: "أكثر من رائع", icon: "🔥" },
  { id: "khoz3boli", label: "خُزعبلي", icon: "🤯" },
  { id: "salat_nabi", label: "فوق أي تقييم", icon: "💯" },
  { id: "needs_improvement", label: "في عندي شوية اقتراحات ممكن توخد الابليكيشن بحتة تانية ", icon: "🛠️" },
];

const SHARE_URL = "https://imposter.my";
const SHARE_TEXT = "جرب فعاليات — أحلى ألعاب جماعية بتلعبوها مع رفقاتكم! 🔥";

const FeedbackModal: React.FC<Props> = ({ open, roundsCompleted, onSubmitted }) => {
  const { playSound, vibrate } = useSettings();
  const { toast } = useToast();
  const [selected, setSelected] = useState<FeedbackRating | null>(null);
  const [improvement, setImprovement] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRating, setSubmittedRating] = useState<FeedbackRating | null>(null);

  useEffect(() => {
    if (!open) return;

    setSelected(null);
    setImprovement("");
    // Pre-fill name from saved identity if available
    let savedName = "";
    try {
      savedName = localStorage.getItem("user_name") || "";
    } catch {}
    setSubmitterName(savedName);
    setSubmitting(false);
    setSubmittedRating(null);
    vibrate(50);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, vibrate]);

  if (!open) return null;

  const needsText = selected === "needs_improvement";
  const trimmedLen = improvement.trim().length;
  const canSubmit = !!selected && (!needsText || (trimmedLen >= 1 && trimmedLen <= 1000)) && !submitting;

  const handleSelect = (id: FeedbackRating) => {
    playSound("click");
    vibrate(30);
    setSelected(id);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selected) return;
    setSubmitting(true);
    try {
      await submitFeedback({
        rating: selected,
        improvement_text: trimmedLen > 0 ? improvement : null,
        rounds_completed: roundsCompleted,
        submitter_name: submitterName.trim() || null,
      });
      playSound("win");
      vibrate(80);
      setSubmittedRating(selected);
    } catch (err) {
      console.error("Feedback submit failed", err);
      toast({
        title: "ما زبطت 😅",
        description: "في مشكلة بالشبكة، جرّب كمان مرة",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    playSound("click");
    vibrate(30);
    const shareData = {
      title: "فعاليات",
      text: SHARE_TEXT,
      url: SHARE_URL,
    };
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }
      throw new Error("share-unavailable");
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(`${SHARE_TEXT}\n${SHARE_URL}`);
        toast({ title: "تم نسخ الرابط ✓", description: "ابعتله لرفقاتك 💛" });
      } catch {
        toast({
          title: "ما قدرنا ننسخ",
          description: SHARE_URL,
          variant: "destructive",
        });
      }
    }
  };

  const handleClose = () => {
    playSound("click");
    vibrate(30);
    onSubmitted();
  };

  const isPositive = submittedRating !== null && submittedRating !== "needs_improvement";
  const isNegative = submittedRating === "needs_improvement";

  const content = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/85 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="card-game w-full max-w-md my-auto space-y-4 max-h-[95vh] overflow-y-auto">
        {submittedRating === null ? (
          <>
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-black"> !رأيك بهمني فوق ما تتصور</h2>
              <p className="text-sm text-muted-foreground">أتطمن فش مهرب بدك تعطينا رأيك يعني بدك تعطينا </p>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {RATINGS.slice(0, 4).map((r) => {
                  const active = selected === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r.id)}
                      disabled={submitting}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-center transition-all border min-h-[88px] ${
                        active
                          ? "bg-primary text-primary-foreground border-primary scale-[1.02]"
                          : "bg-secondary/50 hover:bg-secondary/80 border-border/50"
                      }`}
                    >
                      <span className="text-2xl">{r.icon}</span>
                      <span className="font-bold text-xs leading-tight">{r.label}</span>
                    </button>
                  );
                })}
              </div>

              {RATINGS.slice(4).map((r) => {
                const active = selected === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r.id)}
                    disabled={submitting}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl text-right transition-all border ${
                      active
                        ? "bg-primary text-primary-foreground border-primary scale-[1.02]"
                        : "bg-secondary/50 hover:bg-secondary/80 border-border/50"
                    }`}
                  >
                    <span className="text-2xl shrink-0">{r.icon}</span>
                    <span className="flex-1 font-bold text-sm">{r.label}</span>
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full border-2 ${
                        active ? "border-primary-foreground bg-primary-foreground/20" : "border-muted-foreground/40"
                      }`}
                    >
                      {active && <span className="block w-full h-full rounded-full bg-primary-foreground/90 scale-50" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <Textarea
                value={improvement}
                onChange={(e) => setImprovement(e.target.value.slice(0, 1000))}
                placeholder={
                  needsText
                    ? "يلا هات احكيلي شو التحسينات ؟ تخيل رح تكون جزء من تطوير الابليكيشن "
                    : "امدحنا شوي عشان نستمر 💛 (اختياري)"
                }
                className="min-h-[110px] text-sm resize-none"
                dir="rtl"
                disabled={submitting}
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {needsText
                    ? trimmedLen < 1
                      ? "اكتب يا فنان اكتب"
                      : "تمام ✓"
                    : "اختياري — بس رأيك بفرق"}
                </span>
                <span>{improvement.length}/1000</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full btn-primary-game flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send size={18} />
                  إرسال
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="text-6xl animate-float">{isPositive ? "🎉" : "😍"}</div>
            <div className="space-y-2">
              <h2 className="text-xl font-black">
                {isPositive ? "اوف ما احسنك خلص ضلك العب ببلاش 💛" : "والله بطلع منك أفكار"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isPositive
                  ? "شارك التطبيق مع صحابك عشان تكمل معروفك"
                  : "ذكرني فيك بعدين عشان أشكرك بعنف 🔫"}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {isPositive && (
                <button
                  onClick={handleShare}
                  className="w-full btn-primary-game flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  🔗 شارك التطبيق
                </button>
              )}
              <button
                onClick={handleClose}
                className={`w-full ${isPositive ? "btn-secondary-game" : "btn-primary-game"}`}
              >
                يلا عاللعبة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default FeedbackModal;
