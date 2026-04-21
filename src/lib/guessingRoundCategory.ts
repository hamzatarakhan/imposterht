import { GUESSING_CATEGORIES, GuessingCategory } from '@/data/guessingWords';

/**
 * يحسب فئة الجولة الحالية بناءً على قائمة الفئات المختارة وتسلسل الجولات.
 * كل جولة تأخذ فئة من القائمة بترتيب دائري:
 *   round 1 -> categories[0], round 2 -> categories[1], ...
 */
export const getRoundCategoryId = (
  categoriesJson: string | null | undefined,
  currentRound: number
): GuessingCategory => {
  let categories: GuessingCategory[] = ['random'];
  try {
    const parsed = JSON.parse(categoriesJson || '["random"]');
    if (Array.isArray(parsed) && parsed.length > 0) categories = parsed as GuessingCategory[];
  } catch {
    // fallback to random
  }
  const idx = Math.max(0, currentRound - 1);
  return categories[idx % categories.length] || 'random';
};

export const getCategoryMeta = (id: GuessingCategory) => {
  return GUESSING_CATEGORIES.find(c => c.id === id) || GUESSING_CATEGORIES[0];
};
