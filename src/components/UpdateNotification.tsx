import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export const UpdateNotification = () => {
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const [updating, setUpdating] = useState(false);

  if (!updateAvailable || !isStandalone) return null;

  const handleUpdate = () => {
    setUpdating(true);
    applyUpdate();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-[85%] max-w-xs rounded-2xl bg-card border border-border shadow-2xl p-6 text-center animate-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <RefreshCw className={`h-7 w-7 text-primary ${updating ? "animate-spin" : ""}`} />
        </div>

        {/* Text */}
        <h3 className="text-lg font-black text-foreground mb-1">سلام عالزلام 👋</h3>
        <p className="text-sm text-muted-foreground mb-2">
          حمزة طرخان بسلم عليك وبقلك في ابديت جديد، لازم تعمله عشان تكمل تلعب 💪
        </p>
        <p className="text-[11px] text-muted-foreground/70 mb-5">
          (ما في مجال تتجاهله، آسفين 😅)
        </p>

        {/* Button */}
        <button
          onClick={handleUpdate}
          disabled={updating}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {updating ? "جاري التحديث..." : "هات الابديت الأااان 🚀"}
        </button>
      </div>
    </div>
  );
};
