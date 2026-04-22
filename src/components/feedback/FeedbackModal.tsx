import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Send } from "lucide-react";
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

const FeedbackModal: React.FC<Props> = ({ open, roundsCompleted, onSubmitted }) => {
  const { playSound, vibrate } = useSettings();
  const { toast } = useToast();
  const [selected, setSelected] = useState<FeedbackRating | null>(null);
  const [improvement, setImprovement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setSelected(null);
    setImprovement("");
    setSubmitting(false);
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
      });
      playSound("win");
      vibrate(80);
      onSubmitted();
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

  const content = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/85 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="card-game w-full max-w-md my-auto space-y-4 max-h-[95vh] overflow-y-auto">
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
                  ? "اكتبلي ولو حرف 🙏"
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
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default FeedbackModal;
