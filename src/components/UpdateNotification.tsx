import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

export const UpdateNotification = () => {
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || !isStandalone || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-[85%] max-w-xs rounded-2xl bg-card border border-border shadow-2xl p-6 text-center animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 left-3 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <RefreshCw className="h-7 w-7 text-primary" />
        </div>

        {/* Text */}
        <h3 className="text-lg font-black text-foreground mb-1">سلام عالزلام 👋</h3>
        <p className="text-sm text-muted-foreground mb-5">
          حمزة طرخان بسلم عليك وبقلك في ابديت جديد، شو رأيك تعمل ابديت؟
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setDismissed(true); applyUpdate(); }}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            هات الابديت دلعني 🚀
          </button>
          <button
            onClick={handleDismiss}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            مش وقته خلص بعدين 😴
          </button>
        </div>
      </div>
    </div>
  );
};
