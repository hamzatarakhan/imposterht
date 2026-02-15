import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// In-memory cache to avoid re-generating images for the same word in the same session
const imageCache = new Map<string, string>();

export const useWordImage = (word: string | null | undefined) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!word) return;

    // Check cache first
    if (imageCache.has(word)) {
      setImageUrl(imageCache.get(word)!);
      return;
    }

    setLoading(true);
    setImageUrl(null);

    supabase.functions
      .invoke('generate-word-image', { body: { word } })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error generating word image:', error);
          setLoading(false);
          return;
        }
        if (data?.imageUrl) {
          imageCache.set(word, data.imageUrl);
          setImageUrl(data.imageUrl);
        }
        setLoading(false);
      });
  }, [word]);

  return { imageUrl, loading };
};
