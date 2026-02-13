
-- Add word_guess_options column to store the multiple choice options for imposter word guess
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS word_guess_options text DEFAULT NULL;
