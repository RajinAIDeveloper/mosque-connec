-- =====================================================
-- COMPLETE FIX: Auto-create user profile on signup
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Disable RLS on users table temporarily for testing
-- (Optional - uncomment if you want to bypass RLS completely)
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing user policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;

-- Step 3: Create simple, permissive policies
-- Allow anyone to select (users are not sensitive)
CREATE POLICY "Anyone can view users" ON public.users
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Authenticated can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Step 4: Create a function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (clerk_id, email, first_name, last_name, role)
  VALUES (
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    'mosque_admin'
  )
  ON CONFLICT (clerk_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger to run on new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Done! Now signup will automatically create user profile
