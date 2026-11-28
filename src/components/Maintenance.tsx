/** Turned on with VITE_MAINTENANCE=1 on Vercel (then redeploy); ?maintenance=1 previews it. */
export const isMaintenance =
  import.meta.env.VITE_MAINTENANCE === "1" ||
  new URLSearchParams(window.location.search).get("maintenance") === "1";

export const Maintenance = () => (
  <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/40 mb-10">
      <span className="text-2xl">🎮</span>
      <span className="text-xl font-black text-gradient">فعاليات</span>
    </div>

    <div className="w-full max-w-xs rounded-3xl bg-card border border-border p-6">
      <div className="text-5xl mb-4">🛠️</div>
      <h1 className="text-xl font-black text-foreground mb-2">شوي صيانة وراجعين</h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
        طرخان بسلم عليك وبقلك: قاعدين نزبّط الموقع عشان يرجع أحلى من قبل. اعمل كاسة شاي وارجعلنا كمان شوي ☕
      </p>
      <p className="text-[11px] text-muted-foreground/70 mb-5">والله ما بنطوّل، وعد أردني 🤞</p>
      <button
        onClick={() => window.location.reload()}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        جرّب كمان مرة 🔄
      </button>
    </div>
  </div>
);
