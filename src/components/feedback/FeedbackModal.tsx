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
  { id: "salat_nabi", label: "صلاة النبي ما عليه حكي", icon: "🤲" },
  { id: "needs_improvement", label: "بدك الصحيح بده شوية تحسين", icon: "🛠️" },
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
  const canSubmit = !!selected && (!needsText || (trimmedLen >= 10 && trimmedLen <= 1000)) && !submitting;

  const handleSelect = (id: FeedbackRating) => {
    playSound("click");
    vibrate(30);
    setSelected(id);
    if (id !== "needs_improvement") setImprovement("");
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selected) return;
    setSubmitting(true);
    try {
      await submitFeedback({
        rating: selected,
        improvement_text: needsText ? improvement : null,
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
          <h2 className="text-xl font-black">رأيك بهمني فوق ما تتصور</h2>
          <p className="text-sm text-muted-foreground">أتظمن فش مهرب بدك تعطينا رأيك يعني بدك تعطينا </p>
        </div>

        <div className="space-y-2">
          {RATINGS.map((r) => {
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

        {needsText && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
            <Textarea
              value={improvement}
              onChange={(e) => setImprovement(e.target.value.slice(0, 1000))}
              placeholder="يلا تفضل اهرج، شو التحسينات؟ شو مشكلتك عشان نرستكلك الأمور 🛠️"
              className="min-h-[110px] text-sm resize-none"
              dir="rtl"
              disabled={submitting}
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{trimmedLen < 10 ? `لازم على الأقل ${10 - trimmedLen} حرف كمان` : "تمام ✓"}</span>
              <span>{improvement.length}/1000</span>
            </div>
          </div>
        )}

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
