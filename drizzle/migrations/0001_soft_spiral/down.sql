-- Down migration for: 0001_soft_spiral
-- Generated: User creation trigger rollback
--
-- This file reverses the trigger and function created for automatic user profile creation
-- Review carefully before executing in production

-- Drop the trigger first (must be dropped before the function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();
