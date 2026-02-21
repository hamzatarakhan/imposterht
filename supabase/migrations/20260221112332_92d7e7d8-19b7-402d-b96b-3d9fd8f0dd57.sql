
-- Fix security definer view by making it security invoker
ALTER VIEW public.public_guessing_rooms SET (security_invoker = on);
