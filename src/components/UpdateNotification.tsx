import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { RefreshCw, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export const UpdateNotification = () => {
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const [dismissed, setDismissed] = useState(false);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!updateAvailable || dismissed) return;
    const timer = setTimeout(() => setDismissed(true), 8000);
    return () => clearTimeout(timer);
  }, [updateAvailable, dismissed]);

  if (!updateAvailable || !isStandalone || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-card p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-5 w-5 text-primary animate-spin" style={{ animationDuration: '3s' }} />
        <span className="text-sm font-medium text-foreground">
          يوجد تحديث جديد متاح!
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={applyUpdate}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          تحديث الآن
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
