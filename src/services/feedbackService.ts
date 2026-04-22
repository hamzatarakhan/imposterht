import { supabase } from '@/integrations/supabase/client';

export type FeedbackRating =
  | 'amazing'
  | 'more_amazing'
  | 'khoz3boli'
  | 'salat_nabi'
  | 'needs_improvement';

interface SubmitFeedbackPayload {
  rating: FeedbackRating;
  improvement_text?: string | null;
  rounds_completed?: number | null;
}

const RATING_META: Record<FeedbackRating, { label: string; emoji: string }> = {
  amazing: { label: 'رائع', emoji: '✨' },
  more_amazing: { label: 'أكثر من رائع', emoji: '🔥' },
  khoz3boli: { label: 'خُزعبلي', emoji: '🤯' },
  salat_nabi: { label: 'صلاة النبي ما عليه حكي', emoji: '🤲' },
  needs_improvement: { label: 'بدك الصحيح بده شوية تحسين', emoji: '🛠️' },
};

const getUserId = (): string | null => {
  try {
    return localStorage.getItem('user_id');
  } catch {
    return null;
  }
};

const getUserName = (): string | null => {
  try {
    return localStorage.getItem('user_name');
  } catch {
    return null;
  }
};

const getAppVersion = async (): Promise<string | null> => {
  try {
    const res = await fetch('/version.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.version ?? null;
  } catch {
    return null;
  }
};

const formatTimestamp = (): string => {
  try {
    const d = new Date();
    return d.toLocaleString('ar-JO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return new Date().toISOString();
  }
};

export const submitFeedback = async ({
  rating,
  improvement_text,
  rounds_completed,
}: SubmitFeedbackPayload) => {
  const user_id = getUserId();
  const playerName = getUserName();
  const app_version = await getAppVersion();
  const trimmedImprovement = improvement_text?.trim() || null;

  const { data: inserted, error } = await supabase
    .from('app_feedback')
    .insert({
      rating,
      improvement_text: trimmedImprovement,
      rounds_completed: rounds_completed ?? null,
      app_version,
      user_id: user_id || null,
    })
    .select('id')
    .maybeSingle();

  if (error) throw error;

  // Fire-and-forget email notification — never block UX on this
  try {
    const meta = RATING_META[rating];
    const ratingId = inserted?.id ?? crypto.randomUUID();
    void supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'feedback-notification',
        recipientEmail: 'Hamzatarakhan2000@gmail.com',
        idempotencyKey: `feedback-${ratingId}`,
        templateData: {
          ratingLabel: meta.label,
          ratingEmoji: meta.emoji,
          ratingId: rating,
          improvementText: trimmedImprovement,
          playerName: playerName?.trim() || null,
          roundsCompleted: rounds_completed ?? null,
          appVersion: app_version,
          userId: user_id,
          submittedAt: formatTimestamp(),
        },
      },
    });
  } catch (e) {
    // Silent — feedback is already saved in DB
    console.warn('Feedback email notification failed', e);
  }

  return true;
};
