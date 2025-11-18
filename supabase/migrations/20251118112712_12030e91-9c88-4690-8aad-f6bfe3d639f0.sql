-- Add new profile fields for bio, phone and location
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS location text;