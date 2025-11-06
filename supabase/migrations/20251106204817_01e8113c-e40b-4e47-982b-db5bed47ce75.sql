-- Ensure profiles table has all required columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'name') THEN
    ALTER TABLE public.profiles ADD COLUMN name TEXT;
  END IF;
END $$;

-- Ensure user_subscriptions table has all required columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_subscriptions' AND column_name = 'expires_at') THEN
    ALTER TABLE public.user_subscriptions ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add comments to force type regeneration
COMMENT ON TABLE public.profiles IS 'User profile information';
COMMENT ON TABLE public.user_subscriptions IS 'User subscription data';