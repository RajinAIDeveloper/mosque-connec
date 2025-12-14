-- =====================================================
-- MOSQUE CONNECT - COMPLETE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: CREATE TABLES
-- =====================================================

-- Users table (synced with auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'community_user' CHECK (role IN ('community_user', 'mosque_admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Mosques table
CREATE TABLE IF NOT EXISTS public.mosques (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  website TEXT,
  image_url TEXT,
  admin_id UUID REFERENCES public.users(id),
  verified BOOLEAN DEFAULT false,
  -- Mobile app fields
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  suspension_reason TEXT,
  women_prayer_allowed BOOLEAN DEFAULT false,
  madhabs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Prayer times table
CREATE TABLE IF NOT EXISTS public.prayer_times (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE CASCADE NOT NULL,
  prayer_name TEXT CHECK (prayer_name IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')) NOT NULL,
  prayer_time TIME NOT NULL,
  date DATE NOT NULL,
  is_jummah BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(mosque_id, date, prayer_name)
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  -- Ticketing fields
  is_paid BOOLEAN DEFAULT false,
  ticket_price NUMERIC(10, 2),
  has_seat_limit BOOLEAN DEFAULT false,
  total_seats INTEGER,
  available_seats INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Charity opportunities table
CREATE TABLE IF NOT EXISTS public.charity_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10, 2),
  current_amount DECIMAL(10, 2) DEFAULT 0,
  end_date TIMESTAMPTZ,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Mosque ratings table
CREATE TABLE IF NOT EXISTS public.mosque_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  admin_reply TEXT,
  admin_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(mosque_id, user_id)
);

-- Mosque followers table
CREATE TABLE IF NOT EXISTS public.mosque_followers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mosque_id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, mosque_id)
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE CASCADE NOT NULL,
  prayer_times BOOLEAN DEFAULT false,
  events BOOLEAN DEFAULT false,
  charity BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, mosque_id)
);

-- Admin requests table
CREATE TABLE IF NOT EXISTS public.admin_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Admin notification settings (for mobile app)
CREATE TABLE IF NOT EXISTS public.admin_notification_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  prayer_reminders BOOLEAN DEFAULT true,
  event_alerts BOOLEAN DEFAULT true,
  new_followers BOOLEAN DEFAULT false,
  new_ratings BOOLEAN DEFAULT true,
  low_rating_alerts BOOLEAN DEFAULT true,
  charity_updates BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- STEP 2: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_mosques_status ON public.mosques(status);
CREATE INDEX IF NOT EXISTS idx_mosques_admin_id ON public.mosques(admin_id);
CREATE INDEX IF NOT EXISTS idx_charity_status ON public.charity_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_mosque_followers_user ON public.mosque_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_mosque_followers_mosque ON public.mosque_followers(mosque_id);
CREATE INDEX IF NOT EXISTS idx_events_mosque ON public.events(mosque_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_ratings_mosque ON public.mosque_ratings(mosque_id);

-- =====================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosque_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosque_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: CREATE RLS POLICIES
-- =====================================================

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_id);

-- Mosques policies
CREATE POLICY "Mosques are viewable by everyone" ON public.mosques
  FOR SELECT USING (true);

CREATE POLICY "Mosque admins can update their mosques" ON public.mosques
  FOR UPDATE USING (admin_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Authenticated users can create mosques" ON public.mosques
  FOR INSERT WITH CHECK (admin_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

-- Prayer times policies
CREATE POLICY "Prayer times are viewable by everyone" ON public.prayer_times
  FOR SELECT USING (true);

CREATE POLICY "Mosque admins can manage prayer times" ON public.prayer_times
  FOR ALL USING (mosque_id IN (SELECT id FROM public.mosques WHERE admin_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text)));

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Mosque admins can manage events" ON public.events
  FOR ALL USING (mosque_id IN (SELECT id FROM public.mosques WHERE admin_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text)));

-- Charity policies
CREATE POLICY "Charity are viewable by everyone" ON public.charity_opportunities
  FOR SELECT USING (true);

CREATE POLICY "Mosque admins can manage charity" ON public.charity_opportunities
  FOR ALL USING (mosque_id IN (SELECT id FROM public.mosques WHERE admin_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text)));

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone" ON public.mosque_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create ratings" ON public.mosque_ratings
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can update own ratings" ON public.mosque_ratings
  FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Mosque admins can reply to ratings" ON public.mosque_ratings
  FOR UPDATE USING (mosque_id IN (SELECT id FROM public.mosques WHERE admin_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text)));

-- Followers policies
CREATE POLICY "Followers viewable by mosque admins" ON public.mosque_followers
  FOR SELECT USING (mosque_id IN (SELECT id FROM public.mosques WHERE admin_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can follow mosques" ON public.mosque_followers
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

-- Notification settings policies
CREATE POLICY "Users can manage own notification settings" ON public.admin_notification_settings
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

-- Admin requests policies
CREATE POLICY "Users can view own requests" ON public.admin_requests
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can create requests" ON public.admin_requests
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

-- =====================================================
-- DONE! Your database is ready.
-- =====================================================
