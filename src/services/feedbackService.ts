import { supabase } from '@/integrations/supabase/client';

export type FeedbackRating =
  | 'amazing'
  | 'more_amazing'
  | 'khoz3boli'
  | 'salat_nabi'
  | 'needs_improvement';

const RATING_LABELS: Record<FeedbackRating, string> = {
  amazing: 'رائع',
  more_amazing: 'أكثر من رائع',
  khoz3boli: 'خُزعبلي',
  salat_nabi: 'فوق أي تقييم',
  needs_improvement: 'في عندي شوية اقتراحات ممكن توخد الابليكيشن بحتة تانية',
};

interface SubmitFeedbackPayload {
  rating: FeedbackRating;
  improvement_text?: string | null;
  rounds_completed?: number | null;
  submitter_name?: string | null;
}

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

const getUserAvatar = (): string | null => {
  try {
    return localStorage.getItem('user_avatar');
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

export const submitFeedback = async ({
  rating,
  improvement_text,
  rounds_completed,
  submitter_name,
}: SubmitFeedbackPayload) => {
  const user_id = getUserId();
  const user_name = getUserName();
  const user_avatar = getUserAvatar();
  const app_version = await getAppVersion();

  const trimmedImprovement = improvement_text?.trim() || null;
  const trimmedSubmitter = submitter_name?.trim() || null;

  const { error } = await supabase.from('app_feedback').insert({
    rating,
    improvement_text: trimmedImprovement,
    rounds_completed: rounds_completed ?? null,
    app_version,
    user_id: user_id || null,
    submitter_name: trimmedSubmitter,
  });

  if (error) throw error;

  // Fire-and-forget email notification (don't block UX if it fails)
  supabase.functions
    .invoke('notify-feedback', {
      body: {
        rating: RATING_LABELS[rating] ?? rating,
        rating_id: rating,
        improvement_text: trimmedImprovement,
        app_version,
        rounds_completed: rounds_completed ?? null,
        created_at: new Date().toISOString(),
        user_id: user_id || null,
        user_name: trimmedSubmitter || user_name || null,
        submitter_name: trimmedSubmitter,
        user_avatar: user_avatar || null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        language: typeof navigator !== 'undefined' ? navigator.language : null,
        page_url: typeof window !== 'undefined' ? window.location.href : null,
      },
    })
    .catch((err) => {
      console.warn('notify-feedback failed (non-blocking):', err);
    });

  return true;
};
