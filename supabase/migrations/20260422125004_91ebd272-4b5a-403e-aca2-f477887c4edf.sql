-- Create app_feedback table for user ratings
CREATE TABLE public.app_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  rating TEXT NOT NULL,
  improvement_text TEXT,
  app_version TEXT,
  rounds_completed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT app_feedback_rating_check CHECK (rating IN ('amazing','more_amazing','khoz3boli','salat_nabi','needs_improvement')),
  CONSTRAINT app_feedback_improvement_length CHECK (improvement_text IS NULL OR (char_length(improvement_text) >= 10 AND char_length(improvement_text) <= 1000))
);

-- Enable RLS
ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback (Casual Identity model)
CREATE POLICY "Anyone can insert feedback"
  ON public.app_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policies — only service role can read/manage feedback
CREATE INDEX idx_app_feedback_created_at ON public.app_feedback(created_at DESC);
CREATE INDEX idx_app_feedback_rating ON public.app_feedback(rating);