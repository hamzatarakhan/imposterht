-- Add new column for multiple categories (stored as JSON array)
-- Keep the old category column for backward compatibility

ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS categories text DEFAULT '["random"]';

-- Copy existing single category to new categories array format
UPDATE public.rooms 
SET categories = '["' || category || '"]'
WHERE categories = '["random"]' OR categories IS NULL;