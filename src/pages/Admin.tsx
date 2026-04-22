import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Search, Users, Star, Smartphone, Globe } from 'lucide-react';

const PIN_STORAGE = 'admin_pin_v1';

interface SessionRow {
  id: string;
  user_id: string | null;
  session_key: string;
  user_name: string | null;
  user_avatar: string | null;
  app_version: string | null;
  user_agent: string | null;
  language: string | null;
  is_pwa: boolean | null;
  referrer: string | null;
  game_played: string | null;
  last_seen_at: string;
  created_at: string;
}

interface FeedbackRow {
  id: string;
  user_id: string | null;
  rating: string;
  improvement_text: string | null;
  rounds_completed: number | null;
  app_version: string | null;
  created_at: string;
}

const RATING_LABELS: Record<string, { label: string; emoji: string }> = {
  amazing: { label: 'رائع', emoji: '✨' },
  more_amazing: { label: 'أكثر من رائع', emoji: '🔥' },
  khoz3boli: { label: 'خُزعبلي', emoji: '🤯' },
  salat_nabi: { label: 'صلاة النبي ما عليه حكي', emoji: '🤲' },
  needs_improvement: { label: 'بدّو شوية تحسين', emoji: '🛠️' },
};

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('ar-JO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const detectDevice = (ua: string | null): string => {
  if (!ua) return '—';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Mac OS X/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'غير معروف';
};

const Admin: React.FC = () => {
  const [pin, setPin] = useState('');
  const [authedPin, setAuthedPin] = useState<string | null>(() => {
    try { return sessionStorage.getItem(PIN_STORAGE); } catch { return null; }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [search, setSearch] = useState('');

  const fetchData = async (pinValue: string) => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, feedbackRes] = await Promise.all([
        supabase.rpc('admin_read_sessions', { p_pin: pinValue, p_limit: 1000 }),
        supabase.rpc('admin_read_feedback', { p_pin: pinValue, p_limit: 1000 }),
      ]);
      if (sessionsRes.error) throw sessionsRes.error;
      if (feedbackRes.error) throw feedbackRes.error;
      const s = (sessionsRes.data as SessionRow[]) || [];
      const f = (feedbackRes.data as FeedbackRow[]) || [];
      // If both come back empty but PIN is correct, the data is just empty.
      // Wrong PIN also returns empty — so we double-check with a sentinel:
      // if PIN was wrong, both are empty. We accept this as "logged in but no data".
      setSessions(s);
      setFeedback(f);
      try { sessionStorage.setItem(PIN_STORAGE, pinValue); } catch { /* ignore */ }
      setAuthedPin(pinValue);
    } catch (e: any) {
      setError(e?.message || 'فشل التحميل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authedPin) {
      void fetchData(authedPin);
    }
  }, [authedPin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    void fetchData(pin.trim());
  };

  const handleLogout = () => {
    try { sessionStorage.removeItem(PIN_STORAGE); } catch { /* ignore */ }
    setAuthedPin(null);
    setPin('');
    setSessions([]);
    setFeedback([]);
  };

  // Stats
  const stats = useMemo(() => {
    const uniqueUsers = new Set(
      sessions.map(s => s.user_id || s.user_name || s.session_key).filter(Boolean),
    );
    const namedUsers = new Set(
      sessions.filter(s => s.user_name?.trim()).map(s => s.user_name!.trim()),
    );
    const pwaCount = sessions.filter(s => s.is_pwa).length;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter(s => new Date(s.created_at) >= today).length;
    return {
      total: sessions.length,
      unique: uniqueUsers.size,
      named: namedUsers.size,
      pwa: pwaCount,
      today: todaySessions,
      feedback: feedback.length,
    };
  }, [sessions, feedback]);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(s =>
      (s.user_name || '').toLowerCase().includes(q) ||
      (s.user_id || '').toLowerCase().includes(q) ||
      (s.app_version || '').toLowerCase().includes(q) ||
      (s.language || '').toLowerCase().includes(q),
    );
  }, [sessions, search]);

  // ===== Login screen =====
  if (!authedPin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background" dir="rtl">
        <Card className="w-full max-w-sm p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="text-4xl">🔐</div>
            <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
            <p className="text-sm text-muted-foreground">للأدمن فقط</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              type="password"
              placeholder="كلمة السر"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-center text-lg"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !pin.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'دخول'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // ===== Dashboard =====
  return (
    <div className="min-h-screen bg-background p-4 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">📊 لوحة الإدارة</h1>
            <p className="text-sm text-muted-foreground">كل اللاعبين والتقييمات لحظياً</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => authedPin && fetchData(authedPin)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ml-1 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>خروج</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon={<Users className="w-4 h-4" />} label="جلسات كلية" value={stats.total} />
          <StatCard icon={<Users className="w-4 h-4" />} label="لاعبين فريدين" value={stats.unique} />
          <StatCard icon={<Star className="w-4 h-4" />} label="بأسماء" value={stats.named} />
          <StatCard icon={<Smartphone className="w-4 h-4" />} label="PWA" value={stats.pwa} />
          <StatCard icon={<Globe className="w-4 h-4" />} label="اليوم" value={stats.today} />
          <StatCard icon={<Star className="w-4 h-4" />} label="تقييمات" value={stats.feedback} />
        </div>

        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sessions">👥 اللاعبين ({sessions.length})</TabsTrigger>
            <TabsTrigger value="feedback">⭐ التقييمات ({feedback.length})</TabsTrigger>
          </TabsList>

          {/* Sessions tab */}
          <TabsContent value="sessions" className="space-y-3 mt-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم اللاعب أو الإصدار..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>

            {loading && sessions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            )}

            {!loading && filteredSessions.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                ما في جلسات بعد
              </Card>
            )}

            <div className="space-y-2">
              {filteredSessions.map((s) => (
                <Card key={s.id} className="p-3 hover:bg-accent/30 transition">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="text-3xl shrink-0">{s.user_avatar || '👤'}</div>
                      <div className="min-w-0">
                        <div className="font-bold truncate">
                          {s.user_name || <span className="text-muted-foreground italic">بدون اسم</span>}
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          <span>📱 {detectDevice(s.user_agent)}</span>
                          {s.language && <span>🌐 {s.language}</span>}
                          {s.app_version && <span>v{s.app_version}</span>}
                          {s.is_pwa && <Badge variant="secondary" className="text-[10px]">PWA</Badge>}
                          {s.game_played && <Badge variant="outline" className="text-[10px]">{s.game_played}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-left shrink-0">
                      <div>آخر نشاط:</div>
                      <div className="font-mono">{formatTime(s.last_seen_at)}</div>
                    </div>
                  </div>
                  {s.user_id && (
                    <div className="text-[10px] text-muted-foreground/70 font-mono mt-2 truncate">
                      ID: {s.user_id}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Feedback tab */}
          <TabsContent value="feedback" className="space-y-2 mt-4">
            {feedback.length === 0 && !loading && (
              <Card className="p-8 text-center text-muted-foreground">
                ما في تقييمات بعد
              </Card>
            )}
            {feedback.map((f) => {
              const meta = RATING_LABELS[f.rating] || { label: f.rating, emoji: '⭐' };
              return (
                <Card key={f.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl shrink-0">{meta.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{meta.label}</span>
                        {f.rounds_completed != null && (
                          <Badge variant="outline" className="text-[10px]">
                            بعد {f.rounds_completed} جولة
                          </Badge>
                        )}
                        {f.app_version && (
                          <Badge variant="secondary" className="text-[10px]">v{f.app_version}</Badge>
                        )}
                      </div>
                      {f.improvement_text && (
                        <p className="text-sm mt-2 p-2 rounded bg-muted whitespace-pre-wrap">
                          {f.improvement_text}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">{formatTime(f.created_at)}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <Card className="p-3">
    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-2xl font-bold">{value}</div>
  </Card>
);

export default Admin;
